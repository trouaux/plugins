// Copyright 2025 The Perses Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ReactElement, SyntheticEvent } from 'react';
import { Stack, TextField, Autocomplete } from '@mui/material';
import { PyroscopeDatasourceSelector } from '../model';
import { useServices } from '../utils/use-query';

export interface ServiceProps {
  datasource: PyroscopeDatasourceSelector;
  value: string;
  onChange?(value: string): void;
}

export function Service(props: ServiceProps): ReactElement {
  const { datasource, value, onChange } = props;

  const { data: servicesOptions, isLoading: isServicesOptionsLoading } = useServices(datasource);

  function handleServiceChange(_event: SyntheticEvent, newValue: string | null): void {
    if (newValue !== null) {
      onChange?.(newValue);
    }
  }

  return (
    <Stack
      position="relative"
      sx={{
        width: '100%',
      }}
    >
      <Autocomplete
        options={servicesOptions?.names ?? []}
        value={value}
        sx={{ minWidth: 200 }}
        loading={isServicesOptionsLoading}
        renderInput={(params) => {
          return <TextField {...params} label="Service" size="small" />;
        }}
        onChange={handleServiceChange}
      />
    </Stack>
  );
}
