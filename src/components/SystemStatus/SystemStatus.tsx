import { createStyles, keyframes } from '@mantine/core';
import { IconLoader2 } from '@tabler/icons';

// TODO: Replace
export enum Status {
  Running = 'Running',
  Stopped = 'Stopped',
  Building = 'Building',
  RuntimeError = 'Runtime Error',
  BuildError = 'Build Error',
  Unknown = 'Unknown',
}

interface StylesProps {
  status: Status;
}

const pulse = keyframes({
  '50%': { opacity: 0.5 },
});

const loading = keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(360deg)',
  },
});

const useStyles = createStyles((theme, { status }: StylesProps) => {
  // TODO: Replace
  const statusColors = {
    [Status.Running]: theme.colors.teal,
    [Status.Stopped]: theme.colors.dark,
    [Status.Building]: theme.colors.blue,
    [Status.RuntimeError]: theme.colors.red,
    [Status.BuildError]: theme.colors.yellow,
    [Status.Unknown]: theme.colors.gray,
  };

  return {
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      color: statusColors[status][8],
      borderRadius: 8,
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: statusColors[status][2],
      overflow: 'hidden',
      lineHeight: 1,
      fontSize: 12,
      padding: '6px 8px',
      userSelect: 'none',
      backgroundColor: statusColors[status][0],
    },
    dot: {
      display: 'inline-block',
      width: 6,
      height: 6,
      lineHeight: 1,
      borderRadius: 9999,
      backgroundColor: statusColors[status][8],
      userSelect: 'none',
      marginLeft: 2,
      marginRight: 6,
      animation: `${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
    },

    loading: {
      marginLeft: 2,
      marginRight: 6,
      animation: `${loading} 1s linear infinite`,
    },
  };
});

type Props = {
  status: Status;
};

export function SystemStatus({ status }: Props) {
  const { classes } = useStyles({ status });

  return (
    <>
      <div className={classes.wrapper}>
        {status === Status.Running && <div className={classes.dot}></div>}
        {status === Status.Building && <IconLoader2 size={12} className={classes.loading} />}
        {status}
      </div>
    </>
  );
}
