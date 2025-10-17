// Copyright 2024 The Perses Authors
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

import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { OptionsColorPicker, useChartsTheme } from '@perses-dev/components';
import React, { ReactElement, useMemo } from 'react';
import DeleteIcon from 'mdi-material-ui/DeleteOutline';
import AddIcon from 'mdi-material-ui/Plus';
import { produce } from 'immer';
import { useQueryCountContext } from '@perses-dev/plugin-system';
import { PieChartOptions, PieChartOptionsEditorProps } from './pie-chart-model';
import { getCategoricalPaletteColor } from './utils';

export function QueryColorEditor(props: PieChartOptionsEditorProps): ReactElement {
  const { onChange, value } = props;
  const queryColors = value.queryColors || {};
  const queryCount = useQueryCountContext();
  const chartsTheme = useChartsTheme();
  const muiTheme = useTheme();
  const categoricalPalette = chartsTheme.echartsTheme.color;

  const handleQueryColorsChange = (newQueryColors: Record<number, string>) => {
    onChange(
      produce(value, (draft: PieChartOptions) => {
        draft.queryColors = Object.keys(newQueryColors).length > 0 ? newQueryColors : undefined;
      })
    );
  };

  const handleColorChange = (queryIndex: number, color: string): void => {
    handleQueryColorsChange({
      ...queryColors,
      [queryIndex]: color,
    });
  };

  const deleteQueryColor = (queryIndex: number): void => {
    const updatedQueryColors = { ...queryColors };
    delete updatedQueryColors[queryIndex];
    handleQueryColorsChange(updatedQueryColors);
  };

  // Get available query indexes (those without colors assigned)
  const availableQueryIndexes = useMemo(() => {
    const assignedIndexes = Object.keys(queryColors).map(Number);
    return Array.from({ length: queryCount }, (_, i) => i).filter(
      (index) => !assignedIndexes.includes(index)
    );
  }, [queryColors, queryCount]);

  const addQueryColor = (queryIndex: number): void => {
    // Use the current theme palette color for this query as the default
    const defaultColor = getCategoricalPaletteColor(
      categoricalPalette as string[],
      queryIndex,
      muiTheme.palette.primary.main
    );
    handleColorChange(queryIndex, defaultColor);
  };

  // Get entries sorted by query index
  const sortedEntries = Object.entries(queryColors)
    .map(([index, color]) => [Number(index), color] as [number, string])
    .sort(([a], [b]) => a - b);

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Query Colors</Typography>
      {queryCount === 0 ? (
        <Typography fontStyle="italic" color="text.secondary">
          No queries defined
        </Typography>
      ) : (
        <>
          {sortedEntries.map(([queryIndex, color]) => (
            <QueryColorInput
              key={queryIndex}
              queryIndex={queryIndex}
              color={color}
              onColorChange={(newColor) => handleColorChange(queryIndex, newColor)}
              onDelete={() => deleteQueryColor(queryIndex)}
            />
          ))}
          {availableQueryIndexes.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Add color for query:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {availableQueryIndexes.map((queryIndex) => (
                  <Button
                    key={queryIndex}
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => addQueryColor(queryIndex)}
                  >
                    Query #{queryIndex + 1}
                  </Button>
                ))}
              </Stack>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
}

interface QueryColorInputProps {
  queryIndex: number;
  color: string;
  onColorChange: (color: string) => void;
  onDelete: () => void;
}

function QueryColorInput({
  queryIndex,
  color,
  onColorChange,
  onDelete,
}: QueryColorInputProps): ReactElement {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 2,
      }}
    >
      <Typography variant="body2" sx={{ minWidth: '80px' }}>
        Query #{queryIndex + 1}
      </Typography>

      <OptionsColorPicker
        label={`Query #${queryIndex + 1} Color`}
        color={color}
        onColorChange={onColorChange}
      />

      <Box sx={{ flexGrow: 1 }} />

      <IconButton
        aria-label={`Delete color for query #${queryIndex + 1}`}
        onClick={onDelete}
        size="small"
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
}
