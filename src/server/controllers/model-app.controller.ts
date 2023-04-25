import { TRPCError } from '@trpc/server';

import { dbRead } from '~/server/db/client';
import { throwDbError } from '~/server/utils/errorHandling';
import { GetByIdInput } from '~/server/schema/base.schema';
import { Context } from '~/server/createContext';

export const getModelAppHandler = async () => {
  try {
    return dbRead.modelApp.findMany();
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    else throw throwDbError(error);
  }
};

export const getModelAppByIdHandler = async ({
  input,
  ctx,
}: {
  input: GetByIdInput;
  ctx: Context;
}) => {
  if (!input.id) {
    throw new TRPCError({ code: 'BAD_REQUEST' });
  }

  try {
    return dbRead.modelApp.findFirst({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        name: true,
        state: true,
        url: true,
      },
    });
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    else throw throwDbError(error);
  }
};
