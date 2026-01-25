import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("translation memory", () => {
  it("saves a translation pair", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.translationMemory.save({
      sourceText: "Power of Attorney",
      targetText: "मुख्तारनामा",
      sourceLang: "English",
      targetLang: "Hindi",
      userId: 1,
      userName: "Test User",
      documentType: "Legal Document",
    });

    expect(result).toEqual({ success: true });
  });

  it("finds similar translations", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First save a translation
    await caller.translationMemory.save({
      sourceText: "General Power of Attorney",
      targetText: "सामान्य मुख्तारनामा",
      sourceLang: "English",
      targetLang: "Hindi",
      userId: 1,
      userName: "Test User",
    });

    // Search for similar translations
    const result = await caller.translationMemory.findSimilar({
      sourceText: "Power of Attorney",
      sourceLang: "English",
      targetLang: "Hindi",
      limit: 5,
    });

    expect(result.suggestions).toBeDefined();
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  it("respects language pair when searching", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Save English-Hindi translation
    await caller.translationMemory.save({
      sourceText: "Contract Agreement",
      targetText: "अनुबंध समझौता",
      sourceLang: "English",
      targetLang: "Hindi",
      userId: 1,
      userName: "Test User",
    });

    // Search for English-Marathi (should not return Hindi translation)
    const result = await caller.translationMemory.findSimilar({
      sourceText: "Contract Agreement",
      sourceLang: "English",
      targetLang: "Marathi",
      limit: 5,
    });

    // Should not find the Hindi translation
    const hindiMatch = result.suggestions.find(
      (s) => s.targetText === "अनुबंध समझौता"
    );
    expect(hindiMatch).toBeUndefined();
  });
});
