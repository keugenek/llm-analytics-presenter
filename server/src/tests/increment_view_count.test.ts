
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { presentationsTable } from '../db/schema';
import { type CreatePresentationInput } from '../schema';
import { incrementViewCount } from '../handlers/increment_view_count';
import { eq } from 'drizzle-orm';

const testPresentationInput: CreatePresentationInput = {
  title: 'Test Presentation',
  description: 'A presentation for testing'
};

describe('incrementViewCount', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should increment view count by 1', async () => {
    // Create a test presentation
    const [presentation] = await db.insert(presentationsTable)
      .values(testPresentationInput)
      .returning()
      .execute();

    const initialViewCount = presentation.view_count;
    
    // Increment view count
    const result = await incrementViewCount(presentation.id);

    expect(result).not.toBeNull();
    expect(result!.view_count).toEqual(initialViewCount + 1);
    expect(result!.id).toEqual(presentation.id);
    expect(result!.title).toEqual(presentation.title);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update the database record', async () => {
    // Create a test presentation
    const [presentation] = await db.insert(presentationsTable)
      .values(testPresentationInput)
      .returning()
      .execute();

    const initialViewCount = presentation.view_count;
    
    // Increment view count
    await incrementViewCount(presentation.id);

    // Verify database was updated
    const updatedPresentations = await db.select()
      .from(presentationsTable)
      .where(eq(presentationsTable.id, presentation.id))
      .execute();

    expect(updatedPresentations).toHaveLength(1);
    expect(updatedPresentations[0].view_count).toEqual(initialViewCount + 1);
    expect(updatedPresentations[0].updated_at).toBeInstanceOf(Date);
    expect(updatedPresentations[0].updated_at > presentation.updated_at).toBe(true);
  });

  it('should return null for non-existent presentation', async () => {
    const result = await incrementViewCount(999);
    expect(result).toBeNull();
  });

  it('should handle multiple increments correctly', async () => {
    // Create a test presentation
    const [presentation] = await db.insert(presentationsTable)
      .values(testPresentationInput)
      .returning()
      .execute();

    const initialViewCount = presentation.view_count;
    
    // Increment multiple times
    await incrementViewCount(presentation.id);
    await incrementViewCount(presentation.id);
    const finalResult = await incrementViewCount(presentation.id);

    expect(finalResult).not.toBeNull();
    expect(finalResult!.view_count).toEqual(initialViewCount + 3);
  });
});
