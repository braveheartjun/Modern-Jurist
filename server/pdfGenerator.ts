import PDFDocument from "pdfkit";
import { Citation } from "./citationGenerator";

export interface PDFGenerationOptions {
  title: string;
  content: string;
  citations: Citation[];
  sourceLang: string;
  targetLang: string;
}

export function generatePDFWithCitations(options: PDFGenerationOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on("error", reject);

      // Header
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Legal Document Translation", { align: "center" });

      doc.moveDown(0.5);
      doc
        .fontSize(10)
        .font("Helvetica")
        .text(`${options.sourceLang} → ${options.targetLang}`, { align: "center" });

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);

      // Document Title
      if (options.title) {
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(options.title, { align: "center" });
        doc.moveDown(1);
      }

      // Main Content
      doc.fontSize(11).font("Helvetica");

      const contentLines = options.content.split("\n");
      contentLines.forEach((line, index) => {
        // Check if we need a new page (leaving space for footer)
        if (doc.y > doc.page.height - 80) {
          doc.addPage();
        }
        
        if (line.trim()) {
          doc.text(line, { align: "justify", lineGap: 3 });
        } else {
          doc.moveDown(0.5);
        }
      });

      // Citations Section
      if (options.citations.length > 0) {
        doc.addPage();
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("Citations & References", { underline: true });
        doc.moveDown(1);

        doc.fontSize(10).font("Helvetica");

        options.citations.forEach((citation, index) => {
          doc
            .font("Helvetica-Bold")
            .text(`[${index + 1}] ${citation.suggestedCitation}`, { continued: false });

          doc.font("Helvetica").text(`    ${citation.caseTitle}`, { indent: 20 });

          doc.text(
            `    ${citation.court}, ${citation.year} | Reporter: ${citation.reporter}`,
            { indent: 20 }
          );

          if (citation.volume || citation.page) {
            doc.text(
              `    Volume: ${citation.volume || "N/A"}, Page: ${citation.page || "N/A"}`,
              { indent: 20 }
            );
          }

          doc.moveDown(0.8);
        });
      }

      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(pages.start + i);
        doc
          .fontSize(8)
          .font("Helvetica")
          .text(
            `Page ${i + 1} of ${pages.count}`,
            50,
            doc.page.height - 30,
            { align: "center" }
          );
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
