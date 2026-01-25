import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { detectAndGenerateCitations } from "./citationGenerator";
import { z } from "zod";
import { saveDocumentVersion, getDocumentVersions, getVersionById } from "./versionDb";
import { generatePDFWithCitations } from "./pdfGenerator";
import { saveTranslationPair, findSimilarTranslations } from "./translationMemoryDb";

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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
