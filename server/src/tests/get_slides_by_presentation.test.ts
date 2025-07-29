
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { presentationsTable, slidesTable } from '../db/schema';
import { getSlidesByPresentation } from '../handlers/get_slides_by_presentation';
import { eq } from 'drizzle-orm';

describe('getSlidesByPresentation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return slides for a presentation ordered by order_index', async () => {
    // Create test presentation
    const presentationResult = await db.insert(presentationsTable)
      .values({
        title: 'Test Presentation',
        description: 'A test presentation'
      })
      .returning()
      .execute();

    const presentationId = presentationResult[0].id;

    // Create test slides with different order indices
    const slideInputs = [
      {
        presentation_id: presentationId,
        title: 'Slide 3',
        content: 'Third slide content',
        image_url: null,
        order_index: 2
      },
      {
        presentation_id: presentationId,
        title: 'Slide 1',
        content: 'First slide content',
        image_url: 'https://example.com/image1.jpg',
        order_index: 0
      },
      {
        presentation_id: presentationId,
        title: 'Slide 2',
        content: 'Second slide content',
        image_url: null,
        order_index: 1
      }
    ];

    for (const slideInput of slideInputs) {
      await db.insert(slidesTable)
        .values(slideInput)
        .execute();
    }

    const result = await getSlidesByPresentation(presentationId);

    // Should return 3 slides
    expect(result).toHaveLength(3);

    // Should be ordered by order_index ASC
    expect(result[0].title).toEqual('Slide 1');
    expect(result[0].order_index).toEqual(0);
    expect(result[0].image_url).toEqual('https://example.com/image1.jpg');

    expect(result[1].title).toEqual('Slide 2');
    expect(result[1].order_index).toEqual(1);
    expect(result[1].image_url).toBeNull();

    expect(result[2].title).toEqual('Slide 3');
    expect(result[2].order_index).toEqual(2);
    expect(result[2].image_url).toBeNull();

    // Verify all slides have required fields
    result.forEach(slide => {
      expect(slide.created_at).toBeInstanceOf(Date);
      expect(slide.id).toBeDefined();
      expect(typeof slide.title).toBe('string');
      expect(typeof slide.content).toBe('string');
      expect(typeof slide.order_index).toBe('number');
    });
  });

  it('should return empty array for presentation with no slides', async () => {
    // Create test presentation without slides
    const presentationResult = await db.insert(presentationsTable)
      .values({
        title: 'Empty Presentation',
        description: 'A presentation with no slides'
      })
      .returning()
      .execute();

    const presentationId = presentationResult[0].id;

    const result = await getSlidesByPresentation(presentationId);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return empty array for non-existent presentation', async () => {
    const nonExistentId = 99999;

    const result = await getSlidesByPresentation(nonExistentId);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should only return slides for the specified presentation', async () => {
    // Create two presentations
    const presentation1Result = await db.insert(presentationsTable)
      .values({
        title: 'Presentation 1',
        description: 'First presentation'
      })
      .returning()
      .execute();

    const presentation2Result = await db.insert(presentationsTable)
      .values({
        title: 'Presentation 2',
        description: 'Second presentation'
      })
      .returning()
      .execute();

    const presentation1Id = presentation1Result[0].id;
    const presentation2Id = presentation2Result[0].id;

    // Create slides for both presentations
    await db.insert(slidesTable)
      .values({
        presentation_id: presentation1Id,
        title: 'P1 Slide 1',
        content: 'Content for presentation 1',
        image_url: null,
        order_index: 0
      })
      .execute();

    await db.insert(slidesTable)
      .values({
        presentation_id: presentation2Id,
        title: 'P2 Slide 1',
        content: 'Content for presentation 2',
        image_url: null,
        order_index: 0
      })
      .execute();

    await db.insert(slidesTable)
      .values({
        presentation_id: presentation1Id,
        title: 'P1 Slide 2',
        content: 'More content for presentation 1',
        image_url: null,
        order_index: 1
      })
      .execute();

    const result = await getSlidesByPresentation(presentation1Id);

    // Should only return slides for presentation 1
    expect(result).toHaveLength(2);

    // Verify correct ordering
    expect(result[0].title).toEqual('P1 Slide 1');
    expect(result[1].title).toEqual('P1 Slide 2');

    // Verify slides are from the correct presentation by checking database
    for (const slide of result) {
      const dbSlide = await db.select()
        .from(slidesTable)
        .where(eq(slidesTable.id, slide.id))
        .execute();
      
      expect(dbSlide[0].presentation_id).toEqual(presentation1Id);
      expect(dbSlide[0].title).toMatch(/^P1/);
    }
  });
});
