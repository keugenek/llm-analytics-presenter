
import { db } from '../db';
import { presentationsTable } from '../db/schema';
import { type Presentation } from '../schema';
import { eq, sql } from 'drizzle-orm';

export const incrementViewCount = async (presentationId: number): Promise<Presentation | null> => {
  try {
    // Update the presentation's view count and updated_at timestamp
    const result = await db.update(presentationsTable)
      .set({
        view_count: sql`${presentationsTable.view_count} + 1`,
        updated_at: new Date()
      })
      .where(eq(presentationsTable.id, presentationId))
      .returning()
      .execute();

    // Return the updated presentation or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('View count increment failed:', error);
    throw error;
  }
};
