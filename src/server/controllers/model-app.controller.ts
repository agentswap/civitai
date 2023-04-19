import { TRPCError } from '@trpc/server';

import { dbRead } from '~/server/db/client';
import { throwDbError } from '~/server/utils/errorHandling';

export const getModelAppHandler = async () => {
  try {
    return dbRead.modelApp.findMany();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    else throw throwDbError(error);
  }
};
