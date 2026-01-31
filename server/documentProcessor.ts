import mammoth from "mammoth";

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use pdfjs-dist legacy build for Node.js
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer);
    const pdf = pdfjs.getDocument(uint8Array);
    const document = await pdf.promise;
    
    let text = "";
    for (let i = 1; i <= document.numPages; i++) {
      const page = await document.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    
    return text || "";
  } catch (error) {
    console.error("[Document Processor] PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF: " + (error instanceof Error ? error.message : String(error)));
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
