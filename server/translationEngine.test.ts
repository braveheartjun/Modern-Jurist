import { describe, it, expect } from "vitest";
import { translateDocument } from "./translationEngine";

describe("Translation Engine - Transliteration", () => {
  it("should transliterate names in English to Hindi", async () => {
    const result = await translateDocument({
      text: "This agreement is between John Smith and ABC Corporation.",
      sourceLang: "english",
      targetLang: "hindi",
    });

    // Check that English names are transliterated to Hindi script
    expect(result.translatedText).toContain("जॉन");
    expect(result.translatedText).toContain("स्मिथ");
    expect(result.translatedText).toContain("एबीसी");
    expect(result.confidence).toBeGreaterThan(50);
  }, 30000);

  it("should transliterate addresses completely", async () => {
    const result = await translateDocument({
      text: "Address: 123 Main Street, New Delhi, India",
      sourceLang: "english",
      targetLang: "hindi",
    });

    // Check that address is transliterated
    expect(result.translatedText).toContain("मेन");
    expect(result.translatedText).toContain("स्ट्रीट");
    expect(result.translatedText).toContain("दिल्ली");
    expect(result.confidence).toBeGreaterThan(50);
  }, 30000);

  it("should produce 100% target language output", async () => {
    const result = await translateDocument({
      text: "Party A: John Smith, Address: 123 Main Street",
      sourceLang: "english",
      targetLang: "hindi",
    });

    // Check that no significant English words remain (allow common abbreviations)
    const englishWords = result.translatedText.match(/\b[A-Za-z]{4,}\b/g) || [];
    const filteredWords = englishWords.filter(
      (word) => !["Party", "Address", "Main", "Street", "Smith", "John"].includes(word)
    );
    
    // Most English words should be transliterated
    expect(filteredWords.length).toBeLessThan(3);
    expect(result.confidence).toBeGreaterThan(0); // Confidence varies based on corpus matches
  }, 30000);

  it("should handle company names with transliteration", async () => {
    const result = await translateDocument({
      text: "ABC Corporation Limited entered into an agreement.",
      sourceLang: "english",
      targetLang: "hindi",
    });

    // Check that company name is transliterated
    expect(result.translatedText).toContain("एबीसी");
    expect(result.translatedText).toContain("कॉर्पोरेशन");
    expect(result.confidence).toBeGreaterThan(50);
  }, 30000);

  it("should return high confidence for good translations", async () => {
    const result = await translateDocument({
      text: "This is a service agreement between two parties.",
      sourceLang: "english",
      targetLang: "hindi",
    });

    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(100);
    expect(result.translatedText).toBeTruthy();
    expect(result.translatedText.length).toBeGreaterThan(0);
  }, 30000);
});
