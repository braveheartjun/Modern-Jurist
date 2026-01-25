import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";

interface DocxGenerationOptions {
  title: string;
  content: string;
  sourceLang: string;
  targetLang: string;
  citations?: Array<{
    id: string;
    text: string;
    citation: string;
  }>;
}

/**
 * Generate a DOCX document from translated legal text
 */
export async function generateDOCX(options: DocxGenerationOptions): Promise<Buffer> {
  const { title, content, sourceLang, targetLang, citations = [] } = options;

  // Parse content into paragraphs
  const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 0);

  // Create document sections
  const docSections: Paragraph[] = [];

  // Add title
  docSections.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400,
      },
    })
  );

  // Add metadata
  docSections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Translated from ${sourceLang} to ${targetLang}`,
          italics: true,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 400,
      },
    })
  );

  // Add content paragraphs
  for (const para of paragraphs) {
    // Check if this is a heading (all caps or starts with numbers)
    const isHeading = para === para.toUpperCase() || /^\d+\./.test(para);

    if (isHeading) {
      docSections.push(
        new Paragraph({
          text: para,
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 200,
            after: 200,
          },
        })
      );
    } else {
      // Regular paragraph
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: para,
              size: 24,
            }),
          ],
          spacing: {
            after: 200,
            line: 360,
          },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  // Add citations section if available
  if (citations.length > 0) {
    docSections.push(
      new Paragraph({
        text: "Citations",
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 400,
          after: 200,
        },
      })
    );

    for (let i = 0; i < citations.length; i++) {
      const citation = citations[i];
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `[${i + 1}] `,
              bold: true,
              size: 20,
            }),
            new TextRun({
              text: citation.citation,
              size: 20,
            }),
          ],
          spacing: {
            after: 100,
          },
        })
      );
    }
  }

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: docSections,
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
