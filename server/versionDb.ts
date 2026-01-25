import { desc, eq } from "drizzle-orm";
import { documentVersions, InsertDocumentVersion } from "../drizzle/schema";
import { getDb } from "./db";

export async function saveDocumentVersion(version: InsertDocumentVersion) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(documentVersions).values(version);
  return result;
}

export async function getDocumentVersions(documentId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const versions = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.documentId, documentId))
    .orderBy(desc(documentVersions.createdAt));

  return versions;
}

export async function getVersionById(versionId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(documentVersions)
    .where(eq(documentVersions.id, versionId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}
