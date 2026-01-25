/**
 * Transliteration Module
 * Handles phonetic transliteration of names, addresses, and proper nouns
 * to target Indian language scripts
 */

export interface TransliterationRule {
  pattern: RegExp;
  replacement: string;
}

// Transliteration mappings for Indian languages
const TRANSLITERATION_MAPS: Record<string, Record<string, string>> = {
  hindi: {
    // Vowels
    a: "अ",
    aa: "आ",
    i: "इ",
    ii: "ई",
    u: "उ",
    uu: "ऊ",
    e: "ए",
    ai: "ऐ",
    o: "ओ",
    au: "औ",
    // Consonants
    k: "क",
    kh: "ख",
    g: "ग",
    gh: "घ",
    ch: "च",
    chh: "छ",
    j: "ज",
    jh: "झ",
    t: "ट",
    th: "ठ",
    d: "ड",
    dh: "ढ",
    n: "ण",
    p: "प",
    ph: "फ",
    b: "ब",
    bh: "भ",
    m: "म",
    y: "य",
    r: "र",
    l: "ल",
    v: "व",
    w: "व",
    sh: "श",
    s: "स",
    h: "ह",
  },
  gujarati: {
    // Similar mappings for Gujarati script
    a: "અ",
    aa: "આ",
    i: "ઇ",
    ii: "ઈ",
    u: "ઉ",
    uu: "ઊ",
    e: "એ",
    ai: "ઐ",
    o: "ઓ",
    au: "ઔ",
    k: "ક",
    kh: "ખ",
    g: "ગ",
    gh: "ઘ",
    ch: "ચ",
    chh: "છ",
    j: "જ",
    jh: "ઝ",
    t: "ટ",
    th: "ઠ",
    d: "ડ",
    dh: "ઢ",
    n: "ણ",
    p: "પ",
    ph: "ફ",
    b: "બ",
    bh: "ભ",
    m: "મ",
    y: "ય",
    r: "ર",
    l: "લ",
    v: "વ",
    w: "વ",
    sh: "શ",
    s: "સ",
    h: "હ",
  },
  marathi: {
    // Marathi uses Devanagari script (same as Hindi)
    a: "अ",
    aa: "आ",
    i: "इ",
    ii: "ई",
    u: "उ",
    uu: "ऊ",
    e: "ए",
    ai: "ऐ",
    o: "ओ",
    au: "औ",
    k: "क",
    kh: "ख",
    g: "ग",
    gh: "घ",
    ch: "च",
    chh: "छ",
    j: "ज",
    jh: "झ",
    t: "ट",
    th: "ठ",
    d: "ड",
    dh: "ढ",
    n: "ण",
    p: "प",
    ph: "फ",
    b: "ब",
    bh: "भ",
    m: "म",
    y: "य",
    r: "र",
    l: "ल",
    v: "व",
    w: "व",
    sh: "श",
    s: "स",
    h: "ह",
  },
  kannada: {
    // Kannada script mappings
    a: "ಅ",
    aa: "ಆ",
    i: "ಇ",
    ii: "ಈ",
    u: "ಉ",
    uu: "ಊ",
    e: "ಏ",
    ai: "ಐ",
    o: "ಓ",
    au: "ಔ",
    k: "ಕ",
    kh: "ಖ",
    g: "ಗ",
    gh: "ಘ",
    ch: "ಚ",
    chh: "ಛ",
    j: "ಜ",
    jh: "ಝ",
    t: "ಟ",
    th: "ಠ",
    d: "ಡ",
    dh: "ಢ",
    n: "ಣ",
    p: "ಪ",
    ph: "ಫ",
    b: "ಬ",
    bh: "ಭ",
    m: "ಮ",
    y: "ಯ",
    r: "ರ",
    l: "ಲ",
    v: "ವ",
    w: "ವ",
    sh: "ಶ",
    s: "ಸ",
    h: "ಹ",
  },
};

/**
 * Simple phonetic transliteration for English names/words
 * This is a basic implementation - for production, use a proper transliteration library
 */
export function transliterateWord(word: string, targetLang: string): string {
  if (targetLang === "english") {
    return word;
  }

  const map = TRANSLITERATION_MAPS[targetLang];
  if (!map) {
    return word; // Fallback if language not supported
  }

  // Convert to lowercase for mapping
  const lowerWord = word.toLowerCase();
  let result = "";

  // Simple character-by-character transliteration
  // This is a basic approach - real transliteration needs phonetic rules
  for (let i = 0; i < lowerWord.length; i++) {
    const char = lowerWord[i];
    const nextChar = lowerWord[i + 1];

    // Try two-character combinations first
    const twoChar = char + nextChar;
    if (map[twoChar]) {
      result += map[twoChar];
      i++; // Skip next character
    } else if (map[char]) {
      result += map[char];
    } else {
      // Keep numbers and special characters as-is
      result += char;
    }
  }

  return result;
}

/**
 * Extract proper nouns from text using simple heuristics
 * In production, use NER (Named Entity Recognition) for better accuracy
 */
export function extractProperNouns(text: string): string[] {
  const properNouns: string[] = [];

  // Pattern 1: Capitalized words (likely names)
  const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  properNouns.push(...capitalizedWords);

  // Pattern 2: All caps words (likely acronyms/company names)
  const allCapsWords = text.match(/\b[A-Z]{2,}\b/g) || [];
  properNouns.push(...allCapsWords);

  // Pattern 3: Street addresses (numbers + street names)
  const addresses = text.match(/\d+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Street|Road|Avenue|Lane|Drive|Boulevard)/gi) || [];
  properNouns.push(...addresses);

  // Remove duplicates
  return Array.from(new Set(properNouns));
}

/**
 * Generate transliteration instructions for LLM
 */
export function getTransliterationInstructions(targetLang: string): string {
  const examples: Record<string, string> = {
    hindi: `
Examples of proper transliteration:
- "John Smith" → "जॉन स्मिथ"
- "ABC Corporation" → "एबीसी कॉर्पोरेशन"
- "123 Main Street" → "123 मेन स्ट्रीट"
- "New Delhi" → "नई दिल्ली"
`,
    gujarati: `
Examples of proper transliteration:
- "John Smith" → "જોન સ્મિથ"
- "ABC Corporation" → "એબીસી કોર્પોરેશન"
- "123 Main Street" → "123 મેઇન સ્ટ્રીટ"
- "Ahmedabad" → "અમદાવાદ"
`,
    marathi: `
Examples of proper transliteration:
- "John Smith" → "जॉन स्मिथ"
- "ABC Corporation" → "एबीसी कॉर्पोरेशन"
- "123 Main Street" → "123 मेन स्ट्रीट"
- "Mumbai" → "मुंबई"
`,
    kannada: `
Examples of proper transliteration:
- "John Smith" → "ಜಾನ್ ಸ್ಮಿತ್"
- "ABC Corporation" → "ಎಬಿಸಿ ಕಾರ್ಪೊರೇಶನ್"
- "123 Main Street" → "123 ಮೈನ್ ಸ್ಟ್ರೀಟ್"
- "Bangalore" → "ಬೆಂಗಳೂರು"
`,
  };

  return examples[targetLang] || "";
}

/**
 * Get explicit transliteration rules for LLM prompt
 */
export function getTransliterationRules(targetLang: string): string {
  if (targetLang === "english") {
    return "";
  }

  return `
CRITICAL TRANSLITERATION RULES:
1. ALL proper nouns (names, places, companies) MUST be transliterated to ${targetLang} script
2. ALL addresses including street names MUST be transliterated
3. Company names and acronyms MUST be transliterated phonetically
4. Numbers can remain in Arabic numerals (1, 2, 3) or be transliterated
5. NO English words should remain in the output - everything must be in ${targetLang} script

${getTransliterationInstructions(targetLang)}

Remember: The goal is 100% ${targetLang} output. Even if a word is originally English, it must be written in ${targetLang} script.
`;
}
