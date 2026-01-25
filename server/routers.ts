import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { detectAndGenerateCitations } from "./citationGenerator";
import { z } from "zod";
import { searchDocuments, findByCitation, getDatabaseStats, getAllSources, getAllDocumentTypes } from "./databaseSearch";
import { saveDocumentVersion, getDocumentVersions, getVersionById } from "./versionDb";
import { generatePDFWithCitations } from "./pdfGenerator";
import { generateDOCX } from "./docxGenerator";
import { saveTranslationPair, findSimilarTranslations } from "./translationMemoryDb";
import { processDocument } from "./documentProcessor";
import { translateDocument } from "./translationEngine";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Citation generator
  citation: router({
    generate: publicProcedure
      .input(z.object({ text: z.string() }))
      .mutation(async ({ input }) => {
        const citations = await detectAndGenerateCitations(input.text);
        return { citations };
      }),
  }),

  // Version management
  version: router({
    save: publicProcedure
      .input(
        z.object({
          documentId: z.string(),
          content: z.string(),
          userId: z.number(),
          userName: z.string(),
          changeDescription: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await saveDocumentVersion(input);
        return { success: true };
      }),
    list: publicProcedure
      .input(z.object({ documentId: z.string() }))
      .query(async ({ input }) => {
        const versions = await getDocumentVersions(input.documentId);
        return { versions };
      }),
    getById: publicProcedure
      .input(z.object({ versionId: z.number() }))
      .query(async ({ input }) => {
        const version = await getVersionById(input.versionId);
        return { version };
      }),
  }),

  // PDF generation
  pdf: router({
    generateWithCitations: publicProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          citations: z.array(z.any()),
          sourceLang: z.string(),
          targetLang: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const pdfBuffer = await generatePDFWithCitations(input);
        return { pdf: pdfBuffer.toString("base64") };
      }),
  }),

  // DOCX generation
  docx: router({
    generateWithCitations: publicProcedure
      .input(
        z.object({
          title: z.string(),
          content: z.string(),
          citations: z.array(z.any()),
          sourceLang: z.string(),
          targetLang: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const docxBuffer = await generateDOCX(input);
        return { docx: docxBuffer.toString("base64") };
      }),
  }),

  // Document translation
  translate: router({
    document: publicProcedure
      .input(
        z.object({
          fileBuffer: z.string(), // base64 encoded
          filename: z.string(),
          sourceLang: z.string(),
          targetLang: z.string(),
          customGlossary: z.array(z.object({ source: z.string(), target: z.string() })).optional(),
          documentType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Decode base64 file buffer
        const buffer = Buffer.from(input.fileBuffer, "base64");

        // Extract text from document
        const { text: sourceText, type } = await processDocument(buffer, input.filename);

        // Translate the extracted text using new engine
        const result = await translateDocument({
          text: sourceText,
          sourceLang: input.sourceLang,
          targetLang: input.targetLang,
          documentType: input.documentType,
        });

        return {
          sourceText,
          translatedText: result.translatedText,
          confidence: result.confidence,
          documentType: type,
          qualityScore: { 
            overall: result.confidence, 
            confidence: result.confidence >= 80 ? 'high' as const : result.confidence >= 60 ? 'medium' as const : 'low' as const,
            factors: { terminologyMatch: 0, corpusSimilarity: 0, complexity: 0 },
            details: `Translation confidence: ${result.confidence}%`
          },
        };
      }),
  }),

  // Translation memory
  translationMemory: router({
    save: publicProcedure
      .input(
        z.object({
          sourceText: z.string(),
          targetText: z.string(),
          sourceLang: z.string(),
          targetLang: z.string(),
          userId: z.number(),
          userName: z.string(),
          documentType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await saveTranslationPair(input);
        return { success: true };
      }),
    findSimilar: publicProcedure
      .input(
        z.object({
          sourceText: z.string(),
          sourceLang: z.string(),
          targetLang: z.string(),
          limit: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        const suggestions = await findSimilarTranslations(
          input.sourceText,
          input.sourceLang,
          input.targetLang,
          input.limit
        );
        return { suggestions };
      }),
  }),

  // Database search and resource recall
  database: router({
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        filters: z.object({
          source: z.string().optional(),
          document_type: z.string().optional(),
          year: z.string().optional(),
          court: z.string().optional()
        }).optional()
      }))
      .query(async ({ input }) => {
        return await searchDocuments(input.query, input.filters);
      }),
    
    findByCitation: publicProcedure
      .input(z.object({ citation: z.string() }))
      .query(async ({ input }) => {
        return await findByCitation(input.citation);
      }),
    
    stats: publicProcedure
      .query(async () => {
        return await getDatabaseStats();
      }),
    
    sources: publicProcedure
      .query(async () => {
        return await getAllSources();
      }),
    
    documentTypes: publicProcedure
      .query(async () => {
        return await getAllDocumentTypes();
      })
  }),
});

export type AppRouter = typeof appRouter;
