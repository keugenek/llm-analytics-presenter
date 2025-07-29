
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { presentationsTable, slidesTable } from '../db/schema';
import { deleteSlide } from '../handlers/delete_slide';
import { eq } from 'drizzle-orm';

describe('deleteSlide', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing slide', async () => {
    // Create a presentation first
    const presentationResult = await db.insert(presentationsTable)
      .values({
        title: 'Test Presentation',
        description: 'A test presentation'
      })
      .returning()
      .execute();

    const presentation = presentationResult[0];

    // Create a slide
    const slideResult = await db.insert(slidesTable)
      .values({
        presentation_id: presentation.id,
        title: 'Test Slide',
        content: 'Test slide content',
        image_url: 'https://example.com/image.jpg',
        order_index: 0
      })
      .returning()
      .execute();

    const slide = slideResult[0];

    // Delete the slide
    const result = await deleteSlide(slide.id);

    // Should return true for successful deletion
    expect(result).toBe(true);

    // Verify slide was deleted from database
    const remainingSlides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.id, slide.id))
      .execute();

    expect(remainingSlides).toHaveLength(0);
  });

  it('should return false when deleting non-existent slide', async () => {
    // Try to delete a slide that doesn't exist
    const result = await deleteSlide(999);

    // Should return false when no slide is found
    expect(result).toBe(false);
  });

  it('should not affect other slides when deleting one slide', async () => {
    // Create a presentation
    const presentationResult = await db.insert(presentationsTable)
      .values({
        title: 'Test Presentation',
        description: 'A test presentation'
      })
      .returning()
      .execute();

    const presentation = presentationResult[0];

    // Create multiple slides
    const slideResults = await db.insert(slidesTable)
      .values([
        {
          presentation_id: presentation.id,
          title: 'Slide 1',
          content: 'Content 1',
          image_url: null,
          order_index: 0
        },
        {
          presentation_id: presentation.id,
          title: 'Slide 2',
          content: 'Content 2',
          image_url: 'https://example.com/image2.jpg',
          order_index: 1
        },
        {
          presentation_id: presentation.id,
          title: 'Slide 3',
          content: 'Content 3',
          image_url: null,
          order_index: 2
        }
      ])
      .returning()
      .execute();

    const slidesToKeep = [slideResults[0], slideResults[2]];
    const slideToDelete = slideResults[1];

    // Delete the middle slide
    const result = await deleteSlide(slideToDelete.id);

    expect(result).toBe(true);

    // Verify only the target slide was deleted
    const remainingSlides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.presentation_id, presentation.id))
      .execute();

    expect(remainingSlides).toHaveLength(2);

    // Check that the correct slides remain
    const remainingIds = remainingSlides.map(slide => slide.id);
    expect(remainingIds).toContain(slidesToKeep[0].id);
    expect(remainingIds).toContain(slidesToKeep[1].id);
    expect(remainingIds).not.toContain(slideToDelete.id);
  });

  it('should handle deletion with null image_url', async () => {
    // Create a presentation
    const presentationResult = await db.insert(presentationsTable)
      .values({
        title: 'Test Presentation',
        description: null
      })
      .returning()
      .execute();

    const presentation = presentationResult[0];

    // Create a slide with null image_url
    const slideResult = await db.insert(slidesTable)
      .values({
        presentation_id: presentation.id,
        title: 'Slide with no image',
        content: 'This slide has no image',
        image_url: null,
        order_index: 0
      })
      .returning()
      .execute();

    const slide = slideResult[0];

    // Delete the slide
    const result = await deleteSlide(slide.id);

    expect(result).toBe(true);

    // Verify deletion
    const remainingSlides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.id, slide.id))
      .execute();

    expect(remainingSlides).toHaveLength(0);
  });
});
