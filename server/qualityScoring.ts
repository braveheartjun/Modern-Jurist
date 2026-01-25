import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface QualityScore {
  overall: number; // 0-100
  confidence: "high" | "medium" | "low";
  factors: {
    terminologyMatch: number; // 0-100
    corpusSimilarity: number; // 0-100
    complexity: number; // 0-100 (lower complexity = higher score)
  };
  details: string;
}

export interface SectionScore {
  text: string;
  translatedText: string;
  score: QualityScore;
  needsReview: boolean;
}

/**
 * Calculate translation quality score based on multiple factors
 */
export function calculateQualityScore(
  sourceText: string,
  translatedText: string,
  sourceLang: string,
  targetLang: string,
  terminologyMatches: number = 0,
  corpusMatches: number = 0
): QualityScore {
  // Handle empty text
  if (!sourceText || !translatedText || sourceText.trim().length === 0) {
    return {
      overall: 0,
      confidence: "low",
      factors: {
        terminologyMatch: 0,
        corpusSimilarity: 0,
        complexity: 0
      },
      details: "Empty or invalid text"
    };
  }

  // Factor 1: Terminology Match Score (40% weight)
  // Higher score if more legal terms from our database were used
  const wordCount = sourceText.split(/\s+/).filter(w => w.length > 0).length;
  const terminologyScore = Math.min(100, (terminologyMatches / Math.max(1, wordCount / 10)) * 100);
  
  // Factor 2: Corpus Similarity Score (30% weight)
  // Higher score if similar documents exist in our corpus
  const corpusScore = Math.min(100, (corpusMatches / 3) * 100);
  
  // Factor 3: Complexity Score (30% weight)
  // Lower complexity = higher confidence
  const complexityScore = calculateComplexityScore(sourceText);
  
  // Calculate weighted overall score and clamp to 0-100
  const overall = Math.max(0, Math.min(100, Math.round(
    (terminologyScore * 0.4) +
    (corpusScore * 0.3) +
    (complexityScore * 0.3)
  )));
  
  // Determine confidence level
  let confidence: "high" | "medium" | "low";
  if (overall >= 80) confidence = "high";
  else if (overall >= 60) confidence = "medium";
  else confidence = "low";
  
  // Generate details explanation
  const details = generateScoreDetails(terminologyScore, corpusScore, complexityScore, confidence);
  
  return {
    overall,
    confidence,
    factors: {
      terminologyMatch: Math.round(terminologyScore),
      corpusSimilarity: Math.round(corpusScore),
      complexity: Math.round(complexityScore)
    },
    details
  };
}

/**
 * Calculate complexity score based on text characteristics
 * Lower complexity = higher score
 */
function calculateComplexityScore(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  
  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Average word length (shorter = simpler)
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  const wordLengthScore = Math.max(0, Math.min(100, 100 - (avgWordLength - 5) * 10));
  
  // Average sentence length (shorter = simpler)
  const avgSentenceLength = words.length / Math.max(1, sentences.length);
  const sentenceLengthScore = Math.max(0, Math.min(100, 100 - (avgSentenceLength - 15) * 3));
  
  // Special characters and numbers (more = more complex)
  const specialChars = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const specialCharScore = Math.max(0, Math.min(100, 100 - (specialChars / text.length) * 200));
  
  // Combine scores and clamp to 0-100
  return Math.max(0, Math.min(100, (wordLengthScore + sentenceLengthScore + specialCharScore) / 3));
}

/**
 * Generate human-readable explanation of the quality score
 */
function generateScoreDetails(
  terminologyScore: number,
  corpusScore: number,
  complexityScore: number,
  confidence: string
): string {
  const parts: string[] = [];
  
  if (terminologyScore >= 70) {
    parts.push("Strong terminology match with legal database");
  } else if (terminologyScore >= 40) {
    parts.push("Moderate terminology match");
  } else {
    parts.push("Limited terminology match - may need review");
  }
  
  if (corpusScore >= 70) {
    parts.push("similar documents found in corpus");
  } else if (corpusScore >= 40) {
    parts.push("some similar documents found");
  } else {
    parts.push("few similar documents in corpus");
  }
  
  if (complexityScore < 50) {
    parts.push("complex text structure");
  }
  
  return parts.join(", ") + ".";
}

/**
 * Analyze translation quality for a full document by sections
 */
export function analyzeDocumentQuality(
  sourceText: string,
  translatedText: string,
  sourceLang: string,
  targetLang: string,
  terminologyMatchCount: number = 0,
  corpusMatchCount: number = 0
): SectionScore[] {
  // Split document into sections (by double line breaks or major headings)
  const sourceSections = splitIntoSections(sourceText);
  const translatedSections = splitIntoSections(translatedText);
  
  const sectionScores: SectionScore[] = [];
  
  for (let i = 0; i < Math.min(sourceSections.length, translatedSections.length); i++) {
    const sourceSection = sourceSections[i];
    const translatedSection = translatedSections[i];
    
    // Calculate terminology matches for this section
    const sectionTermMatches = countTerminologyMatches(sourceSection, sourceLang, targetLang);
    
    // Estimate corpus matches (simplified for now)
    const sectionCorpusMatches = Math.floor(corpusMatchCount / sourceSections.length);
    
    const score = calculateQualityScore(
      sourceSection,
      translatedSection,
      sourceLang,
      targetLang,
      sectionTermMatches,
      sectionCorpusMatches
    );
    
    sectionScores.push({
      text: sourceSection,
      translatedText: translatedSection,
      score,
      needsReview: score.overall < 70
    });
  }
  
  return sectionScores;
}

/**
 * Split text into logical sections
 */
function splitIntoSections(text: string): string[] {
  // Split by double line breaks or numbered sections
  const sections = text
    .split(/\n\n+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  // If no sections found, return the whole text
  if (sections.length === 0) return [text];
  
  return sections;
}

/**
 * Count how many legal terms from our database appear in the text
 */
function countTerminologyMatches(text: string, sourceLang: string, targetLang: string): number {
  try {
    const dbPath = path.join(__dirname, "data", "legal_terminology.json");
    const data = fs.readFileSync(dbPath, "utf-8");
    const db = JSON.parse(data);
    
    let matches = 0;
    const lowerText = text.toLowerCase();
    
    // Check each term in the database
    for (const term of Object.keys(db.terminology)) {
      if (lowerText.includes(term.toLowerCase())) {
        matches++;
      }
    }
    
    return matches;
  } catch (error) {
    console.error("Error counting terminology matches:", error);
    return 0;
  }
}

/**
 * Get overall document quality score
 */
export function getDocumentQualityScore(sectionScores: SectionScore[]): QualityScore {
  if (sectionScores.length === 0) {
    return {
      overall: 0,
      confidence: "low",
      factors: {
        terminologyMatch: 0,
        corpusSimilarity: 0,
        complexity: 0
      },
      details: "No sections to analyze"
    };
  }
  
  // Average all section scores
  const avgOverall = sectionScores.reduce((sum, s) => sum + s.score.overall, 0) / sectionScores.length;
  const avgTerminology = sectionScores.reduce((sum, s) => sum + s.score.factors.terminologyMatch, 0) / sectionScores.length;
  const avgCorpus = sectionScores.reduce((sum, s) => sum + s.score.factors.corpusSimilarity, 0) / sectionScores.length;
  const avgComplexity = sectionScores.reduce((sum, s) => sum + s.score.factors.complexity, 0) / sectionScores.length;
  
  let confidence: "high" | "medium" | "low";
  if (avgOverall >= 80) confidence = "high";
  else if (avgOverall >= 60) confidence = "medium";
  else confidence = "low";
  
  const sectionsNeedingReview = sectionScores.filter(s => s.needsReview).length;
  const details = sectionsNeedingReview > 0
    ? `${sectionsNeedingReview} section(s) may need manual review. ${generateScoreDetails(avgTerminology, avgCorpus, avgComplexity, confidence)}`
    : `All sections have good confidence. ${generateScoreDetails(avgTerminology, avgCorpus, avgComplexity, confidence)}`;
  
  return {
    overall: Math.round(avgOverall),
    confidence,
    factors: {
      terminologyMatch: Math.round(avgTerminology),
      corpusSimilarity: Math.round(avgCorpus),
      complexity: Math.round(avgComplexity)
    },
    details
  };
}
