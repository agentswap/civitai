import { GetByIdInput } from '../schema/base.schema';
import { createModelApp } from '../services/hosting-worker.service';

export const createModelAppHandler = async ({ input }: { input: GetByIdInput }) => {
  const data = await createModelApp(input.id);
  return data;
};
