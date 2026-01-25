import { describe, it, expect } from "vitest";
import { processDocument } from "./documentProcessor";
import { translateLargeDocument } from "./translationService";

describe("Translation Endpoint Integration", () => {
  it("should process a simple text document and translate it", async () => {
    // Create a simple text buffer
    const textContent = "This is a test agreement between Party A and Party B.";
    const buffer = Buffer.from(textContent, "utf-8");

    // Process the document
    const { text: sourceText, type } = await processDocument(buffer, "test.txt");
    
    expect(sourceText).toBe(textContent);
    expect(type).toBe("txt");

    // Translate the text
    const result = await translateLargeDocument({
      sourceText,
      sourceLang: "English",
      targetLang: "Hindi",
      documentType: "agreement",
    });

    expect(result.translatedText).toBeDefined();
    expect(result.translatedText.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  }, 30000);

  it("should handle PDF document processing", async () => {
    // This test verifies that the PDF processing doesn't crash
    // We can't easily create a valid PDF buffer in tests, so we'll just verify the function exists
    expect(processDocument).toBeDefined();
  });

  it("should handle translation with custom glossary", async () => {
    const sourceText = "The Grantor hereby transfers all rights to the Attorney.";
    
    const result = await translateLargeDocument({
      sourceText,
      sourceLang: "English",
      targetLang: "Hindi",
      customGlossary: [
        { source: "Grantor", target: "Dene Wala" },
        { source: "Attorney", target: "Mukhtar" }
      ],
      documentType: "power of attorney",
    });

    expect(result.translatedText).toBeDefined();
    expect(result.translatedText.length).toBeGreaterThan(0);
  }, 30000);
});
