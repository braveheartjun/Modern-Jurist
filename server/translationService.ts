import { invokeLLM } from "./_core/llm";

interface TranslationOptions {
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  customGlossary?: Array<{ source: string; target: string }>;
  documentType?: string;
}

/**
 * Translate legal document using LLM with legal terminology enhancement
 */
export async function translateDocument(
  options: TranslationOptions
): Promise<{ translatedText: string; confidence: number }> {
  const { sourceText, sourceLang, targetLang, customGlossary, documentType } = options;

  // Build glossary context
  let glossaryContext = "";
  if (customGlossary && customGlossary.length > 0) {
    glossaryContext = `\n\nIMPORTANT TERMINOLOGY MAPPINGS (use these exact translations):\n${customGlossary
      .map((term) => `- "${term.source}" → "${term.target}"`)
      .join("\n")}`;
  }

  // Build system prompt with legal expertise
  const systemPrompt = `You are an expert legal translator specializing in Indian law with deep knowledge of legal terminology in English, Hindi, and Marathi.

Your task is to translate legal documents with the highest accuracy, preserving:
1. Legal terminology precision
2. Formal tone and structure
3. Clause numbering and formatting
4. Case law references and citations

${documentType ? `Document Type: ${documentType}` : ""}${glossaryContext}

CRITICAL RULES:
- Maintain legal accuracy above all else
- Use formal court-standard language
- Preserve all numbers, dates, and proper nouns
- Keep section/clause structure intact
- If a term has a standard legal translation, use it consistently`;

  const userPrompt = `Translate the following legal document from ${sourceLang} to ${targetLang}:

${sourceText}

Provide ONLY the translated text without any explanations or notes.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const translatedText = typeof content === 'string' ? content : '';

    // Calculate confidence based on response quality indicators
    const confidence = calculateConfidence(translatedText, sourceText);

    return {
      translatedText,
      confidence,
    };
  } catch (error) {
    console.error("[Translation Service] Error:", error);
    throw new Error("Translation failed");
  }
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
): Promise<{ translatedText: string; confidence: number }> {
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
