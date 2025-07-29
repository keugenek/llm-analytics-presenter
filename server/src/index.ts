
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Schema imports
import { 
  createPresentationInputSchema, 
  createSlideInputSchema,
  updateSlideInputSchema
} from './schema';

// Handler imports
import { createPresentation } from './handlers/create_presentation';
import { getPresentations } from './handlers/get_presentations';
import { getPresentationWithSlides } from './handlers/get_presentation_with_slides';
import { incrementViewCount } from './handlers/increment_view_count';
import { createSlide } from './handlers/create_slide';
import { getSlidesByPresentation } from './handlers/get_slides_by_presentation';
import { updateSlide } from './handlers/update_slide';
import { deleteSlide } from './handlers/delete_slide';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Presentation routes
  createPresentation: publicProcedure
    .input(createPresentationInputSchema)
    .mutation(({ input }) => createPresentation(input)),

  getPresentations: publicProcedure
    .query(() => getPresentations()),

  getPresentationWithSlides: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ input }) => getPresentationWithSlides(input.id)),

  incrementViewCount: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => incrementViewCount(input.id)),

  // Slide routes
  createSlide: publicProcedure
    .input(createSlideInputSchema)
    .mutation(({ input }) => createSlide(input)),

  getSlidesByPresentation: publicProcedure
    .input(z.object({ presentationId: z.number() }))
    .query(({ input }) => getSlidesByPresentation(input.presentationId)),

  updateSlide: publicProcedure
    .input(updateSlideInputSchema)
    .mutation(({ input }) => updateSlide(input)),

  deleteSlide: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ input }) => deleteSlide(input.id)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
