import { createStyles, useMantineColorScheme } from '@mantine/core';
import { useMemo } from 'react';

type Props = {
  title: string;
  iframeSrc: string;
};

export default function AppPlayground({ title, iframeSrc }: Props) {
  const { classes } = useStyles();
  const { colorScheme } = useMantineColorScheme();

  const currentIframeSrc = useMemo(() => {
    const url = new URL(iframeSrc);
    url.searchParams.set('__theme', colorScheme);
    return url.toString();
  }, [colorScheme, iframeSrc]);

  const dataProps = useMemo(() => {
    const data = {
      iframeSrc: currentIframeSrc,
      runningSdk: 'gradio',
      // containerClass: 'container',
      // privateSpace: false,
    };
    return JSON.stringify(data);
  }, [currentIframeSrc]);

  return (
    <main className={classes.main}>
      <div className={classes.contents} data-props={dataProps} data-target="SpaceIframe">
        {iframeSrc && (
          <iframe
            src={currentIframeSrc}
            title={title}
            className={classes.playground}
            allow="accelerometer; ambient-light-sensor; autoplay; battery; camera; clipboard-write; document-domain; encrypted-media; fullscreen; geolocation; gyroscope; layout-animations; legacy-image-formats; magnetometer; microphone; midi; oversized-images; payment; picture-in-picture; publickey-credentials-get; sync-xhr; usb; vr ; wake-lock; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-downloads allow-storage-access-by-user-activation"
            scrolling="no"
            id="iFrameResizer0"
            iframe-resizer=""
          ></iframe>
        )}
      </div>
    </main>
  );
}

const useStyles = createStyles(() => ({
  main: {
    display: 'flex',
    flex: '1 1 0 %',
    flexDirection: 'column',
  },
  contents: {
    display: 'contents',
  },
  playground: {
    width: '100%',
    minHeight: '1187px',
    flexGrow: 1,
    overflow: 'hidden',
    padding: 0,
  },
}));
