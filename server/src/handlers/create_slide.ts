
import { db } from '../db';
import { slidesTable, presentationsTable } from '../db/schema';
import { type CreateSlideInput, type Slide } from '../schema';
import { eq } from 'drizzle-orm';

export const createSlide = async (input: CreateSlideInput): Promise<Slide> => {
  try {
    // Validate that presentation exists
    const presentation = await db.select()
      .from(presentationsTable)
      .where(eq(presentationsTable.id, input.presentation_id))
      .execute();

    if (presentation.length === 0) {
      throw new Error(`Presentation with id ${input.presentation_id} not found`);
    }

    // Insert slide record
    const result = await db.insert(slidesTable)
      .values({
        presentation_id: input.presentation_id,
        title: input.title,
        content: input.content,
        image_url: input.image_url,
        order_index: input.order_index
      })
      .returning()
      .execute();

    // Return only the fields that match the Slide schema
    const slide = result[0];
    return {
      id: slide.id,
      title: slide.title,
      content: slide.content,
      image_url: slide.image_url,
      order_index: slide.order_index,
      created_at: slide.created_at
    };
  } catch (error) {
    console.error('Slide creation failed:', error);
    throw error;
  }
};
