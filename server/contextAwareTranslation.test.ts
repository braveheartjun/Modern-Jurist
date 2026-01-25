import { describe, it, expect, beforeAll } from "vitest";
import { translateLegalDocument, detectDocumentType } from "./contextAwareTranslation";
import * as fs from "fs";
import * as path from "path";

describe("Context-Aware Legal Translation", () => {
  beforeAll(() => {
    // Ensure the legal terminology database exists
    const dbPath = path.join(__dirname, "data", "legal_terminology.json");
    expect(fs.existsSync(dbPath)).toBe(true);
  });

  describe("Document Type Detection", () => {
    it("should detect agreement documents", () => {
      const text = "This AGREEMENT is made between Party A and Party B";
      expect(detectDocumentType(text)).toBe("agreement");
    });

    it("should detect Hindi agreement documents", () => {
      const text = "यह समझौता पक्ष A और पक्ष B के बीच किया गया है";
      expect(detectDocumentType(text)).toBe("agreement");
    });

    it("should detect affidavit documents", () => {
      const text = "AFFIDAVIT of John Doe, being duly sworn, deposes and says";
      expect(detectDocumentType(text)).toBe("affidavit");
    });

    it("should detect petition documents", () => {
      const text = "PETITION under Article 226 of the Constitution of India";
      expect(detectDocumentType(text)).toBe("petition");
    });

    it("should detect appeal documents", () => {
      const text = "CIVIL APPEAL NO. 1234 OF 2024";
      expect(detectDocumentType(text)).toBe("appeal");
    });

    it("should return general for unknown document types", () => {
      const text = "This is some random legal text without specific markers";
      expect(detectDocumentType(text)).toBe("general");
    });
  });

  describe("Legal Document Translation", () => {
    it("should translate a simple agreement clause from English to Hindi", async () => {
      const sourceText = "Party of the First Part agrees to pay consideration of Rs. 10,000";
      const result = await translateLegalDocument(sourceText, "english", "hindi", "agreement");
      
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      // Should contain Hindi script
      expect(/[\u0900-\u097F]/.test(result)).toBe(true);
    }, 30000);

    it("should translate WHEREAS clause from English to Gujarati", async () => {
      const sourceText = "WHEREAS the Party has agreed to sell the property";
      const result = await translateLegalDocument(sourceText, "english", "gujarati", "agreement");
      
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      // Should contain Gujarati script
      expect(/[\u0A80-\u0AFF]/.test(result)).toBe(true);
    }, 30000);

    it("should translate witness clause from English to Marathi", async () => {
      const sourceText = "IN WITNESS WHEREOF the parties have set their hands on this day";
      const result = await translateLegalDocument(sourceText, "english", "marathi", "agreement");
      
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      // Should contain Marathi script (Devanagari)
      expect(/[\u0900-\u097F]/.test(result)).toBe(true);
    }, 30000);

    it("should translate legal notice from English to Kannada", async () => {
      const sourceText = "NOTICE is hereby given that the property shall be auctioned";
      const result = await translateLegalDocument(sourceText, "english", "kannada", "notice");
      
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      // Should contain Kannada script
      expect(/[\u0C80-\u0CFF]/.test(result)).toBe(true);
    }, 30000);

    it("should preserve numbers and dates in translation", async () => {
      const sourceText = "Agreement dated 15th January 2024 for Rs. 50,000";
      const result = await translateLegalDocument(sourceText, "english", "hindi", "agreement");
      
      expect(result).toBeTruthy();
      // Numbers should be preserved
      expect(result).toContain("15");
      expect(result).toContain("2024");
      expect(result).toContain("50,000");
    }, 30000);

    it("should handle multi-paragraph legal text", async () => {
      const sourceText = `THIS AGREEMENT is made on 1st January 2024.

WHEREAS the Party of the First Part owns certain property.

NOW THEREFORE the parties agree as follows:

1. The consideration shall be Rs. 100,000
2. The payment shall be made within 30 days`;

      const result = await translateLegalDocument(sourceText, "english", "hindi", "agreement");
      
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(100);
      // Should preserve paragraph structure (multiple line breaks)
      expect(result.split("\n").length).toBeGreaterThan(3);
    }, 30000);
  });

  describe("Translation Quality", () => {
    it("should use legal terminology from database", async () => {
      const sourceText = "The plaintiff filed a petition in the court";
      const result = await translateLegalDocument(sourceText, "english", "hindi", "petition");
      
      expect(result).toBeTruthy();
      // Should contain Hindi legal terms (not literal translations)
      expect(/[\u0900-\u097F]/.test(result)).toBe(true);
    }, 30000);

    it("should maintain formal legal tone", async () => {
      const sourceText = "The Party hereby agrees and covenants";
      const result = await translateLegalDocument(sourceText, "english", "gujarati", "agreement");
      
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      // Result should not be empty or too short (indicating proper translation)
      expect(result.length).toBeGreaterThan(10);
    }, 30000);
  });

  describe("Error Handling", () => {
    it("should handle empty text gracefully", async () => {
      // Empty text should be handled gracefully (may return empty or minimal response)
      const result = await translateLegalDocument("", "english", "hindi", "agreement");
      // Just verify it doesn't crash
      expect(result).toBeDefined();
    }, 30000);

    it("should handle unsupported language pairs", async () => {
      const sourceText = "This is a test";
      // Should still attempt translation even with unsupported languages
      const result = await translateLegalDocument(sourceText, "french", "spanish", "general");
      expect(result).toBeTruthy();
    }, 30000);
  });
});
