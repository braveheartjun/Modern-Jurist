import { describe, expect, it, beforeEach } from "vitest";
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

describe("version management", () => {
  it("saves a document version", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.version.save({
      documentId: "test-doc-1",
      content: "This is the translated content.",
      userId: 1,
      userName: "Test User",
      changeDescription: "Initial translation",
    });

    expect(result).toEqual({ success: true });
  });

  it("retrieves version history for a document", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First save a version
    await caller.version.save({
      documentId: "test-doc-2",
      content: "Version 1 content",
      userId: 1,
      userName: "Test User",
      changeDescription: "First version",
    });

    // Retrieve versions
    const result = await caller.version.list({
      documentId: "test-doc-2",
    });

    expect(result.versions).toBeDefined();
    expect(result.versions.length).toBeGreaterThan(0);
    expect(result.versions[0].documentId).toBe("test-doc-2");
  });

  it("retrieves a specific version by ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Save a version
    await caller.version.save({
      documentId: "test-doc-3",
      content: "Specific version content",
      userId: 1,
      userName: "Test User",
    });

    // Get the version list to find the ID
    const listResult = await caller.version.list({
      documentId: "test-doc-3",
    });

    const versionId = listResult.versions[0].id;

    // Retrieve the specific version
    const result = await caller.version.getById({
      versionId,
    });

    expect(result.version).toBeDefined();
    expect(result.version?.content).toBe("Specific version content");
  });
});
