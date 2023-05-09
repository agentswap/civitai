import { useCallback, useMemo } from 'react';
import { Group, Input, Stack, Button, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons';
import { ModelAppStates, ModelType } from '@prisma/client';
import { showSuccessNotification } from '~/utils/notifications';
import { showErrorNotification } from '~/utils/notifications';
import { SystemStatus } from '~/components/SystemStatus/SystemStatus';
import { trpc } from '~/utils/trpc';
import { ModelUpsertInput } from '~/server/schema/model.schema';

type Props = {
  model?: Partial<ModelUpsertInput>;
};

export function ModelSystemStatusSync({ model }: Props) {
  const queryUtils = trpc.useContext();

  const isModelApp = useMemo(() => model?.type === ModelType.App, [model?.type]);
  const hasModelApp = useMemo(() => !!model?.app, [model?.app]);

  const { data: modelApp } = trpc.modelApp.getById.useQuery(
    { id: model?.app?.id || 0 },
    {
      enabled: isModelApp && hasModelApp,
      refetchInterval: 3000,
    }
  );

  const syncModelMutation = trpc.hostingWorker.hostModelApp.useMutation({
    onSuccess: async () => {
      await queryUtils.modelApp.getById.invalidate({ id: model?.app?.id });

      showSuccessNotification({
        title: 'Sync notification',
        message: 'Sync successfully!',
      });
    },
    onError: (error) => {
      showErrorNotification({ error: new Error(error.message), title: 'Sync notification' });
    },
  });

  const handleSync = useCallback(() => {
    if (model?.app?.id) {
      syncModelMutation.mutate({
        id: model?.app?.id,
      });
    }
  }, [model?.app?.id, syncModelMutation]);

  return (
    <Input.Wrapper
      label="Sync with Git Repository"
      description="Sync this App with it's git repository"
    >
      <Group mt={5}>
        <Stack spacing="xs">
          <Group>
            <SystemStatus status={modelApp?.state || ModelAppStates.Stopped} />
          </Group>
          <Tooltip label="Sync this App with it's git repository" withArrow>
            <Button
              onClick={handleSync}
              loading={syncModelMutation.isLoading}
              loaderPosition="center"
              leftIcon={<IconRefresh size={16} />}
            >
              Sync
            </Button>
          </Tooltip>
        </Stack>
      </Group>
    </Input.Wrapper>
  );
}
