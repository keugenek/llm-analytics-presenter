
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { presentationsTable } from '../db/schema';
import { type CreatePresentationInput } from '../schema';
import { getPresentations } from '../handlers/get_presentations';

describe('getPresentations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no presentations exist', async () => {
    const result = await getPresentations();
    expect(result).toEqual([]);
  });

  it('should return all presentations', async () => {
    // Create test presentations
    await db.insert(presentationsTable)
      .values([
        {
          title: 'First Presentation',
          description: 'First description'
        },
        {
          title: 'Second Presentation', 
          description: null
        }
      ])
      .execute();

    const result = await getPresentations();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBeDefined();
    expect(result[0].view_count).toEqual(0);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    expect(result[0].id).toBeDefined();
  });

  it('should return presentations ordered by created_at DESC', async () => {
    // Create presentations with slight delay to ensure different timestamps
    await db.insert(presentationsTable)
      .values({
        title: 'Older Presentation',
        description: 'Older'
      })
      .execute();

    // Small delay to ensure different created_at timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(presentationsTable)
      .values({
        title: 'Newer Presentation',
        description: 'Newer'
      })
      .execute();

    const result = await getPresentations();

    expect(result).toHaveLength(2);
    expect(result[0].title).toEqual('Newer Presentation');
    expect(result[1].title).toEqual('Older Presentation');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should handle presentations with null descriptions', async () => {
    await db.insert(presentationsTable)
      .values({
        title: 'Test Presentation',
        description: null
      })
      .execute();

    const result = await getPresentations();

    expect(result).toHaveLength(1);
    expect(result[0].title).toEqual('Test Presentation');
    expect(result[0].description).toBeNull();
  });
});
