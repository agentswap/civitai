import { Center, Group, Stack, Tabs } from '@mantine/core';
import { MetricTimeframe } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons';
import { useRouter } from 'next/router';
import { AlertWithIcon } from '~/components/AlertWithIcon/AlertWithIcon';

import { NotFound } from '~/components/AppLayout/NotFound';
import { PeriodFilter, SortFilter } from '~/components/Filters';
import { MasonryContainer } from '~/components/MasonryColumns/MasonryContainer';
import { MasonryProvider } from '~/components/MasonryColumns/MasonryProvider';
import { ModelFiltersDropdown } from '~/components/Model/Infinite/ModelFiltersDropdown';
import { ModelsInfinite } from '~/components/Model/Infinite/ModelsInfinite';
import { AppsInfinite } from '~/components/Model/Infinite/AppsInfinite';
import { useModelQueryParams, useAppQueryParams } from '~/components/Model/model.utils';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { constants } from '~/server/common/constants';
import { AppSort } from '~/server/common/enums';

import { UserProfileLayout } from './';

export default function UserAppsPage() {
  const currentUser = useCurrentUser();
  const { set, ...queryFilters } = useAppQueryParams();
  const period = queryFilters.period ?? MetricTimeframe.AllTime;
  const sort = queryFilters.sort ?? AppSort.Newest;

  // currently not showing any content if the username is undefined
  if (!queryFilters.username) return <NotFound />;
  const selfView = queryFilters.username === currentUser?.username;

  return (
    <Tabs.Panel value="/apps">
      {selfView && (
        <Center>
          <AlertWithIcon maw={600} icon={<IconInfoCircle />} title="Metric Period Mode">
            Since you are viewing your own profile, we show all of your creations and the period
            filter instead only adjusts the timeframe for the metrics that are displayed.
          </AlertWithIcon>
        </Center>
      )}
      <MasonryProvider
        columnWidth={constants.cardSizes.model}
        maxColumnCount={7}
        maxSingleColumnWidth={450}
      >
        <MasonryContainer fluid>
          <Stack spacing="xs">
            <Group position="apart">
              <SortFilter type="apps" value={sort} onChange={(x) => set({ sort: x as any })} />
              <Group spacing="xs">
                <PeriodFilter value={period} onChange={(x) => set({ period: x })} />
                {/* <ModelFiltersDropdown /> */}
              </Group>
            </Group>
            <AppsInfinite
              filters={{
                ...queryFilters,
                sort,
                period,
                periodMode: selfView ? 'stats' : undefined,
              }}
            />
          </Stack>
        </MasonryContainer>
      </MasonryProvider>
    </Tabs.Panel>
  );
}

UserAppsPage.getLayout = UserProfileLayout;
