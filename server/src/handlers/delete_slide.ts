
import { db } from '../db';
import { slidesTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export const deleteSlide = async (slideId: number): Promise<boolean> => {
  try {
    // Delete the slide with the given ID
    const result = await db.delete(slidesTable)
      .where(eq(slidesTable.id, slideId))
      .execute();

    // Return true if a row was deleted, false if no slide was found
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Slide deletion failed:', error);
    throw error;
  }
};
