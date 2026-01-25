import fs from 'fs/promises';
import path from 'path';

interface UnifiedDocument {
  id: string;
  title: string;
  source: string;
  document_type: string;
  content_summary: string;
  url?: string;
  citation?: string;
  subject?: string;
  year?: string;
  court?: string;
  scraped_date: string;
  metadata: any;
}

interface UnifiedDatabase {
  metadata: {
    created: string;
    total_documents: number;
    sources: string[];
    document_types: string[];
  };
  documents: UnifiedDocument[];
}

let cachedDatabase: UnifiedDatabase | null = null;

/**
 * Load the unified database (with caching)
 */
export async function loadUnifiedDatabase(): Promise<UnifiedDatabase> {
  if (cachedDatabase) {
    return cachedDatabase;
  }

  try {
    const dbPath = path.join(process.cwd(), 'client/public/data/unified_database.json');
    const content = await fs.readFile(dbPath, 'utf-8');
    cachedDatabase = JSON.parse(content);
    return cachedDatabase!;
  } catch (error) {
    console.error('Failed to load unified database:', error);
    // Return empty database structure
    return {
      metadata: {
        created: new Date().toISOString(),
        total_documents: 0,
        sources: [],
        document_types: []
      },
      documents: []
    };
  }
}

/**
 * Search documents by query (title, content, source, type)
 */
export async function searchDocuments(query: string, filters?: {
  source?: string;
  document_type?: string;
  year?: string;
  court?: string;
}): Promise<UnifiedDocument[]> {
  const db = await loadUnifiedDatabase();
  const lowerQuery = query.toLowerCase();

  let results = db.documents.filter(doc => {
    const matchesQuery = 
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.content_summary.toLowerCase().includes(lowerQuery) ||
      doc.source.toLowerCase().includes(lowerQuery) ||
      doc.document_type.toLowerCase().includes(lowerQuery) ||
      (doc.subject && doc.subject.toLowerCase().includes(lowerQuery)) ||
      (doc.citation && doc.citation.toLowerCase().includes(lowerQuery));

    if (!matchesQuery) return false;

    // Apply filters
    if (filters) {
      if (filters.source && doc.source !== filters.source) return false;
      if (filters.document_type && doc.document_type !== filters.document_type) return false;
      if (filters.year && doc.year !== filters.year) return false;
      if (filters.court && doc.court !== filters.court) return false;
    }

    return true;
  });

  // Sort by relevance (title matches first, then content matches)
  results.sort((a, b) => {
    const aTitle = a.title.toLowerCase().includes(lowerQuery);
    const bTitle = b.title.toLowerCase().includes(lowerQuery);
    if (aTitle && !bTitle) return -1;
    if (!aTitle && bTitle) return 1;
    return 0;
  });

  return results;
}

/**
 * Find documents by citation
 */
export async function findByCitation(citation: string): Promise<UnifiedDocument | null> {
  const db = await loadUnifiedDatabase();
  const normalized = citation.toLowerCase().trim();

  return db.documents.find(doc => 
    doc.citation && doc.citation.toLowerCase().trim() === normalized
  ) || null;
}

/**
 * Find similar cases by subject or court
 */
export async function findSimilarCases(doc: UnifiedDocument, limit: number = 5): Promise<UnifiedDocument[]> {
  const db = await loadUnifiedDatabase();

  const similar = db.documents.filter(d => {
    if (d.id === doc.id) return false;
    
    // Match by subject, court, or document type
    const subjectMatch = doc.subject && d.subject && d.subject === doc.subject;
    const courtMatch = doc.court && d.court && d.court === doc.court;
    const typeMatch = d.document_type === doc.document_type;

    return subjectMatch || (courtMatch && typeMatch);
  });

  return similar.slice(0, limit);
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const db = await loadUnifiedDatabase();

  const sourceStats: Record<string, number> = {};
  const typeStats: Record<string, number> = {};
  const yearStats: Record<string, number> = {};

  db.documents.forEach(doc => {
    sourceStats[doc.source] = (sourceStats[doc.source] || 0) + 1;
    typeStats[doc.document_type] = (typeStats[doc.document_type] || 0) + 1;
    if (doc.year) {
      yearStats[doc.year] = (yearStats[doc.year] || 0) + 1;
    }
  });

  return {
    total_documents: db.metadata.total_documents,
    sources: db.metadata.sources,
    document_types: db.metadata.document_types,
    by_source: sourceStats,
    by_type: typeStats,
    by_year: yearStats
  };
}

/**
 * Get all available sources
 */
export async function getAllSources(): Promise<string[]> {
  const db = await loadUnifiedDatabase();
  return db.metadata.sources;
}

/**
 * Get all available document types
 */
export async function getAllDocumentTypes(): Promise<string[]> {
  const db = await loadUnifiedDatabase();
  return db.metadata.document_types;
}

/**
 * Clear the database cache (useful after updates)
 */
export function clearDatabaseCache() {
  cachedDatabase = null;
}
