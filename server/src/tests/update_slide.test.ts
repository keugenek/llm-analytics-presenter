
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { presentationsTable, slidesTable } from '../db/schema';
import { type UpdateSlideInput, type CreatePresentationInput, type CreateSlideInput } from '../schema';
import { updateSlide } from '../handlers/update_slide';
import { eq } from 'drizzle-orm';

// Test data
const testPresentation: CreatePresentationInput = {
  title: 'Test Presentation',
  description: 'A presentation for testing'
};

const testSlide: CreateSlideInput = {
  presentation_id: 1, // Will be set after creating presentation
  title: 'Original Title',
  content: 'Original content',
  image_url: 'https://example.com/image.jpg',
  order_index: 0
};

describe('updateSlide', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a slide with all fields', async () => {
    // Create prerequisite presentation
    const presentationResult = await db.insert(presentationsTable)
      .values(testPresentation)
      .returning()
      .execute();

    // Create slide to update
    const slideData = { ...testSlide, presentation_id: presentationResult[0].id };
    const slideResult = await db.insert(slidesTable)
      .values(slideData)
      .returning()
      .execute();

    const updateInput: UpdateSlideInput = {
      id: slideResult[0].id,
      title: 'Updated Title',
      content: 'Updated content',
      image_url: 'https://example.com/updated.jpg',
      order_index: 5
    };

    const result = await updateSlide(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(slideResult[0].id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.content).toEqual('Updated content');
    expect(result!.image_url).toEqual('https://example.com/updated.jpg');
    expect(result!.order_index).toEqual(5);
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should update only provided fields', async () => {
    // Create prerequisite presentation
    const presentationResult = await db.insert(presentationsTable)
      .values(testPresentation)
      .returning()
      .execute();

    // Create slide to update
    const slideData = { ...testSlide, presentation_id: presentationResult[0].id };
    const slideResult = await db.insert(slidesTable)
      .values(slideData)
      .returning()
      .execute();

    const updateInput: UpdateSlideInput = {
      id: slideResult[0].id,
      title: 'Updated Title Only'
    };

    const result = await updateSlide(updateInput);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Updated Title Only');
    expect(result!.content).toEqual('Original content'); // Should remain unchanged
    expect(result!.image_url).toEqual('https://example.com/image.jpg'); // Should remain unchanged
    expect(result!.order_index).toEqual(0); // Should remain unchanged
  });

  it('should handle nullable image_url field', async () => {
    // Create prerequisite presentation
    const presentationResult = await db.insert(presentationsTable)
      .values(testPresentation)
      .returning()
      .execute();

    // Create slide with null image_url
    const slideData = { ...testSlide, presentation_id: presentationResult[0].id, image_url: null };
    const slideResult = await db.insert(slidesTable)
      .values(slideData)
      .returning()
      .execute();

    const updateInput: UpdateSlideInput = {
      id: slideResult[0].id,
      image_url: 'https://example.com/new-image.jpg'
    };

    const result = await updateSlide(updateInput);

    expect(result).not.toBeNull();
    expect(result!.image_url).toEqual('https://example.com/new-image.jpg');

    // Test setting back to null
    const updateToNull: UpdateSlideInput = {
      id: slideResult[0].id,
      image_url: null
    };

    const nullResult = await updateSlide(updateToNull);
    expect(nullResult!.image_url).toBeNull();
  });

  it('should persist changes in database', async () => {
    // Create prerequisite presentation
    const presentationResult = await db.insert(presentationsTable)
      .values(testPresentation)
      .returning()
      .execute();

    // Create slide to update
    const slideData = { ...testSlide, presentation_id: presentationResult[0].id };
    const slideResult = await db.insert(slidesTable)
      .values(slideData)
      .returning()
      .execute();

    const updateInput: UpdateSlideInput = {
      id: slideResult[0].id,
      title: 'Database Test Title',
      content: 'Database test content'
    };

    await updateSlide(updateInput);

    // Query database directly to verify changes
    const updatedSlides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.id, slideResult[0].id))
      .execute();

    expect(updatedSlides).toHaveLength(1);
    expect(updatedSlides[0].title).toEqual('Database Test Title');
    expect(updatedSlides[0].content).toEqual('Database test content');
  });

  it('should return null for non-existent slide', async () => {
    const updateInput: UpdateSlideInput = {
      id: 99999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateSlide(updateInput);
    expect(result).toBeNull();
  });

  it('should return null when no fields are provided to update', async () => {
    // Create prerequisite presentation
    const presentationResult = await db.insert(presentationsTable)
      .values(testPresentation)
      .returning()
      .execute();

    // Create slide to update
    const slideData = { ...testSlide, presentation_id: presentationResult[0].id };
    const slideResult = await db.insert(slidesTable)
      .values(slideData)
      .returning()
      .execute();

    const updateInput: UpdateSlideInput = {
      id: slideResult[0].id
      // No fields to update
    };

    const result = await updateSlide(updateInput);
    expect(result).toBeNull();
  });
});
