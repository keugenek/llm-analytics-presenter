
import { db } from '../db';
import { slidesTable } from '../db/schema';
import { type Slide } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getSlidesByPresentation = async (presentationId: number): Promise<Slide[]> => {
  try {
    const results = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.presentation_id, presentationId))
      .orderBy(asc(slidesTable.order_index))
      .execute();

    // Map database results to match Slide schema (without presentation_id)
    return results.map(slide => ({
      id: slide.id,
      title: slide.title,
      content: slide.content,
      image_url: slide.image_url,
      order_index: slide.order_index,
      created_at: slide.created_at
    }));
  } catch (error) {
    console.error('Failed to fetch slides by presentation:', error);
    throw error;
  }
};
