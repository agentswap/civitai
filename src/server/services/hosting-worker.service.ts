import { env } from '~/env/server.mjs';
import { dbRead } from '../db/client';
import { throwNotFoundError } from '../utils/errorHandling';

const hostingWorkerUrl = new URL(env.HOSTING_WORKER_URL).origin;

export type CreateModelAppResponse = {
  id: number;
  port: number;
  imageName: string;
};

export const createModelApp = async (appId: number) => {
  const modelAppInfo = await dbRead.modelApp.findUnique({ where: { id: appId } });

  if (!modelAppInfo) {
    throw throwNotFoundError(`Could not find model app with id ${appId}`);
  }

  const { id, name, url } = modelAppInfo;

  try {
    const response = await fetch(`${hostingWorkerUrl}/create`, {
      method: 'POST',
      body: JSON.stringify({ id, name, url }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data: CreateModelAppResponse = await response.json();

    return data;
  } catch (error) {
    throw new Error(`Failed to create model app ${id} cause: ${error}`);
  }
};
