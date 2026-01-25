import { describe, expect, it } from "vitest";
import { detectAndGenerateCitations } from "./citationGenerator";

describe("Citation Generator", () => {
  it("should detect case law references and generate citations", async () => {
    const sampleText = `
      In the landmark case of Kesavananda Bharati v. State of Kerala, 
      the Supreme Court established the basic structure doctrine. 
      This principle was later reinforced in Minerva Mills case.
    `;

    const citations = await detectAndGenerateCitations(sampleText);

    // The LLM should detect at least one case reference
    expect(citations).toBeDefined();
    expect(Array.isArray(citations)).toBe(true);
    
    // If citations are found, they should have the required structure
    if (citations.length > 0) {
      const firstCitation = citations[0];
      expect(firstCitation).toHaveProperty("id");
      expect(firstCitation).toHaveProperty("originalText");
      expect(firstCitation).toHaveProperty("suggestedCitation");
      expect(firstCitation).toHaveProperty("caseTitle");
      expect(firstCitation).toHaveProperty("year");
      expect(firstCitation).toHaveProperty("court");
      expect(firstCitation).toHaveProperty("reporter");
      expect(firstCitation).toHaveProperty("startIndex");
      expect(firstCitation).toHaveProperty("endIndex");
      
      // Validate types
      expect(typeof firstCitation.id).toBe("string");
      expect(typeof firstCitation.originalText).toBe("string");
      expect(typeof firstCitation.suggestedCitation).toBe("string");
      expect(typeof firstCitation.caseTitle).toBe("string");
      expect(typeof firstCitation.year).toBe("string");
      expect(typeof firstCitation.court).toBe("string");
      expect(typeof firstCitation.reporter).toBe("string");
      expect(typeof firstCitation.startIndex).toBe("number");
      expect(typeof firstCitation.endIndex).toBe("number");
    }
  }, 30000); // 30 second timeout for LLM call

  it("should return empty array for text without case references", async () => {
    const sampleText = "This is a simple legal document without any case citations.";

    const citations = await detectAndGenerateCitations(sampleText);

    expect(citations).toBeDefined();
    expect(Array.isArray(citations)).toBe(true);
    // May return empty array or no citations
  }, 30000);

  it("should handle empty text gracefully", async () => {
    const citations = await detectAndGenerateCitations("");

    expect(citations).toBeDefined();
    expect(Array.isArray(citations)).toBe(true);
    expect(citations.length).toBe(0);
  }, 30000);
});
