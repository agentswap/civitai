import { Container, createStyles, Group, Stack, Title, Text, Button } from '@mantine/core';
import { ModelAppStates } from '@prisma/client';
import truncate from 'lodash/truncate';
import { InferGetServerSidePropsType } from 'next';
import { useMemo, useState } from 'react';
import { Announcements } from '~/components/Announcements/Announcements';
import { NotFound } from '~/components/AppLayout/NotFound';
import { Meta } from '~/components/Meta/Meta';
import { PageLoader } from '~/components/PageLoader/PageLoader';
import { createServerSideProps } from '~/server/utils/server-side-helpers';
import { removeTags } from '~/utils/string-helpers';
import { trpc } from '~/utils/trpc';
import { SystemStatus } from '~/components/SystemStatus/SystemStatus';
import AppPlayground from '~/components/AppPlayground/AppPlayground';
import { env } from '~/env/client.mjs';
import { NextLink } from '@mantine/next';

export const getServerSideProps = createServerSideProps({
  useSSG: true,
  useSession: true,
  resolver: async ({ ctx }) => {
    const params = (ctx.params ?? {}) as { id: string; slug: string[] };
    const id = Number(params.id);

    return {
      props: {
        id,
      },
    };
  },
});

export default function ModelDetailsV2({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { classes } = useStyles();
  const queryUtils = trpc.useContext();

  const [isPollModelAppStatus, setIsPollModelAppStatus] = useState(true);
  const { data: modelApp, isLoading: loadingModelApp } = trpc.modelApp.getById.useQuery(
    { id },
    {
      onSuccess: async (result) => {
        if (result?.state !== ModelAppStates.Building) {
          setIsPollModelAppStatus(false);
        }

        await queryUtils.model.getById.invalidate({ id });
      },
      onError() {
        setIsPollModelAppStatus(false);
      },
      enabled: isPollModelAppStatus,
      refetchInterval: 3000,
    }
  );

  const iframeSrc = useMemo(() => {
    const appUrl = env.NEXT_PUBLIC_APP_URL;
    return modelApp?.imageName && appUrl.includes('app.')
      ? appUrl.replace('app', modelApp?.imageName)
      : '';
  }, [modelApp?.imageName]);

  if (loadingModelApp) return <PageLoader />;
  if (!modelApp) return <NotFound />;

  const meta = (
    <Meta
      title={`${modelApp.name} | AgentSwap`}
      description={truncate(removeTags(modelApp.name ?? ''), { length: 150 })}
      image={undefined}
    />
  );

  return (
    <>
      {meta}
      <Container size="xl">
        <Stack spacing="xl">
          <Announcements sx={{ marginBottom: 5 }} />
          <Stack spacing="xs">
            <Stack spacing={4}>
              <Group align="center" sx={{ justifyContent: 'space-between' }} noWrap>
                <Group className={classes.titleWrapper} align="center">
                  <Title className={classes.title} order={1}>
                    {modelApp.name}
                  </Title>
                  {modelApp && <SystemStatus status={modelApp?.state || ModelAppStates.Stopped} />}
                </Group>
              </Group>
            </Stack>
          </Stack>
          {iframeSrc ? (
            <AppPlayground title={modelApp?.name || 'Unknow'} iframeSrc={iframeSrc} />
          ) : (
            <Container size="xl" p="xl">
              <Stack align="center">
                <Text size="xl">The app you are looking for doesn&apos;t exist</Text>
                <Button component={NextLink} href="/">
                  Go back home
                </Button>
              </Stack>
            </Container>
          )}
        </Stack>
      </Container>
    </>
  );
}

const useStyles = createStyles((theme) => ({
  titleWrapper: {
    gap: theme.spacing.xs,

    [theme.fn.smallerThan('md')]: {
      gap: theme.spacing.xs * 0.4,
    },
  },

  title: {
    wordBreak: 'break-word',
    [theme.fn.smallerThan('md')]: {
      fontSize: theme.fontSizes.xs * 2.4, // 24px
      width: '100%',
      paddingBottom: 0,
    },
  },
}));
