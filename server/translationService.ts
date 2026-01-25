import { invokeLLM } from "./_core/llm";
import { translateLegalDocument, detectDocumentType } from "./contextAwareTranslation";
import { searchDocuments } from "./databaseSearch";
import { analyzeDocumentQuality, getDocumentQualityScore, type SectionScore } from "./qualityScoring";

interface TranslationOptions {
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  customGlossary?: Array<{ source: string; target: string }>;
  documentType?: string;
}

/**
 * Translate legal document using context-aware translation with legal corpus
 */
export async function translateDocument(
  options: TranslationOptions
): Promise<{ 
  translatedText: string; 
  confidence: number;
  qualityScore?: {
    overall: number;
    confidence: "high" | "medium" | "low";
    factors: {
      terminologyMatch: number;
      corpusSimilarity: number;
      complexity: number;
    };
    details: string;
    sections?: SectionScore[];
  };
}> {
  const { sourceText, sourceLang, targetLang, customGlossary, documentType } = options;

  // Detect document type if not provided
  const detectedType = documentType || detectDocumentType(sourceText);

  // Search for similar documents in the corpus for context
  const corpusExamples = await findCorpusExamples(sourceText, sourceLang, targetLang, detectedType);

  // Build custom glossary context
  let glossaryContext = "";
  if (customGlossary && customGlossary.length > 0) {
    glossaryContext = `\n\n**Custom Terminology (MUST use these exact translations):**\n${customGlossary
      .map((term) => `- "${term.source}" → "${term.target}"`)
      .join("\n")}`;
  }

  // Build corpus context from similar documents
  let corpusContext = "";
  if (corpusExamples.length > 0) {
    corpusContext = `\n\n**Reference Examples from Legal Corpus:**\n${corpusExamples
      .slice(0, 3)
      .map((ex, i) => `Example ${i + 1}: ${ex.title}\nSource: ${ex.source}\nExcerpt: ${ex.excerpt.substring(0, 200)}...`)
      .join("\n\n")}`;
  }

  try {
    // Use the context-aware translation engine
    let translatedText = await translateLegalDocument(
      sourceText,
      sourceLang,
      targetLang,
      detectedType
    );

    // Apply custom glossary replacements if provided
    if (customGlossary && customGlossary.length > 0) {
      translatedText = applyCustomGlossary(translatedText, customGlossary, sourceLang, targetLang);
    }

    // Calculate confidence based on response quality indicators
    const confidence = calculateConfidence(translatedText, sourceText);

    // Analyze translation quality with detailed scoring
    const sectionScores = analyzeDocumentQuality(
      sourceText,
      translatedText,
      sourceLang,
      targetLang,
      customGlossary?.length || 0,
      corpusExamples.length
    );

    const qualityScore = getDocumentQualityScore(sectionScores);

    return {
      translatedText,
      confidence,
      qualityScore: {
        ...qualityScore,
        sections: sectionScores
      }
    };
  } catch (error) {
    console.error("[Translation Service] Error:", error);
    throw new Error("Translation failed");
  }
}

/**
 * Find similar documents in the corpus for context
 */
async function findCorpusExamples(
  sourceText: string,
  sourceLang: string,
  targetLang: string,
  documentType: string
): Promise<Array<{ title: string; source: string; excerpt: string }>> {
  try {
    // Extract key terms from source text for search
    const searchTerms = extractKeyTerms(sourceText);
    
    // Search the database for similar documents
    const results = await searchDocuments(searchTerms, {
      document_type: documentType !== "general" ? documentType : undefined
    });

    return results.map((doc: any) => ({
      title: doc.title,
      source: doc.source,
      excerpt: doc.content_summary || ""
    }));
  } catch (error) {
    console.error("[Corpus Search] Error:", error);
    return [];
  }
}

/**
 * Extract key terms from text for corpus search
 */
function extractKeyTerms(text: string): string {
  // Simple extraction - take first 100 words
  const words = text.split(/\s+/).slice(0, 100);
  return words.join(" ");
}

/**
 * Apply custom glossary replacements to translated text
 */
function applyCustomGlossary(
  text: string,
  glossary: Array<{ source: string; target: string }>,
  sourceLang: string,
  targetLang: string
): string {
  let result = text;
  
  // Apply each glossary term replacement
  for (const term of glossary) {
    // Create regex for case-insensitive matching
    const regex = new RegExp(term.source, "gi");
    result = result.replace(regex, term.target);
  }
  
  return result;
}

/**
 * Calculate translation confidence score (0-100)
 */
function calculateConfidence(translatedText: string, sourceText: string): number {
  let score = 100;

  // Penalize if translation is too short compared to source
  const lengthRatio = translatedText.length / sourceText.length;
  if (lengthRatio < 0.5 || lengthRatio > 2.0) {
    score -= 20;
  }

  // Penalize if translation contains English words (for non-English targets)
  const englishWordPattern = /\b[a-zA-Z]{4,}\b/g;
  const englishWords = translatedText.match(englishWordPattern);
  if (englishWords && englishWords.length > sourceText.split(/\s+/).length * 0.1) {
    score -= 15;
  }

  // Penalize if translation is empty or too short
  if (translatedText.length < 50) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Translate document in chunks for large texts
 */
export async function translateLargeDocument(
  options: TranslationOptions,
  onProgress?: (progress: number) => void
): Promise<{ 
  translatedText: string; 
  confidence: number;
  qualityScore?: {
    overall: number;
    confidence: "high" | "medium" | "low";
    factors: {
      terminologyMatch: number;
      corpusSimilarity: number;
      complexity: number;
    };
    details: string;
  };
}> {
  const { sourceText } = options;
  const maxChunkSize = 3000; // characters per chunk

  // If text is small enough, translate directly
  if (sourceText.length <= maxChunkSize) {
    return translateDocument(options);
  }

  // Split into chunks by paragraphs
  const paragraphs = sourceText.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const para of paragraphs) {
    if ((currentChunk + para).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + para;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  // Translate each chunk
  const translatedChunks: string[] = [];
  let totalConfidence = 0;

  for (let i = 0; i < chunks.length; i++) {
    const result = await translateDocument({
      ...options,
      sourceText: chunks[i],
    });

    translatedChunks.push(result.translatedText);
    totalConfidence += result.confidence;

    if (onProgress) {
      onProgress(((i + 1) / chunks.length) * 100);
    }
  }

  return {
    translatedText: translatedChunks.join("\n\n"),
    confidence: Math.round(totalConfidence / chunks.length),
  };
}
