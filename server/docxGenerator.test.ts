import { describe, it, expect } from "vitest";
import { generateDOCX } from "./docxGenerator";

describe("DOCX Generator", () => {
  it("should generate a DOCX buffer from simple text", async () => {
    const result = await generateDOCX({
      title: "Test Legal Document",
      content: "This is a test paragraph.\n\nThis is another paragraph.",
      sourceLang: "English",
      targetLang: "Hindi",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  }, 10000);

  it("should handle empty content gracefully", async () => {
    const result = await generateDOCX({
      title: "Empty Document",
      content: "",
      sourceLang: "English",
      targetLang: "Hindi",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  }, 10000);

  it("should include citations in the generated DOCX", async () => {
    const result = await generateDOCX({
      title: "Document with Citations",
      content: "This document references case law.\n\nThe Supreme Court held that...",
      sourceLang: "English",
      targetLang: "Hindi",
      citations: [
        {
          id: "1",
          text: "Supreme Court",
          citation: "AIR 2020 SC 1234",
        },
      ],
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  }, 10000);

  it("should handle multi-paragraph legal text", async () => {
    const legalText = `GENERAL POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS that we, the Legal Heirs of Late Shri Premnath Sharma...

1. Grantors: [List of Names]
2. Attorney: Mr. Dev Premnath Sharma

WHEREAS the Grantors have relinquished and transferred all their rights and interests...`;

    const result = await generateDOCX({
      title: "General Power of Attorney",
      content: legalText,
      sourceLang: "English",
      targetLang: "Hindi",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(1000); // Should be substantial
  }, 10000);

  it("should preserve formatting for numbered clauses", async () => {
    const content = `1. First clause of the agreement.

2. Second clause with detailed provisions.

3. Third clause regarding termination.`;

    const result = await generateDOCX({
      title: "Agreement Clauses",
      content: content,
      sourceLang: "English",
      targetLang: "Gujarati",
    });

    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  }, 10000);
});
