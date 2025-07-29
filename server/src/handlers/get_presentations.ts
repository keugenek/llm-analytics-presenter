
import { db } from '../db';
import { presentationsTable } from '../db/schema';
import { type Presentation } from '../schema';
import { desc } from 'drizzle-orm';

export const getPresentations = async (): Promise<Presentation[]> => {
  try {
    const results = await db.select()
      .from(presentationsTable)
      .orderBy(desc(presentationsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Get presentations failed:', error);
    throw error;
  }
};
