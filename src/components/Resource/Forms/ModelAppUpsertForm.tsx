import { Grid, SegmentedControl, Stack, Text, Group } from '@mantine/core';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { DomainIcon } from '~/components/DomainIcon/DomainIcon';

import { Form, InputSelect, InputText, useForm } from '~/libs/form';
import {
  ModelAppUpsertInput,
  modelAppUpsertSchema,
  ModelUpsertInput,
} from '~/server/schema/model.schema';
import { showErrorNotification } from '~/utils/notifications';
import { trpc } from '~/utils/trpc';

enum UpsertRepoMode {
  Select = 'Select Existed',
  Import = 'Import From GitHub',
}

interface RepositoryItemProps extends React.ComponentPropsWithRef<'div'> {
  label: string;
  url: string;
}

const SelectRepositoryItem = forwardRef<HTMLDivElement, RepositoryItemProps>(
  ({ label, url, ...others }: RepositoryItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap position="apart">
        <div>{label}</div>
        <Text
          component="a"
          href={url}
          target="_blank"
          td="underline"
          onMouseDown={() => window.open(url, '_blank')}
        >
          <DomainIcon url={url} />
        </Text>
      </Group>
    </div>
  )
);
SelectRepositoryItem.displayName = 'SelectRepositoryItem';

export function ModelAppUpsertForm({ model, children, onSubmit }: Props) {
  const [upsertRepoMode, setUpsertRepoMode] = useState<UpsertRepoMode>(UpsertRepoMode.Select);
  const { data: existedRepository = [] } = trpc.modelApp.getAll.useQuery();

  const selectExistedRepositoryData = useMemo<{ value: string; label: string }[]>(
    () =>
      existedRepository.map((item) => ({
        value: item.id.toString(),
        label: item.name,
        url: item.url,
      })),
    [existedRepository]
  );

  const selectDefaultRepository = useMemo(() => {
    if (model?.app?.id) {
      const selectDefault = existedRepository.find(
        (item) => String(item.id) === String(model?.app?.id)
      );
      if (selectDefault) {
        return selectDefault.id.toString();
      }
    }
    return undefined;
  }, [model?.app?.id, existedRepository]);

  const schema = useMemo(() => {
    if (upsertRepoMode === UpsertRepoMode.Select) {
      return modelAppUpsertSchema.pick({}).merge(z.object({ existedRepository: z.string() }));
    } else if (upsertRepoMode == UpsertRepoMode.Import) {
      return modelAppUpsertSchema.refine((data) => (data?.url ? !!data?.url : true), {
        message: 'Please select a repository or input a GitHub repository URL',
        path: ['url'],
      });
    } else {
      return modelAppUpsertSchema.merge(z.object({ existedRepository: z.string().optional() }));
    }
  }, [upsertRepoMode]);

  const defaultValues: ModelAppUpsertInput = {
    id: model?.app?.id,
    name: model?.app?.name ?? '',
    url: model?.app?.url ?? '',
  };
  const form = useForm({
    schema,
    mode: 'onChange',
    defaultValues: {
      ...defaultValues,
      existedRepository: selectDefaultRepository,
    },
    shouldUnregister: false,
  });
  const queryUtils = trpc.useContext();

  const { isDirty } = form.formState;

  const upsertModelMutation = trpc.model.upsert.useMutation({
    onSuccess: async (data, payload) => {
      await queryUtils.model.getById.invalidate({ id: data.id });
      if (!payload.id) await queryUtils.model.getMyDraftModels.invalidate();
      await queryUtils.modelApp.getAll.invalidate();
      onSubmit(data);
    },
    onError: (error) => {
      showErrorNotification({ error: new Error(error.message), title: 'Failed to save model' });
    },
  });
  const handleSubmit = (data: z.infer<typeof schema>) => {
    if (isDirty) {
      let _data: {
        id?: number;
        name: string;
        url: string;
      } | null = null;

      if (upsertRepoMode === UpsertRepoMode.Select) {
        const selectedRepository = existedRepository.find(
          (item) =>
            String(item.id) === String((data as { existedRepository: string })?.existedRepository)
        );
        if (selectedRepository) {
          _data = {
            name: selectedRepository.name,
            url: selectedRepository.url,
          };
        }
      } else if (upsertRepoMode === UpsertRepoMode.Import) {
        _data = {
          name: (data as { name: string })?.name,
          url: (data as { url: string })?.url,
        };
      }

      // Update
      if (_data && model?.app?.id) {
        _data['id'] = model?.app?.id;
      }

      if (_data) {
        upsertModelMutation.mutate({ ...model, app: _data } as ModelUpsertInput);
      }
    }
  };

  useEffect(() => {
    if (model?.app) form.reset(model?.app);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model?.app]);

  useEffect(() => {
    selectDefaultRepository && form.setValue('existedRepository', selectDefaultRepository);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectDefaultRepository]);

  return (
    <Form form={form} onSubmit={handleSubmit}>
      <Grid gutter="xl">
        <Grid.Col span={12}>
          <Stack>
            <SegmentedControl
              my={5}
              value={upsertRepoMode}
              size="xs"
              color="blue"
              styles={(theme) => ({
                root: {
                  border: `1px solid ${
                    theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
                  }`,
                  background: 'none',
                },
              })}
              data={Object.values(UpsertRepoMode).map((el) => ({
                label: el,
                value: el,
              }))}
              onChange={(value: UpsertRepoMode) => {
                setUpsertRepoMode(value);
              }}
            />
            {upsertRepoMode === UpsertRepoMode.Select ? (
              <InputSelect
                name="existedRepository"
                label="Choose an existed repository"
                placeholder="Pick one"
                itemComponent={SelectRepositoryItem}
                data={selectExistedRepositoryData}
                withAsterisk
                nothingFound="Nobody here"
                clearable
                maxDropdownHeight={400}
                searchable
              />
            ) : upsertRepoMode === UpsertRepoMode.Import ? (
              <Stack spacing={5}>
                <InputText
                  name="name"
                  description="Enter a name for your model."
                  label="Name"
                  placeholder="Name"
                  withAsterisk
                />
                <InputText
                  name="url"
                  description="Enter a GitHub repository URL."
                  label="Github URL"
                  placeholder="Github URL"
                  withAsterisk
                />
              </Stack>
            ) : null}
          </Stack>
        </Grid.Col>
      </Grid>
      {typeof children === 'function'
        ? children({ loading: upsertModelMutation.isLoading })
        : children}
    </Form>
  );
}

type Props = {
  onSubmit: (data: { id?: number }) => void;
  children: React.ReactNode | ((data: { loading: boolean }) => React.ReactNode);
  model?: Partial<ModelUpsertInput>;
};
