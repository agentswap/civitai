import { publicProcedure, router } from '~/server/trpc';
import { getModelAppHandler } from '~/server/controllers/model-app.controller';

export const modelAppRouter = router({
  getAll: publicProcedure.query(getModelAppHandler),
});
