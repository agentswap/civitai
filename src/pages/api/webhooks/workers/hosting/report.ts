import { ModelAppStatus } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { dbWrite } from '~/server/db/client';
import { WorkerEndpoint } from '~/server/utils/endpoint-helpers';
import { createLogger } from '~/utils/logging';

const log = createLogger('webhooks', 'blue');

const bodySchema = z.object({
  id: z.number(),
  state: z.nativeEnum(ModelAppStatus),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const bodyResults = bodySchema.safeParse(req.body);

  if (!bodyResults.success) {
    return res
      .status(400)
      .json({ ok: false, error: `Invalid body: ${bodyResults.error.flatten().fieldErrors.state}` });
  }

  const { id, state } = bodyResults.data;

  log(`hosting-worker: Received report for model app ${id} with state ${state}`);

  const modelApp = await dbWrite.modelApp.update({
    where: { id },
    data: { state },
  });

  return res.status(200).json({ ok: true, ...modelApp });
}

export default WorkerEndpoint(handler);
