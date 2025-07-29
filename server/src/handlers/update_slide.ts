
import { db } from '../db';
import { slidesTable } from '../db/schema';
import { type UpdateSlideInput, type Slide } from '../schema';
import { eq } from 'drizzle-orm';

export const updateSlide = async (input: UpdateSlideInput): Promise<Slide | null> => {
  try {
    // Build update object with only provided fields
    const updateData: Partial<typeof slidesTable.$inferInsert> = {};
    
    if (input.title !== undefined) {
      updateData.title = input.title;
    }
    
    if (input.content !== undefined) {
      updateData.content = input.content;
    }
    
    if (input.image_url !== undefined) {
      updateData.image_url = input.image_url;
    }
    
    if (input.order_index !== undefined) {
      updateData.order_index = input.order_index;
    }

    // If no fields to update, return null
    if (Object.keys(updateData).length === 0) {
      return null;
    }

    // Update the slide
    const result = await db.update(slidesTable)
      .set(updateData)
      .where(eq(slidesTable.id, input.id))
      .returning()
      .execute();

    // Return the updated slide or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Slide update failed:', error);
    throw error;
  }
};
