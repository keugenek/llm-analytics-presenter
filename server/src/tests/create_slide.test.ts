
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { slidesTable, presentationsTable } from '../db/schema';
import { type CreateSlideInput, type CreatePresentationInput } from '../schema';
import { createSlide } from '../handlers/create_slide';
import { eq } from 'drizzle-orm';

describe('createSlide', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper to create a test presentation
  const createTestPresentation = async (): Promise<number> => {
    const testPresentation: CreatePresentationInput = {
      title: 'Test Presentation',
      description: 'A presentation for testing'
    };

    const result = await db.insert(presentationsTable)
      .values({
        title: testPresentation.title,
        description: testPresentation.description
      })
      .returning()
      .execute();

    return result[0].id;
  };

  it('should create a slide with all fields', async () => {
    const presentationId = await createTestPresentation();

    const testInput: CreateSlideInput = {
      presentation_id: presentationId,
      title: 'Test Slide',
      content: 'This is test slide content',
      image_url: 'https://example.com/image.jpg',
      order_index: 0
    };

    const result = await createSlide(testInput);

    expect(result.title).toEqual('Test Slide');
    expect(result.content).toEqual('This is test slide content');
    expect(result.image_url).toEqual('https://example.com/image.jpg');
    expect(result.order_index).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a slide with null image_url', async () => {
    const presentationId = await createTestPresentation();

    const testInput: CreateSlideInput = {
      presentation_id: presentationId,
      title: 'Test Slide',
      content: 'This is test slide content',
      image_url: null,
      order_index: 0
    };

    const result = await createSlide(testInput);

    expect(result.title).toEqual('Test Slide');
    expect(result.content).toEqual('This is test slide content');
    expect(result.image_url).toBeNull();
    expect(result.order_index).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save slide to database', async () => {
    const presentationId = await createTestPresentation();

    const testInput: CreateSlideInput = {
      presentation_id: presentationId,
      title: 'Test Slide',
      content: 'This is test slide content',
      image_url: 'https://example.com/image.jpg',
      order_index: 1
    };

    const result = await createSlide(testInput);

    const slides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.id, result.id))
      .execute();

    expect(slides).toHaveLength(1);
    expect(slides[0].presentation_id).toEqual(presentationId);
    expect(slides[0].title).toEqual('Test Slide');
    expect(slides[0].content).toEqual('This is test slide content');
    expect(slides[0].image_url).toEqual('https://example.com/image.jpg');
    expect(slides[0].order_index).toEqual(1);
    expect(slides[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when presentation does not exist', async () => {
    const testInput: CreateSlideInput = {
      presentation_id: 999, // Non-existent presentation ID
      title: 'Test Slide',
      content: 'This is test slide content',
      image_url: null,
      order_index: 0
    };

    await expect(createSlide(testInput)).rejects.toThrow(/presentation with id 999 not found/i);
  });

  it('should create slides with different order indices', async () => {
    const presentationId = await createTestPresentation();

    const testInput1: CreateSlideInput = {
      presentation_id: presentationId,
      title: 'First Slide',
      content: 'First slide content',
      image_url: null,
      order_index: 0
    };

    const testInput2: CreateSlideInput = {
      presentation_id: presentationId,
      title: 'Second Slide',
      content: 'Second slide content',
      image_url: null,
      order_index: 1
    };

    const result1 = await createSlide(testInput1);
    const result2 = await createSlide(testInput2);

    expect(result1.order_index).toEqual(0);
    expect(result2.order_index).toEqual(1);
    
    // Verify both slides are in the database with correct presentation_id
    const slides = await db.select()
      .from(slidesTable)
      .where(eq(slidesTable.presentation_id, presentationId))
      .execute();

    expect(slides).toHaveLength(2);
    expect(slides.find(s => s.title === 'First Slide')?.order_index).toEqual(0);
    expect(slides.find(s => s.title === 'Second Slide')?.order_index).toEqual(1);
  });
});
