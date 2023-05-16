import { Center, Loader, LoadingOverlay, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconCloudOff } from '@tabler/icons';
import { useEffect } from 'react';

import { useInView } from 'react-intersection-observer';
import { AmbientModelCard } from '~/components/Model/Infinite/ModelCard';
import { MasonryColumns } from '~/components/MasonryColumns/MasonryColumns';
import { AppQueryParams, useAppFilters, useQueryApps } from '~/components/Model/model.utils';
import { AppFilterSchema } from '~/providers/FiltersProvider';
import { removeEmpty } from '~/utils/object-helpers';

type InfiniteModelsProps = {
  filters?: Partial<Omit<AppQueryParams, 'view'> & Omit<AppFilterSchema, 'view'>>;
};

export function AppsInfinite({ filters: filterOverrides = {} }: InfiniteModelsProps) {
  const { ref, inView } = useInView();
  const appFilters = useAppFilters();

  // Only App
  const filters = removeEmpty({
    ...({
      ...appFilters,
      types: ['App'],
      baseModels: undefined,
    } as typeof appFilters),
    ...filterOverrides,
  });

  const { models, isLoading, fetchNextPage, hasNextPage, isRefetching, isFetching } = useQueryApps(
    filters,
    {
      keepPreviousData: true,
    }
  );

  // #region [infinite data fetching]
  useEffect(() => {
    if (inView && !isFetching) {
      fetchNextPage?.();
    }
  }, [fetchNextPage, inView, isFetching]);
  // #endregion

  return (
    <>
      {isLoading ? (
        <Center p="xl">
          <Loader size="xl" />
        </Center>
      ) : !!models.length ? (
        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={isRefetching ?? false} zIndex={9} />
          <MasonryColumns
            data={models}
            imageDimensions={(data) => {
              const width = data.image?.width ?? 450;
              const height = data.image?.height ?? 450;
              return { width, height };
            }}
            adjustHeight={({ imageRatio, height }) => height + (imageRatio >= 1 ? 60 : 0)}
            maxItemHeight={600}
            render={AmbientModelCard}
            itemId={(data) => data.id}
          />
          {hasNextPage && !isLoading && !isRefetching && (
            <Center ref={ref} sx={{ height: 36 }} mt="md">
              {inView && <Loader />}
            </Center>
          )}
        </div>
      ) : (
        <Stack align="center" py="lg">
          <ThemeIcon size={128} radius={100}>
            <IconCloudOff size={80} />
          </ThemeIcon>
          <Text size={32} align="center">
            No results found
          </Text>
          <Text align="center">
            {"Try adjusting your search or filters to find what you're looking for"}
          </Text>
        </Stack>
      )}
    </>
  );
}
