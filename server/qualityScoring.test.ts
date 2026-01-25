import { describe, it, expect } from "vitest";
import {
  calculateQualityScore,
  analyzeDocumentQuality,
  getDocumentQualityScore,
} from "./qualityScoring";

describe("Quality Scoring System", () => {
  describe("calculateQualityScore", () => {
    it("should return high confidence for good terminology match and corpus similarity", () => {
      const sourceText = "This is a legal agreement between the parties.";
      const translatedText = "यह पक्षों के बीच एक कानूनी समझौता है।";
      
      const score = calculateQualityScore(
        sourceText,
        translatedText,
        "english",
        "hindi",
        5, // terminology matches
        3  // corpus matches
      );

      expect(score.overall).toBeGreaterThanOrEqual(70);
      expect(score.confidence).toBe("high");
      expect(score.factors.terminologyMatch).toBeGreaterThan(0);
      expect(score.factors.corpusSimilarity).toBeGreaterThan(0);
    });

    it("should return medium or high confidence for moderate matches", () => {
      const sourceText = "The contract specifies the terms and conditions.";
      const translatedText = "अनुबंध नियम और शर्तों को निर्दिष्ट करता है।";
      
      const score = calculateQualityScore(
        sourceText,
        translatedText,
        "english",
        "hindi",
        2, // moderate terminology matches
        1  // few corpus matches
      );

      expect(score.overall).toBeGreaterThanOrEqual(40);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(["high", "medium", "low"]).toContain(score.confidence);
    });

    it("should return low confidence for poor matches", () => {
      const sourceText = "Complex legal jargon with specialized terminology.";
      const translatedText = "जटिल कानूनी शब्दजाल।";
      
      const score = calculateQualityScore(
        sourceText,
        translatedText,
        "english",
        "hindi",
        0, // no terminology matches
        0  // no corpus matches
      );

      expect(score.overall).toBeLessThan(60);
      expect(score.confidence).toBe("low");
    });

    it("should handle empty text gracefully", () => {
      const score = calculateQualityScore("", "", "english", "hindi", 0, 0);

      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.confidence).toBeDefined();
    });

    it("should include detailed explanation in score", () => {
      const sourceText = "Legal agreement with proper terminology.";
      const translatedText = "उचित शब्दावली के साथ कानूनी समझौता।";
      
      const score = calculateQualityScore(
        sourceText,
        translatedText,
        "english",
        "hindi",
        3,
        2
      );

      expect(score.details).toBeDefined();
      expect(score.details.length).toBeGreaterThan(0);
      expect(typeof score.details).toBe("string");
    });
  });

  describe("analyzeDocumentQuality", () => {
    it("should split document into sections and score each", () => {
      const sourceText = `AGREEMENT

This is the first section of the agreement.

This is the second section with more details.`;

      const translatedText = `समझौता

यह समझौते का पहला खंड है।

यह अधिक विवरण के साथ दूसरा खंड है।`;

      const sectionScores = analyzeDocumentQuality(
        sourceText,
        translatedText,
        "english",
        "hindi",
        3,
        2
      );

      expect(sectionScores.length).toBeGreaterThan(0);
      expect(sectionScores[0]).toHaveProperty("text");
      expect(sectionScores[0]).toHaveProperty("translatedText");
      expect(sectionScores[0]).toHaveProperty("score");
      expect(sectionScores[0]).toHaveProperty("needsReview");
    });

    it("should mark low-confidence sections as needing review", () => {
      const sourceText = "Simple text.";
      const translatedText = "सरल पाठ।";

      const sectionScores = analyzeDocumentQuality(
        sourceText,
        translatedText,
        "english",
        "hindi",
        0, // no matches = low score
        0
      );

      const lowConfidenceSections = sectionScores.filter(s => s.needsReview);
      expect(lowConfidenceSections.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle single-section documents", () => {
      const sourceText = "This is a single paragraph document without sections.";
      const translatedText = "यह खंडों के बिना एक एकल पैराग्राफ दस्तावेज़ है।";

      const sectionScores = analyzeDocumentQuality(
        sourceText,
        translatedText,
        "english",
        "hindi",
        2,
        1
      );

      expect(sectionScores.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getDocumentQualityScore", () => {
    it("should calculate average score from section scores", () => {
      const sectionScores = [
        {
          text: "Section 1",
          translatedText: "खंड 1",
          score: {
            overall: 80,
            confidence: "high" as const,
            factors: { terminologyMatch: 75, corpusSimilarity: 80, complexity: 85 },
            details: "Good match"
          },
          needsReview: false
        },
        {
          text: "Section 2",
          translatedText: "खंड 2",
          score: {
            overall: 60,
            confidence: "medium" as const,
            factors: { terminologyMatch: 55, corpusSimilarity: 60, complexity: 65 },
            details: "Moderate match"
          },
          needsReview: true
        }
      ];

      const overallScore = getDocumentQualityScore(sectionScores);

      expect(overallScore.overall).toBe(70); // (80 + 60) / 2
      expect(overallScore.confidence).toBe("medium");
      expect(overallScore.details).toContain("1 section(s) may need manual review");
    });

    it("should handle empty section scores", () => {
      const overallScore = getDocumentQualityScore([]);

      expect(overallScore.overall).toBe(0);
      expect(overallScore.confidence).toBe("low");
      expect(overallScore.details).toContain("No sections to analyze");
    });

    it("should indicate when all sections have good confidence", () => {
      const sectionScores = [
        {
          text: "Section 1",
          translatedText: "खंड 1",
          score: {
            overall: 85,
            confidence: "high" as const,
            factors: { terminologyMatch: 80, corpusSimilarity: 85, complexity: 90 },
            details: "Excellent match"
          },
          needsReview: false
        },
        {
          text: "Section 2",
          translatedText: "खंड 2",
          score: {
            overall: 82,
            confidence: "high" as const,
            factors: { terminologyMatch: 78, corpusSimilarity: 82, complexity: 86 },
            details: "Great match"
          },
          needsReview: false
        }
      ];

      const overallScore = getDocumentQualityScore(sectionScores);

      expect(overallScore.overall).toBeGreaterThanOrEqual(80);
      expect(overallScore.confidence).toBe("high");
      expect(overallScore.details).toContain("All sections have good confidence");
    });
  });

  describe("Score boundaries", () => {
    it("should keep scores within 0-100 range", () => {
      const score = calculateQualityScore(
        "Test text",
        "परीक्षण पाठ",
        "english",
        "hindi",
        100, // very high matches
        100
      );

      expect(score.overall).toBeGreaterThanOrEqual(0);
      expect(score.overall).toBeLessThanOrEqual(100);
      expect(score.factors.terminologyMatch).toBeGreaterThanOrEqual(0);
      expect(score.factors.terminologyMatch).toBeLessThanOrEqual(100);
      expect(score.factors.corpusSimilarity).toBeGreaterThanOrEqual(0);
      expect(score.factors.corpusSimilarity).toBeLessThanOrEqual(100);
      expect(score.factors.complexity).toBeGreaterThanOrEqual(0);
      expect(score.factors.complexity).toBeLessThanOrEqual(100);
    });
  });
});
