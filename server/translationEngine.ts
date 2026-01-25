/**
 * Redesigned Translation Engine
 * Focus: 100% target language output with proper transliteration
 */

import { invokeLLM } from "./_core/llm";
import { getTransliterationRules } from "./transliteration";
import { searchCorpus } from "./corpusSearch";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TranslationOptions {
  text: string;
  sourceLang: string;
  targetLang: string;
  documentType?: string;
}

interface TranslationResult {
  translatedText: string;
  confidence: number;
}

/**
 * Load legal terminology for the target language
 */
function loadLegalTerminology(targetLang: string): Record<string, string> {
  try {
    const termPath = join(__dirname, "data", "legal_terminology.json");
    const data = JSON.parse(readFileSync(termPath, "utf-8"));
    
    const terms: Record<string, string> = {};
    for (const term of data.terms) {
      if (term.translations[targetLang]) {
        terms[term.english] = term.translations[targetLang];
      }
    }
    return terms;
  } catch (error) {
    console.error("Failed to load legal terminology:", error);
    return {};
  }
}

/**
 * Get corpus examples for few-shot learning
 */
async function getCorpusExamples(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  try {
    const similarDocs = await searchCorpus({ text, language: targetLang, limit: 2 });
    
    if (similarDocs.length === 0) {
      return "";
    }

    let examples = "\n\nREFERENCE EXAMPLES from similar legal documents:\n";
    similarDocs.forEach((doc: any, idx: number) => {
      const preview = doc.content.substring(0, 200);
      examples += `\nExample ${idx + 1} (${doc.language}):\n${preview}...\n`;
    });
    
    return examples;
  } catch (error) {
    console.error("Failed to get corpus examples:", error);
    return "";
  }
}

/**
 * Build the translation prompt with explicit transliteration instructions
 */
async function buildTranslationPrompt(options: TranslationOptions): Promise<string> {
  const { text, sourceLang, targetLang, documentType } = options;

  // Load terminology
  const terminology = loadLegalTerminology(targetLang);
  const termList = Object.entries(terminology)
    .slice(0, 10)
    .map(([eng, trans]) => `- ${eng} → ${trans}`)
    .join("\n");

  // Get corpus examples
  const corpusExamples = await getCorpusExamples(text, sourceLang, targetLang);

  // Get transliteration rules
  const transliterationRules = getTransliterationRules(targetLang);

  const systemPrompt = `You are an expert legal translator specializing in Indian regional languages. Your task is to translate legal documents with the precision and cultural awareness of an experienced human interpreter.

${transliterationRules}

LEGAL TERMINOLOGY (use these exact translations):
${termList}

${corpusExamples}

TRANSLATION REQUIREMENTS:
1. **100% Target Language Output**: The entire translation must be in ${targetLang} script. NO English words should remain.
2. **Transliterate Everything**: Names, addresses, company names, place names - ALL must be written in ${targetLang} script using phonetic transliteration.
3. **Preserve Structure**: Maintain document formatting, numbering, paragraphs, and sections exactly as in the original.
4. **Legal Accuracy**: Use appropriate legal terminology and maintain the formal tone of legal documents.
5. **Cultural Adaptation**: Follow regional conventions for how legal documents are written in ${targetLang}.
6. **No Omissions**: Translate every single word, including names and addresses.

EXAMPLES OF CORRECT TRANSLITERATION:
- If you see "John Smith", write it in ${targetLang} script (phonetically)
- If you see "123 Main Street", write "123" and "Main Street" in ${targetLang} script
- If you see "ABC Corporation", write it in ${targetLang} script

Document Type: ${documentType || "General Legal Document"}
Source Language: ${sourceLang}
Target Language: ${targetLang}

Translate the following text:`;

  return systemPrompt;
}

/**
 * Main translation function
 */
export async function translateDocument(
  options: TranslationOptions
): Promise<TranslationResult> {
  try {
    const systemPrompt = await buildTranslationPrompt(options);

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: options.text },
      ],
    });

    const content = response.choices[0].message.content;
    const translatedText = typeof content === 'string' ? content : '';

    // Calculate confidence based on output quality
    const confidence = calculateConfidence(translatedText, options.targetLang);

    return {
      translatedText,
      confidence,
    };
  } catch (error) {
    console.error("Translation failed:", error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Calculate translation confidence
 * Checks if English words remain in the output (should be 0 for good translation)
 */
function calculateConfidence(translatedText: string, targetLang: string): number {
  if (targetLang === "english") {
    return 95; // Always high for English
  }

  // Check for remaining English words (basic heuristic)
  const englishWordPattern = /\b[A-Za-z]{3,}\b/g;
  const englishWords = (translatedText as string).match(englishWordPattern) || [];
  
  // Filter out numbers and common abbreviations
  const actualEnglishWords = englishWords.filter(word => {
    return !["Ltd", "Pvt", "Inc", "LLC", "Dr", "Mr", "Mrs", "Ms"].includes(word);
  });

  // Calculate confidence: fewer English words = higher confidence
  const englishWordCount = actualEnglishWords.length;
  const totalWords = translatedText.split(/\s+/).length;
  const englishRatio = englishWordCount / Math.max(totalWords, 1);

  // Confidence decreases with more English words remaining
  const confidence = Math.max(0, Math.min(100, 100 - (englishRatio * 200)));

  return Math.round(confidence);
}
