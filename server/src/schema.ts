
import { z } from 'zod';

// Slide schema
export const slideSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  image_url: z.string().url().nullable(),
  order_index: z.number().int(),
  created_at: z.coerce.date()
});

export type Slide = z.infer<typeof slideSchema>;

// Presentation schema
export const presentationSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  view_count: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Presentation = z.infer<typeof presentationSchema>;

// Complete presentation with slides
export const presentationWithSlidesSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  view_count: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  slides: z.array(slideSchema)
});

export type PresentationWithSlides = z.infer<typeof presentationWithSlidesSchema>;

// Input schema for creating slides
export const createSlideInputSchema = z.object({
  presentation_id: z.number(),
  title: z.string(),
  content: z.string(),
  image_url: z.string().url().nullable(),
  order_index: z.number().int().nonnegative()
});

export type CreateSlideInput = z.infer<typeof createSlideInputSchema>;

// Input schema for creating presentation
export const createPresentationInputSchema = z.object({
  title: z.string(),
  description: z.string().nullable()
});

export type CreatePresentationInput = z.infer<typeof createPresentationInputSchema>;

// Input schema for updating slide
export const updateSlideInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().url().nullable().optional(),
  order_index: z.number().int().nonnegative().optional()
});

export type UpdateSlideInput = z.infer<typeof updateSlideInputSchema>;

// Input schema for updating presentation
export const updatePresentationInputSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().nullable().optional()
});

export type UpdatePresentationInput = z.infer<typeof updatePresentationInputSchema>;
