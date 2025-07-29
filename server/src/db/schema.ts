
import { serial, text, pgTable, timestamp, integer, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const presentationsTable = pgTable('presentations', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'), // Nullable by default
  view_count: integer('view_count').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const slidesTable = pgTable('slides', {
  id: serial('id').primaryKey(),
  presentation_id: integer('presentation_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  image_url: text('image_url'), // Nullable by default for optional images
  order_index: integer('order_index').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  presentationFk: foreignKey({
    columns: [table.presentation_id],
    foreignColumns: [presentationsTable.id],
    name: 'slides_presentation_id_fk'
  })
}));

// Relations
export const presentationsRelations = relations(presentationsTable, ({ many }) => ({
  slides: many(slidesTable)
}));

export const slidesRelations = relations(slidesTable, ({ one }) => ({
  presentation: one(presentationsTable, {
    fields: [slidesTable.presentation_id],
    references: [presentationsTable.id]
  })
}));

// TypeScript types for the table schemas
export type Presentation = typeof presentationsTable.$inferSelect;
export type NewPresentation = typeof presentationsTable.$inferInsert;
export type Slide = typeof slidesTable.$inferSelect;
export type NewSlide = typeof slidesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  presentations: presentationsTable, 
  slides: slidesTable 
};
