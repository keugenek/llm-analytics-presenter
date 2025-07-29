
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { presentationsTable } from '../db/schema';
import { type CreatePresentationInput } from '../schema';
import { createPresentation } from '../handlers/create_presentation';
import { eq } from 'drizzle-orm';

// Test input with all required fields
const testInput: CreatePresentationInput = {
  title: 'Test Presentation',
  description: 'A presentation for testing'
};

// Test input with null description
const testInputNullDescription: CreatePresentationInput = {
  title: 'Test Presentation No Description',
  description: null
};

describe('createPresentation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a presentation with description', async () => {
    const result = await createPresentation(testInput);

    // Basic field validation
    expect(result.title).toEqual('Test Presentation');
    expect(result.description).toEqual('A presentation for testing');
    expect(result.view_count).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a presentation with null description', async () => {
    const result = await createPresentation(testInputNullDescription);

    // Basic field validation
    expect(result.title).toEqual('Test Presentation No Description');
    expect(result.description).toBeNull();
    expect(result.view_count).toEqual(0);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save presentation to database', async () => {
    const result = await createPresentation(testInput);

    // Query using proper drizzle syntax
    const presentations = await db.select()
      .from(presentationsTable)
      .where(eq(presentationsTable.id, result.id))
      .execute();

    expect(presentations).toHaveLength(1);
    expect(presentations[0].title).toEqual('Test Presentation');
    expect(presentations[0].description).toEqual('A presentation for testing');
    expect(presentations[0].view_count).toEqual(0);
    expect(presentations[0].created_at).toBeInstanceOf(Date);
    expect(presentations[0].updated_at).toBeInstanceOf(Date);
  });

  it('should set default view_count to 0', async () => {
    const result = await createPresentation(testInput);

    expect(result.view_count).toEqual(0);

    // Verify in database
    const presentations = await db.select()
      .from(presentationsTable)
      .where(eq(presentationsTable.id, result.id))
      .execute();

    expect(presentations[0].view_count).toEqual(0);
  });
});
