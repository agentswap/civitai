import { env } from '~/env/server.mjs';
import { dbRead } from '../db/client';
import { throwNotFoundError } from '../utils/errorHandling';
import { createLogger } from '~/utils/logging';

const log = createLogger('hosting-worker', 'blue');
const hostingWorkerUrl = new URL(env.HOSTING_WORKER_URL).origin;

export type CreateModelAppResponse = {
  id: number;
  port: number;
  imageName: string;
};

type CreateModelAppError = {
  statusCode: number;
  error: string;
  message: string;
};

export const hostModelApp = async (appId: number) => {
  const modelAppInfo = await dbRead.modelApp.findUnique({ where: { id: appId } });

  if (!modelAppInfo) {
    throw throwNotFoundError(`Could not find model app with id ${appId}`);
  }

  const { id, name, url } = modelAppInfo;

  try {
    log(`Creating model app ${id} with name ${name} and url ${url}`);
    const response = await fetch(`${hostingWorkerUrl}/create`, {
      method: 'POST',
      body: JSON.stringify({ id, name, url }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error: CreateModelAppError = await response.json();
      log(`Failed to create model app ${id} with name ${name} and url ${url}`);
      log(
        `Hosting worker responded with status code "${error.statusCode} (${error.error})" and message "${error.message}"`
      );
      throw new Error(
        `Failed to create model app ${id} cause: ${error.statusCode} (${error.error}) ${error.message}`
      );
    }

    const data: CreateModelAppResponse = await response.json();
    log(`Created model app ${id} with name ${name} and url ${url} on port ${data.port}`);

    return data;
  } catch (error) {
    throw error;
  }
};
