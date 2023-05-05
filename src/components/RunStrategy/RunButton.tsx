import { Button, ButtonProps, Tooltip } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons';
import { openContext } from '~/providers/CustomModalsProvider';
import { ModelApp } from '@prisma/client';
import { NextLink } from '@mantine/next';

export function RunButton({
  modelVersionId,
  app,
  botGroupUrl,
  ...props
}: { modelVersionId: number; app: ModelApp | null; botGroupUrl: string | null } & ButtonProps) {
  return (
    <>
      {app ? (
        <Tooltip label="Run Model App" withArrow position="top">
          <Button
            fullWidth
            component={NextLink}
            href={`/app/${app.id}`}
            disabled={!app?.id}
            color="green"
            leftIcon={<IconPlayerPlay size={16} />}
            {...props}
          >
            Run Model App
          </Button>
        </Tooltip>
      ) : (
        <Tooltip label="Run Model" withArrow position="top">
          <Button
            fullWidth
            onClick={() => {
              if (botGroupUrl) {
                window.open('https://t.me/loliai_bot', '_blank');
              } else {
                openContext('runStrategy', { modelVersionId });
              }
            }}
            color="green"
            {...props}
            sx={{
              paddingLeft: 0,
              paddingRight: 0,
              width: 36,
            }}
          >
            <IconPlayerPlay />
          </Button>
        </Tooltip>
      )}
    </>
  );
}
