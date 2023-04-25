import { publicProcedure, router } from '~/server/trpc';
import {
  getModelAppHandler,
  getModelAppByIdHandler,
} from '~/server/controllers/model-app.controller';
import { getByIdSchema } from '~/server/schema/base.schema';

export const modelAppRouter = router({
  getAll: publicProcedure.query(getModelAppHandler),
  getById: publicProcedure.input(getByIdSchema).query(getModelAppByIdHandler),
});
