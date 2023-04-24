import { GetByIdInput } from '../schema/base.schema';
import { hostModelApp } from '../services/hosting-worker.service';

export const hostModelAppHandler = async ({ input }: { input: GetByIdInput }) => {
  const data = await hostModelApp(input.id);
  return data;
};
