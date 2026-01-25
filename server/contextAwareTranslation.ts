import { invokeLLM } from "./_core/llm";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LegalTerminology {
  metadata: {
    version: string;
    languages: string[];
    total_terms: number;
    total_patterns: number;
  };
  terminology: Record<string, Record<string, string>>;
  patterns: Record<string, Record<string, string>>;
}

// Load legal terminology database
let terminologyDb: LegalTerminology | null = null;

function loadTerminologyDb(): LegalTerminology {
  if (terminologyDb) return terminologyDb;
  
  const dbPath = path.join(__dirname, "data", "legal_terminology.json");
  const data = fs.readFileSync(dbPath, "utf-8");
  terminologyDb = JSON.parse(data);
  return terminologyDb!;
}

/**
 * Simplified Context-Aware Legal Document Translation
 * Uses a focused approach with essential legal terminology guidance
 */
export async function translateLegalDocument(
  sourceText: string,
  sourceLang: string,
  targetLang: string,
  documentType?: string
): Promise<string> {
  const db = loadTerminologyDb();
  
  // Build a concise terminology reference (top 10 most common terms only)
  const terminologyRef = buildConciseTerminologyRef(db, sourceLang, targetLang);
  
  const systemPrompt = `You are an expert legal translator specializing in Indian legal documents across English, Hindi, Gujarati, Marathi, and Kannada.

**Your Task:**
Translate legal documents with precision, maintaining legal terminology accuracy, formal tone, and document structure.

**Key Legal Terms (${sourceLang} → ${targetLang}):**
${terminologyRef}

**Critical Rules:**
1. Use formal court-standard language appropriate for ${targetLang}
2. Preserve ALL document structure: headings, numbering (1., 2., (a), (b), i., ii.), indentation, line breaks
3. Keep capitalization patterns (e.g., "WHEREAS" stays capitalized)
4. DO NOT translate: proper nouns, names, dates, numbers, company names, act names
5. Use traditional legal phrases in ${targetLang} (refer to key terms above)
6. Maintain the same level of formality as the source document

**Document Type:** ${documentType || "Legal Document"}`;

  const userPrompt = `Translate from ${sourceLang} to ${targetLang}:

${sourceText}

Provide ONLY the translated text without explanations.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const content = response.choices[0]?.message?.content;
    const translatedText = typeof content === 'string' ? content.trim() : '';
    
    return translatedText;
  } catch (error) {
    console.error("[Context-Aware Translation] Error:", error);
    throw new Error("Translation failed");
  }
}

/**
 * Build a concise terminology reference with only the most important terms
 * This prevents overwhelming the LLM with too much information
 */
function buildConciseTerminologyRef(
  db: LegalTerminology,
  sourceLang: string,
  targetLang: string
): string {
  const sourceLangKey = sourceLang.toLowerCase();
  const targetLangKey = targetLang.toLowerCase();
  
  // Get top 10 most common legal terms
  const priorityTerms = [
    "agreement", "contract", "whereas", "party", "witness",
    "petition", "court", "plaintiff", "defendant", "hereby"
  ];
  
  const examples: string[] = [];
  
  for (const termKey of priorityTerms) {
    const translations = db.terminology[termKey];
    if (translations && translations[sourceLangKey] && translations[targetLangKey]) {
      examples.push(`- "${translations[sourceLangKey]}" → "${translations[targetLangKey]}"`);
    }
    
    if (examples.length >= 10) break;
  }
  
  // Add a few common patterns
  const patternKeys = Object.keys(db.patterns).slice(0, 3);
  for (const patternKey of patternKeys) {
    const pattern = db.patterns[patternKey];
    if (pattern && pattern[sourceLangKey] && pattern[targetLangKey]) {
      examples.push(`- "${pattern[sourceLangKey]}" → "${pattern[targetLangKey]}"`);
    }
  }
  
  return examples.length > 0 
    ? examples.join("\n")
    : "No specific terminology mappings available.";
}

/**
 * Count how many legal terms from the database appear in the text
 * Used for quality scoring
 */
export function countTerminologyMatches(
  text: string,
  sourceLang: string
): number {
  const db = loadTerminologyDb();
  const sourceLangKey = sourceLang.toLowerCase();
  let matches = 0;
  
  const textLower = text.toLowerCase();
  
  for (const termKey in db.terminology) {
    const term = db.terminology[termKey][sourceLangKey];
    if (term && textLower.includes(term.toLowerCase())) {
      matches++;
    }
  }
  
  return matches;
}

/**
 * Detect document type from content
 */
export function detectDocumentType(text: string): string {
  const textLower = text.toLowerCase();
  
  if (textLower.includes("agreement") || textLower.includes("contract")) {
    return "Agreement/Contract";
  }
  if (textLower.includes("petition") || textLower.includes("petitioner")) {
    return "Petition";
  }
  if (textLower.includes("appeal") || textLower.includes("appellant")) {
    return "Appeal";
  }
  if (textLower.includes("memorandum") || textLower.includes("memo")) {
    return "Memorandum";
  }
  if (textLower.includes("application")) {
    return "Application";
  }
  
  return "Legal Document";
}
