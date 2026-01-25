/**
 * Import generated legal documents into the corpus
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GeneratedDocument {
  input: string;
  output: {
    document_id: string;
    title: string;
    content: string;
    language: string;
    document_type: string;
  };
  error?: string;
}

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

async function importCorpus() {
  // Read the generated documents JSON
  const jsonPath = "/home/ubuntu/generate_legal_corpus.json";
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  
  const corpusDir = path.join(__dirname, "..", "server", "corpus");
  
  // Create corpus directory if it doesn't exist
  if (!fs.existsSync(corpusDir)) {
    fs.mkdirSync(corpusDir, { recursive: true });
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  // Process each generated document
  for (const item of jsonData.results) {
    if (item.error || !item.output) {
      console.log(`✗ Skipped: ${item.input} (error: ${item.error})`);
      errorCount++;
      continue;
    }
    
    const doc: CorpusDocument = {
      id: item.output.document_id,
      title: item.output.title,
      content: item.output.content,
      language: item.output.language,
      documentType: item.output.document_type,
      source: "generated",
      dateAdded: new Date().toISOString()
    };
    
    // Save to corpus
    const filename = `${doc.id}.json`;
    const filepath = path.join(corpusDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(doc, null, 2));
    successCount++;
    
    if (successCount % 10 === 0) {
      console.log(`✓ Imported ${successCount} documents...`);
    }
  }
  
  console.log(`\n✓ Successfully imported ${successCount} documents`);
  if (errorCount > 0) {
    console.log(`✗ Skipped ${errorCount} documents due to errors`);
  }
  
  // Update the index
  const allFiles = fs.readdirSync(corpusDir).filter(f => f.endsWith('.json') && f !== 'index.json');
  const allDocuments: CorpusDocument[] = [];
  
  for (const file of allFiles) {
    const filepath = path.join(corpusDir, file);
    const doc = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    allDocuments.push(doc);
  }
  
  // Create index
  const languageCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  
  for (const doc of allDocuments) {
    languageCounts[doc.language] = (languageCounts[doc.language] || 0) + 1;
    typeCounts[doc.documentType] = (typeCounts[doc.documentType] || 0) + 1;
  }
  
  const index = {
    totalDocuments: allDocuments.length,
    languages: Object.keys(languageCounts),
    languageCounts,
    documentTypes: Object.keys(typeCounts),
    typeCounts,
    lastUpdated: new Date().toISOString(),
    documents: allDocuments.map(doc => ({
      id: doc.id,
      title: doc.title,
      language: doc.language,
      documentType: doc.documentType,
      source: doc.source
    }))
  };
  
  const indexPath = path.join(corpusDir, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  
  console.log(`\n✓ Updated corpus index`);
  console.log(`  Total documents: ${index.totalDocuments}`);
  console.log(`  Languages: ${index.languages.join(", ")}`);
  console.log(`  Language distribution:`);
  for (const [lang, count] of Object.entries(languageCounts)) {
    console.log(`    - ${lang}: ${count}`);
  }
  console.log(`  Document types: ${index.documentTypes.length}`);
}

// Run the import
importCorpus().catch(console.error);
