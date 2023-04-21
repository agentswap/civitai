import {
  Anchor,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  Title,
  Button,
} from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons';
import Link from 'next/link';
import { z } from 'zod';

import { NotFound } from '~/components/AppLayout/NotFound';
import { Files } from '~/components/Resource/Files';
import { ModelAppUpsertForm } from '~/components/Resource/Forms/ModelAppUpsertForm';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { closeRoutedContext } from '~/providers/RoutedContextProvider';
import { createRoutedContext } from '~/routed-context/create-routed-context';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';

export default createRoutedContext({
  schema: z.object({
    modelVersionId: z.number(),
  }),
  authGuard: true,
  Element: ({ context, props: { modelVersionId } }) => {
    const router = useRouter();

    const currentUser = useCurrentUser();
    const { data: modelVersion, isLoading } = trpc.modelVersion.getById.useQuery({
      id: modelVersionId,
      withFiles: true,
    });

    const isModerator = currentUser?.isModerator ?? false;
    const isOwner = modelVersion?.model?.user.id === currentUser?.id || isModerator;
    if (!isLoading && modelVersion && !isOwner) closeRoutedContext();

    return (
      <Modal opened={context.opened} onClose={context.close} withCloseButton={false} fullScreen>
        <Container size="sm">
          {isLoading ? (
            <Center>
              <Loader size="lg" />
            </Center>
          ) : modelVersion ? (
            <Stack spacing="xl">
              <Link href={`/models/${modelVersion?.model.id}`} passHref shallow>
                <Anchor size="xs">
                  <Group spacing={4}>
                    <IconArrowLeft size={12} />
                    <Text inherit>Back to {modelVersion?.model?.name} page</Text>
                  </Group>
                </Anchor>
              </Link>
              <Title order={1}>Manage App</Title>
              <ModelAppUpsertForm
                model={modelVersion?.model}
                onSubmit={() => {
                  router.replace(
                    `/models/${modelVersion?.model.id}/model-versions/${modelVersion?.id}`
                  );
                }}
              >
                {({ loading }) => (
                  <Group mt="xl" position="right">
                    <Button type="submit" loading={loading}>
                      Next
                    </Button>
                  </Group>
                )}
              </ModelAppUpsertForm>
            </Stack>
          ) : (
            <NotFound />
          )}
        </Container>
      </Modal>
    );
  },
});
