import { invokeLLM } from "./_core/llm";

export interface Citation {
  id: string;
  originalText: string;
  suggestedCitation: string;
  caseTitle: string;
  year: string;
  court: string;
  reporter: string; // AIR, SCC, etc.
  volume?: string;
  page?: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Detects case law references in text and generates standard citations
 */
export async function detectAndGenerateCitations(text: string): Promise<Citation[]> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a legal citation expert specializing in Indian case law. Your task is to:
1. Identify all case law references in the provided text (even informal mentions)
2. Generate properly formatted citations in standard Indian legal format

For each case reference found, provide:
- The exact text span where the reference appears
- A properly formatted citation (e.g., "AIR 2024 SC 123" or "2024 SCC 456")
- Case title, year, court, reporter details

Return your response as a JSON array.`,
        },
        {
          role: "user",
          content: `Analyze this legal text and identify all case law references, then generate proper citations:\n\n${text}`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "citation_detection",
          strict: true,
          schema: {
            type: "object",
            properties: {
              citations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    originalText: {
                      type: "string",
                      description: "The exact text from the document that references the case",
                    },
                    suggestedCitation: {
                      type: "string",
                      description: "Properly formatted citation (e.g., 'AIR 2024 SC 123')",
                    },
                    caseTitle: {
                      type: "string",
                      description: "Full case title (e.g., 'State of Maharashtra v. XYZ')",
                    },
                    year: {
                      type: "string",
                      description: "Year of the judgment",
                    },
                    court: {
                      type: "string",
                      description: "Court name (e.g., 'Supreme Court', 'Bombay High Court')",
                    },
                    reporter: {
                      type: "string",
                      description: "Reporter abbreviation (e.g., 'AIR', 'SCC', 'BomLR')",
                    },
                    volume: {
                      type: "string",
                      description: "Volume number if applicable",
                    },
                    page: {
                      type: "string",
                      description: "Page number if applicable",
                    },
                    startIndex: {
                      type: "integer",
                      description: "Character index where the reference starts in the original text",
                    },
                    endIndex: {
                      type: "integer",
                      description: "Character index where the reference ends in the original text",
                    },
                  },
                  required: [
                    "originalText",
                    "suggestedCitation",
                    "caseTitle",
                    "year",
                    "court",
                    "reporter",
                    "startIndex",
                    "endIndex",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["citations"],
            additionalProperties: false,
          },
        },
      },
    });

    const message = response.choices[0]?.message;
    if (!message || !message.content) {
      return [];
    }

    const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
    const parsed = JSON.parse(content);
    
    // Add unique IDs to each citation
    return parsed.citations.map((citation: Omit<Citation, "id">, index: number) => ({
      ...citation,
      id: `citation-${Date.now()}-${index}`,
    }));
  } catch (error) {
    console.error("[Citation Generator] Error:", error);
    return [];
  }
}
