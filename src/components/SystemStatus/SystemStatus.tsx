import { createStyles, keyframes } from '@mantine/core';
import { ModelAppStates } from '@prisma/client';
import { IconLoader2 } from '@tabler/icons';

interface StylesProps {
  status: ModelAppStates;
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
  const statusColors = {
    [ModelAppStates.Stopped]: theme.colors.gray,
    [ModelAppStates.Building]: theme.colors.blue,
    [ModelAppStates.Running]: theme.colors.teal,
    [ModelAppStates.RuntimeError]: theme.colors.red,
    [ModelAppStates.BuildError]: theme.colors.yellow,
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
  status: ModelAppStates;
};

export function SystemStatus({ status }: Props) {
  const { classes } = useStyles({ status });

  return (
    <>
      <div className={classes.wrapper}>
        {status === ModelAppStates.Running && <div className={classes.dot}></div>}
        {status === ModelAppStates.Building && (
          <IconLoader2 size={12} className={classes.loading} />
        )}
        {status}
      </div>
    </>
  );
}
