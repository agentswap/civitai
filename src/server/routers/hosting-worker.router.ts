import { publicProcedure, router } from '../trpc';
import { getByIdSchema } from '../schema/base.schema';
import { createModelAppHandler } from '../controllers/hosting-worker.controller';

export const hostingWorkerRouter = router({
  createModelApp: publicProcedure.input(getByIdSchema).mutation(createModelAppHandler),
});
