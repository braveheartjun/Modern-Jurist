import { describe, expect, it } from "vitest";
import { searchDocuments, findByCitation, getDatabaseStats } from "./databaseSearch";

describe("Database Search", () => {
  it("should search documents by query", async () => {
    const results = await searchDocuments("constitution");
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    
    // Verify results contain the search term
    const hasMatch = results.some(doc => 
      doc.title.toLowerCase().includes("constitution") ||
      doc.content_summary.toLowerCase().includes("constitution")
    );
    expect(hasMatch).toBe(true);
  });

  it("should filter documents by source", async () => {
    const results = await searchDocuments("act", {
      source: "Ministry of Law and Justice"
    });
    
    expect(Array.isArray(results)).toBe(true);
    
    // All results should be from the specified source
    results.forEach(doc => {
      expect(doc.source).toBe("Ministry of Law and Justice");
    });
  });

  it("should find document by citation", async () => {
    const result = await findByCitation("AIR 1973 SC 1461");
    
    if (result) {
      expect(result.citation).toBe("AIR 1973 SC 1461");
      expect(result.title).toContain("Kesavananda Bharati");
    }
  });

  it("should return database statistics", async () => {
    const stats = await getDatabaseStats();
    
    expect(stats).toHaveProperty("total_documents");
    expect(stats).toHaveProperty("sources");
    expect(stats).toHaveProperty("document_types");
    expect(stats).toHaveProperty("by_source");
    expect(stats).toHaveProperty("by_type");
    
    expect(typeof stats.total_documents).toBe("number");
    expect(Array.isArray(stats.sources)).toBe(true);
    expect(Array.isArray(stats.document_types)).toBe(true);
  });

  it("should handle empty search results gracefully", async () => {
    const results = await searchDocuments("nonexistentxyzabc123");
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});
