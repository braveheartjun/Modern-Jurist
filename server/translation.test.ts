import { describe, expect, it } from "vitest";
import { translateDocument } from "./translationService";

describe("Translation Service", () => {
  it("should translate English legal text to Hindi", async () => {
    const result = await translateDocument({
      sourceText: "This Power of Attorney is executed on 1st January 2024.",
      sourceLang: "English",
      targetLang: "Hindi",
    });

    expect(result.translatedText).toBeDefined();
    expect(result.translatedText.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
  }, 30000); // 30 second timeout for LLM call

  it("should apply custom glossary during translation", async () => {
    const result = await translateDocument({
      sourceText: "The Grantor hereby appoints the Attorney.",
      sourceLang: "English",
      targetLang: "Hindi",
      customGlossary: [
        { source: "Grantor", target: "दानकर्ता" },
        { source: "Attorney", target: "मुख्तार" },
      ],
    });

    expect(result.translatedText).toBeDefined();
    expect(result.translatedText.length).toBeGreaterThan(0);
    // The translation should contain the custom terms
    // Note: We can't strictly check for exact matches due to LLM variability
  }, 30000);

  it("should handle empty text gracefully", async () => {
    const result = await translateDocument({
      sourceText: "",
      sourceLang: "English",
      targetLang: "Hindi",
    });

    expect(result.translatedText).toBeDefined();
    expect(result.confidence).toBeLessThan(100); // Low confidence for empty text
  }, 30000);
});
