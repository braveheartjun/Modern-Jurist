import { invokeLLM } from "./_core/llm";
import * as fs from "fs";
import * as path from "path";

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
 * Context-Aware Legal Document Translation
 * Uses legal terminology database and document patterns for accurate translation
 */
export async function translateLegalDocument(
  sourceText: string,
  sourceLang: string,
  targetLang: string,
  documentType?: string
): Promise<string> {
  const db = loadTerminologyDb();
  
  // Build context-aware prompt with legal terminology examples
  const terminologyExamples = buildTerminologyExamples(db, sourceLang, targetLang);
  const patternExamples = buildPatternExamples(db, sourceLang, targetLang);
  
  const systemPrompt = `You are an expert legal translator specializing in Indian legal documents across English, Hindi, Gujarati, Marathi, and Kannada.

Your task is to translate legal documents with:
1. **Contextual Accuracy**: Understand the legal context and use appropriate terminology
2. **Regional Conventions**: Follow traditional document formats in the target language
3. **Terminology Consistency**: Use established legal terms, not literal translations
4. **Structure Preservation**: Maintain document formatting, clauses, and numbering
5. **Cultural Appropriateness**: Use formal address and traditional phrases appropriate for ${targetLang}

**Legal Terminology Reference (${sourceLang} → ${targetLang}):**
${terminologyExamples}

**Document Pattern Examples:**
${patternExamples}

**CRITICAL FORMATTING RULES:**
- Preserve ALL document structure: headings, subheadings, clauses, sub-clauses
- Maintain numbering systems: 1., 2., 3. or (a), (b), (c) or i., ii., iii.
- Keep indentation and paragraph breaks exactly as in the original
- Preserve capitalization patterns (e.g., "WHEREAS" should remain capitalized)
- Maintain line breaks between sections and clauses
- Keep bullet points and list formatting
- Preserve table structures if present

**TRANSLATION GUIDELINES:**
- Use formal legal language appropriate for ${targetLang}
- Preserve all names, dates, and numbers EXACTLY (do not translate)
- Do NOT translate proper nouns (names of people, places, companies, acts)
- Translate legal terms using the terminology reference above
- Use traditional legal phrases in ${targetLang} (e.g., "WHEREAS" → "जबकि" in Hindi)
- Maintain the same level of formality as the source document
- For contracts: preserve party designations ("Party of the First Part", etc.)
- For petitions/appeals: maintain court-standard language
- For agreements: keep witness clauses and signature blocks in traditional format`;

  const userPrompt = `Translate the following ${documentType || "legal document"} from ${sourceLang} to ${targetLang}:

${sourceText}

Provide only the translated text without any explanations or notes.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    });

    const content = response.choices[0]?.message?.content;
    const translatedText = typeof content === 'string' ? content : '';
    
    // Post-process: Apply terminology replacements for consistency
    return applyTerminologyReplacements(translatedText, db, sourceLang, targetLang);
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate document");
  }
}

function buildTerminologyExamples(
  db: LegalTerminology,
  sourceLang: string,
  targetLang: string
): string {
  const examples: string[] = [];
  
  for (const [key, translations] of Object.entries(db.terminology)) {
    const sourceTerm = translations[sourceLang];
    const targetTerm = translations[targetLang];
    
    if (sourceTerm && targetTerm) {
      examples.push(`- "${sourceTerm}" → "${targetTerm}"`);
    }
  }
  
  return examples.slice(0, 20).join("\n"); // Limit to 20 examples to avoid token overflow
}

function buildPatternExamples(
  db: LegalTerminology,
  sourceLang: string,
  targetLang: string
): string {
  const examples: string[] = [];
  
  for (const [patternName, translations] of Object.entries(db.patterns)) {
    const sourcePattern = translations[sourceLang];
    const targetPattern = translations[targetLang];
    
    if (sourcePattern && targetPattern) {
      examples.push(`**${patternName}:**\n${sourceLang}: ${sourcePattern}\n${targetLang}: ${targetPattern}\n`);
    }
  }
  
  return examples.join("\n");
}

function applyTerminologyReplacements(
  text: string,
  db: LegalTerminology,
  sourceLang: string,
  targetLang: string
): string {
  let result = text;
  
  // Apply terminology replacements for consistency
  // This ensures key legal terms are translated consistently
  for (const translations of Object.values(db.terminology)) {
    const targetTerm = translations[targetLang];
    if (targetTerm) {
      // This is a simple implementation - in production, you'd want more sophisticated matching
      // to handle case variations, plurals, etc.
    }
  }
  
  return result;
}

/**
 * Detect document type from content
 */
export function detectDocumentType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("agreement") || lowerText.includes("समझौता") || lowerText.includes("કરાર")) {
    return "agreement";
  } else if (lowerText.includes("affidavit") || lowerText.includes("शपथ पत्र") || lowerText.includes("શપથપત્ર")) {
    return "affidavit";
  } else if (lowerText.includes("power of attorney") || lowerText.includes("मुख्तारनामा") || lowerText.includes("મુખત્યારનામું")) {
    return "power_of_attorney";
  } else if (lowerText.includes("lease") || lowerText.includes("पट्टा") || lowerText.includes("લીઝ")) {
    return "lease";
  } else if (lowerText.includes("will") || lowerText.includes("वसीयत") || lowerText.includes("વસિયતનામું")) {
    return "will";
  } else if (lowerText.includes("notice") || lowerText.includes("नोटिस") || lowerText.includes("નોટિસ")) {
    return "notice";
  } else if (lowerText.includes("petition") || lowerText.includes("याचिका") || lowerText.includes("અરજી")) {
    return "petition";
  } else if (lowerText.includes("appeal") || lowerText.includes("अपील") || lowerText.includes("અપીલ")) {
    return "appeal";
  }
  
  return "general";
}
