import mammoth from "mammoth";

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for pdf-parse to handle ESM/CJS compatibility
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("[Document Processor] PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

/**
 * Extract text from DOCX buffer
 */
export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("[Document Processor] DOCX extraction error:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

/**
 * Detect document type from filename and extract text accordingly
 */
export async function processDocument(
  buffer: Buffer,
  filename: string
): Promise<{ text: string; type: string }> {
  const extension = filename.toLowerCase().split(".").pop();

  switch (extension) {
    case "pdf":
      return {
        text: await extractTextFromPDF(buffer),
        type: "pdf",
      };
    case "docx":
    case "doc":
      return {
        text: await extractTextFromDOCX(buffer),
        type: "docx",
      };
    case "txt":
      return {
        text: buffer.toString("utf-8"),
        type: "txt",
      };
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}
