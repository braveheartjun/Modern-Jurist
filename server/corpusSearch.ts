/**
 * Corpus Search System
 * Searches the legal document corpus for similar documents to improve translation context
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CorpusDocument {
  id: string;
  title: string;
  content: string;
  language: string;
  documentType: string;
  source: string;
  url?: string;
  dateAdded: string;
}

interface CorpusIndex {
  totalDocuments: number;
  languages: string[];
  languageCounts: Record<string, number>;
  documentTypes: string[];
  typeCounts: Record<string, number>;
  lastUpdated: string;
  documents: Array<{
    id: string;
    title: string;
    language: string;
    documentType: string;
    source: string;
  }>;
}

// Cache for corpus documents
let corpusCache: CorpusDocument[] | null = null;
let corpusIndex: CorpusIndex | null = null;

/**
 * Load all corpus documents into memory
 */
function loadCorpus(): CorpusDocument[] {
  if (corpusCache) {
    return corpusCache;
  }
  
  const corpusDir = path.join(__dirname, "corpus");
  
  if (!fs.existsSync(corpusDir)) {
    console.warn("Corpus directory not found");
    return [];
  }
  
  const files = fs.readdirSync(corpusDir).filter(f => f.endsWith('.json') && f !== 'index.json');
  const documents: CorpusDocument[] = [];
  
  for (const file of files) {
    try {
      const filepath = path.join(corpusDir, file);
      const doc = JSON.parse(fs.readFileSync(filepath, "utf-8"));
      documents.push(doc);
    } catch (error) {
      console.error(`Error loading corpus document ${file}:`, error);
    }
  }
  
  corpusCache = documents;
  console.log(`Loaded ${documents.length} documents into corpus`);
  return documents;
}

/**
 * Load corpus index
 */
function loadCorpusIndex(): CorpusIndex | null {
  if (corpusIndex) {
    return corpusIndex;
  }
  
  const indexPath = path.join(__dirname, "corpus", "index.json");
  
  if (!fs.existsSync(indexPath)) {
    return null;
  }
  
  try {
    corpusIndex = JSON.parse(fs.readFileSync(indexPath, "utf-8"));
    return corpusIndex;
  } catch (error) {
    console.error("Error loading corpus index:", error);
    return null;
  }
}

/**
 * Calculate similarity between two texts using simple word overlap
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  if (words1.length === 0 || words2.length === 0) {
    return 0;
  }
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  let intersection = 0;
  set1.forEach(word => {
    if (set2.has(word)) {
      intersection++;
    }
  });
  
  const union = set1.size + set2.size - intersection;
  return union > 0 ? (intersection / union) * 100 : 0;
}

/**
 * Search corpus for similar documents
 */
export function searchCorpus(params: {
  text: string;
  language: string;
  documentType?: string;
  limit?: number;
}): CorpusDocument[] {
  const { text, language, documentType, limit = 5 } = params;
  
  const corpus = loadCorpus();
  
  if (corpus.length === 0) {
    return [];
  }
  
  // Filter by language and optionally by document type
  let filtered = corpus.filter(doc => doc.language === language);
  
  if (documentType) {
    filtered = filtered.filter(doc => doc.documentType === documentType);
  }
  
  // Calculate similarity scores
  const scored = filtered.map(doc => ({
    doc,
    similarity: calculateSimilarity(text, doc.content)
  }));
  
  // Sort by similarity (highest first) and return top results
  scored.sort((a, b) => b.similarity - a.similarity);
  
  return scored.slice(0, limit).map(item => item.doc);
}

/**
 * Get corpus statistics
 */
export function getCorpusStats() {
  const index = loadCorpusIndex();
  
  if (!index) {
    return {
      totalDocuments: 0,
      languages: [],
      documentTypes: []
    };
  }
  
  return {
    totalDocuments: index.totalDocuments,
    languages: index.languages,
    languageCounts: index.languageCounts,
    documentTypes: index.documentTypes,
    typeCounts: index.typeCounts,
    lastUpdated: index.lastUpdated
  };
}

/**
 * Get example documents by type and language
 */
export function getExampleDocuments(params: {
  language: string;
  documentType: string;
  limit?: number;
}): CorpusDocument[] {
  const { language, documentType, limit = 3 } = params;
  
  const corpus = loadCorpus();
  
  return corpus
    .filter(doc => doc.language === language && doc.documentType === documentType)
    .slice(0, limit);
}

// Pre-load corpus on module import
loadCorpus();
loadCorpusIndex();
