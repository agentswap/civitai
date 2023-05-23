import { env } from '~/env/server.mjs';
import { dbRead, dbWrite } from '../db/client';
import { throwNotFoundError } from '../utils/errorHandling';
import { createLogger } from '~/utils/logging';
import { ModelApp, ModelAppStates } from '@prisma/client';

const log = createLogger('hosting-worker', 'blue');
const modelAppUrl = new URL('/model-app', env.HOSTING_WORKER_URL).toString();

async function findModelAppById(id: number) {
  const modelApp = await dbRead.modelApp.findUnique({ where: { id } });
  if (!modelApp) {
    throw throwNotFoundError(`Could not find model app with id ${id}`);
  }
  return modelApp;
}

async function setModelAppState(id: number, state: ModelAppStates) {
  await dbWrite.modelApp.update({ where: { id }, data: { state } });
}

async function updateModelAppImageName(id: number, oldName: string | null, newName: string) {
  if (!oldName || oldName !== newName) {
    log(`Updating model app ${id} image name ${newName}`);
    await dbWrite.modelApp.update({
      where: { id },
      data: { imageName: newName },
    });
  }
}

type ModelAppApiBody = Pick<ModelApp, 'id' | 'name' | 'url'>;
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
async function createModelApp(body: ModelAppApiBody): Promise<CreateModelAppResponse> {
  const { id, name, url } = body;
  const response = await fetch(modelAppUrl, {
    method: 'POST',
    body: JSON.stringify({ id, name, url }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const message = `Failed to create model app ${id} with name ${name} and url ${url}`;
    log(message);
    const error: CreateModelAppError = await response.json();
    log(`Hosting worker responded with error`, error);
    throw new Error(message, { cause: error });
  }
  return await response.json();
}
export async function hostModelApp(appId: number) {
  const modelAppInfo = await findModelAppById(appId);
  const { id, name, url, imageName } = modelAppInfo;

  // Set model app state to building
  await setModelAppState(id, ModelAppStates.Building);

  log(`Creating model app ${id} with name ${name} and url ${url}`);
  // Send request to hosting worker
  const data = await createModelApp({ id, name, url });
  log(`Created model app ${id} with name ${name} and url ${url} on port ${data.port}`);

  await updateModelAppImageName(id, imageName, data.imageName);

  return data;
}

export type UpdateModelAppResponse = {
  id: number;
  port: number;
  imageName: string;
};
type UpdateModelAppError = {
  statusCode: number;
  error: string;
  message: string;
};
async function updateModelApp(body: ModelAppApiBody): Promise<UpdateModelAppResponse> {
  const { id, name, url } = body;
  const response = await fetch(modelAppUrl, {
    method: 'PUT',
    body: JSON.stringify({ id, name, url }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    const message = `Failed to update model app ${id} with name ${name} and url ${url}`;
    log(message);
    const error: UpdateModelAppError = await response.json();
    log(`Hosting worker responded with error`, error);
    throw new Error(message, { cause: error });
  }
  return await response.json();
}
export async function updateModelAppInfo(appId: number) {
  const modelAppInfo = await findModelAppById(appId);
  const { id, name, url, imageName } = modelAppInfo;

  // Set model app state to building
  await setModelAppState(id, ModelAppStates.Building);

  log(`Updating model app ${id} with name ${name} and url ${url}`);
  // Send request to hosting worker
  const data = await updateModelApp({ id, name, url });
  log(`Updated model app ${id} with name ${name} and url ${url} on port ${data.port}`);

  await updateModelAppImageName(id, imageName, data.imageName);

  return data;
}
