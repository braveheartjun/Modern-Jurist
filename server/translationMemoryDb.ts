import { desc, eq, like, sql } from "drizzle-orm";
import { translationMemory, InsertTranslationMemory } from "../drizzle/schema";
import { getDb } from "./db";

export async function saveTranslationPair(translation: InsertTranslationMemory) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if this exact pair already exists
  const existing = await db
    .select()
    .from(translationMemory)
    .where(
      sql`${translationMemory.sourceText} = ${translation.sourceText} 
          AND ${translationMemory.targetText} = ${translation.targetText}
          AND ${translationMemory.sourceLang} = ${translation.sourceLang}
          AND ${translationMemory.targetLang} = ${translation.targetLang}`
    )
    .limit(1);

  if (existing.length > 0) {
    // Update usage count and last used time
    await db
      .update(translationMemory)
      .set({
        usageCount: sql`${translationMemory.usageCount} + 1`,
        lastUsedAt: new Date(),
      })
      .where(eq(translationMemory.id, existing[0].id));

    return existing[0];
  } else {
    // Insert new translation pair
    const result = await db.insert(translationMemory).values(translation);
    return result;
  }
}

export async function findSimilarTranslations(
  sourceText: string,
  sourceLang: string,
  targetLang: string,
  limit: number = 5
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Simple keyword-based matching (can be enhanced with fuzzy matching)
  const keywords = sourceText
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 5); // Take first 5 significant words

  if (keywords.length === 0) {
    return [];
  }

  // Build LIKE conditions for each keyword
  const likeConditions = keywords.map((keyword) =>
    like(translationMemory.sourceText, `%${keyword}%`)
  );

  const results = await db
    .select()
    .from(translationMemory)
    .where(
      sql`${translationMemory.sourceLang} = ${sourceLang} 
          AND ${translationMemory.targetLang} = ${targetLang}
          AND (${sql.join(likeConditions, sql` OR `)})`
    )
    .orderBy(desc(translationMemory.usageCount), desc(translationMemory.lastUsedAt))
    .limit(limit);

  return results;
}

export async function getTranslationMemoryStats(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const stats = await db
    .select({
      totalPairs: sql<number>`COUNT(*)`,
      totalUsage: sql<number>`SUM(${translationMemory.usageCount})`,
    })
    .from(translationMemory)
    .where(eq(translationMemory.userId, userId));

  return stats[0] || { totalPairs: 0, totalUsage: 0 };
}
