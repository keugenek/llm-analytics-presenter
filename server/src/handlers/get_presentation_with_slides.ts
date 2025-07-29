
import { db } from '../db';
import { presentationsTable, slidesTable } from '../db/schema';
import { type PresentationWithSlides } from '../schema';
import { eq, asc } from 'drizzle-orm';

export const getPresentationWithSlides = async (presentationId: number): Promise<PresentationWithSlides | null> => {
  try {
    // First get the presentation
    const presentationResults = await db.select()
      .from(presentationsTable)
      .where(eq(presentationsTable.id, presentationId))
      .execute();

    if (presentationResults.length === 0) {
      return null;
    }

    const presentation = presentationResults[0];

    // Then get all slides for this presentation, ordered by order_index
    const slides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.presentation_id, presentationId))
      .orderBy(asc(slidesTable.order_index))
      .execute();

    return {
      id: presentation.id,
      title: presentation.title,
      description: presentation.description,
      view_count: presentation.view_count,
      created_at: presentation.created_at,
      updated_at: presentation.updated_at,
      slides: slides.map(slide => ({
        id: slide.id,
        title: slide.title,
        content: slide.content,
        image_url: slide.image_url,
        order_index: slide.order_index,
        created_at: slide.created_at
      }))
    };
  } catch (error) {
    console.error('Failed to get presentation with slides:', error);
    throw error;
  }
};
