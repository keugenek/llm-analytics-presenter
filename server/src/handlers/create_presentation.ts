
import { db } from '../db';
import { presentationsTable } from '../db/schema';
import { type CreatePresentationInput, type Presentation } from '../schema';

export const createPresentation = async (input: CreatePresentationInput): Promise<Presentation> => {
  try {
    // Insert presentation record
    const result = await db.insert(presentationsTable)
      .values({
        title: input.title,
        description: input.description,
        view_count: 0 // Default value as specified in schema
      })
      .returning()
      .execute();

    const presentation = result[0];
    return presentation;
  } catch (error) {
    console.error('Presentation creation failed:', error);
    throw error;
  }
};
