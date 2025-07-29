
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { presentationsTable, slidesTable } from '../db/schema';
import { getPresentationWithSlides } from '../handlers/get_presentation_with_slides';

describe('getPresentationWithSlides', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent presentation', async () => {
    const result = await getPresentationWithSlides(999);
    expect(result).toBeNull();
  });

  it('should return presentation with empty slides array', async () => {
    // Create presentation without slides
    const presentations = await db.insert(presentationsTable)
      .values({
        title: 'Empty Presentation',
        description: 'A presentation with no slides'
      })
      .returning()
      .execute();

    const presentation = presentations[0];

    const result = await getPresentationWithSlides(presentation.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(presentation.id);
    expect(result!.title).toEqual('Empty Presentation');
    expect(result!.description).toEqual('A presentation with no slides');
    expect(result!.view_count).toEqual(0);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.slides).toEqual([]);
  });

  it('should return presentation with slides ordered by order_index', async () => {
    // Create presentation
    const presentations = await db.insert(presentationsTable)
      .values({
        title: 'Test Presentation',
        description: 'A test presentation with slides'
      })
      .returning()
      .execute();

    const presentation = presentations[0];

    // Create slides in different order to test ordering
    await db.insert(slidesTable)
      .values([
        {
          presentation_id: presentation.id,
          title: 'Third Slide',
          content: 'This is the third slide',
          image_url: 'https://example.com/slide3.jpg',
          order_index: 2
        },
        {
          presentation_id: presentation.id,
          title: 'First Slide',
          content: 'This is the first slide',
          image_url: null,
          order_index: 0
        },
        {
          presentation_id: presentation.id,
          title: 'Second Slide',
          content: 'This is the second slide',
          image_url: 'https://example.com/slide2.jpg',
          order_index: 1
        }
      ])
      .execute();

    const result = await getPresentationWithSlides(presentation.id);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(presentation.id);
    expect(result!.title).toEqual('Test Presentation');
    expect(result!.description).toEqual('A test presentation with slides');
    expect(result!.view_count).toEqual(0);
    expect(result!.slides).toHaveLength(3);

    // Verify slides are ordered by order_index
    expect(result!.slides[0].title).toEqual('First Slide');
    expect(result!.slides[0].order_index).toEqual(0);
    expect(result!.slides[0].image_url).toBeNull();

    expect(result!.slides[1].title).toEqual('Second Slide');
    expect(result!.slides[1].order_index).toEqual(1);
    expect(result!.slides[1].image_url).toEqual('https://example.com/slide2.jpg');

    expect(result!.slides[2].title).toEqual('Third Slide');
    expect(result!.slides[2].order_index).toEqual(2);
    expect(result!.slides[2].image_url).toEqual('https://example.com/slide3.jpg');

    // Verify all slides have required fields
    result!.slides.forEach(slide => {
      expect(slide.id).toBeDefined();
      expect(slide.title).toBeDefined();
      expect(slide.content).toBeDefined();
      expect(slide.order_index).toBeDefined();
      expect(slide.created_at).toBeInstanceOf(Date);
    });
  });

  it('should handle presentation with null description', async () => {
    const presentations = await db.insert(presentationsTable)
      .values({
        title: 'Presentation No Description',
        description: null
      })
      .returning()
      .execute();

    const presentation = presentations[0];

    const result = await getPresentationWithSlides(presentation.id);

    expect(result).not.toBeNull();
    expect(result!.title).toEqual('Presentation No Description');
    expect(result!.description).toBeNull();
    expect(result!.slides).toEqual([]);
  });
});
