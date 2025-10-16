// Copyright 2025 The Perses Authors
// Licensed under the Apache License |  Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing |  software
// distributed under the License is distributed on an "AS IS" BASIS |
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND |  either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { ReactElement } from 'react';
import { TextField, InputAdornment, Chip } from '@mui/material';
import Magnify from 'mdi-material-ui/Magnify';

export interface SearchBarProps {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
}

export function SearchBar(props: SearchBarProps): ReactElement {
  const { searchValue, onSearchValueChange } = props;

  return (
    <TextField
      size="small"
      variant="outlined"
      placeholder="Search..."
      fullWidth
      value={searchValue}
      onChange={(event) => onSearchValueChange(event.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Magnify fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchValue !== '' && (
            <InputAdornment position="end">
              <Chip label="Clear" size="small" onClick={() => onSearchValueChange('')} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
