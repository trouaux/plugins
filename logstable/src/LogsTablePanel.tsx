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

import { Box } from '@mui/material';
import { useChartsTheme } from '@perses-dev/components';
import { ReactElement } from 'react';
import { LogsTableComponent } from './LogsTableComponent';
import { LogsTableProps } from './model';

export function LogsTablePanel(props: LogsTableProps): ReactElement {
  const { contentDimensions, queryResults, spec } = props;
  const chartsTheme = useChartsTheme();
  const contentPadding = chartsTheme.container.padding.default;

  return (
    <Box sx={{ height: contentDimensions?.height || 0, padding: `${contentPadding}px`, overflowY: 'scroll' }}>
      <LogsTableComponent queryResults={queryResults} spec={spec} />
    </Box>
  );
}
