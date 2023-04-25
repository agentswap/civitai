import { publicProcedure, router } from '../trpc';
import { getByIdSchema } from '../schema/base.schema';
import { hostModelAppHandler } from '../controllers/hosting-worker.controller';

export const hostingWorkerRouter = router({
  hostModelApp: publicProcedure.input(getByIdSchema).mutation(hostModelAppHandler),
});
