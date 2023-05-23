import { env } from '~/env/server.mjs';
import { dbRead, dbWrite } from '../db/client';
import { throwNotFoundError } from '../utils/errorHandling';
import { createLogger } from '~/utils/logging';
import { ModelAppStates } from '@prisma/client';

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

  const { id, name, url, imageName } = modelAppInfo;

  try {
    // Set model app state to building
    await dbWrite.modelApp.update({
      where: { id },
      data: { state: ModelAppStates.Building },
    });

    log(`Creating model app ${id} with name ${name} and url ${url}`);
    // Send request to hosting worker
    const response = await fetch(`${hostingWorkerUrl}/model-app`, {
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

    if (!imageName || imageName !== data.imageName) {
      log(`Updating model app ${id} image name ${data.imageName}`);
      await dbWrite.modelApp.update({
        where: { id },
        data: { imageName: data.imageName },
      });
    }

    return data;
  } catch (error) {
    throw error;
  }
};
