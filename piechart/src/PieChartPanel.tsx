//Copyright 2024 The Perses Authors
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

import { Box, useTheme } from '@mui/material';
import {
  ChartInstance,
  ContentWithLegend,
  LegendItem,
  LegendProps,
  SelectedLegendItemState,
  TableColumnConfig,
  useChartsTheme,
  useId,
} from '@perses-dev/components';
import { CalculationType, CalculationsMap, DEFAULT_LEGEND, TimeSeriesData } from '@perses-dev/core';
import { PanelProps, validateLegendSpec } from '@perses-dev/plugin-system';
import merge from 'lodash/merge';
import { ReactElement, useMemo, useRef, useState } from 'react';
import { getSeriesColor, getCategoricalPaletteColor } from './palette-gen';
import { PieChartOptions } from './pie-chart-model';
import { calculatePercentages, sortSeriesData } from './utils';
import { PieChartBase, PieChartData } from './PieChartBase';

// Local legend configuration for pie chart
type ComparisonValues = 'abs' | 'relative';
const comparisonLegends: Record<ComparisonValues, { label: string; description?: string }> = {
  abs: { label: 'Absolute', description: 'Absolute value' },
  relative: { label: 'Relative', description: 'Relative value' },
};

export type PieChartPanelProps = PanelProps<PieChartOptions, TimeSeriesData>;

export function PieChartPanel(props: PieChartPanelProps): ReactElement | null {
  const {
    spec: { calculation, sort, mode, legend: pieChartLegend, queryColors },
    contentDimensions,
    queryResults,
  } = props;
  const chartsTheme = useChartsTheme();
  const muiTheme = useTheme();
  const PADDING = chartsTheme.container.padding.default;
  const chartId = useId('time-series-panel');
  const categoricalPalette = chartsTheme.echartsTheme.color;

  const { pieChartData, legendItems, legendColumns } = useMemo(() => {
    const calculate = CalculationsMap[calculation as CalculationType];
    const pieChartData: PieChartData[] = [];
    const legendItems: LegendItem[] = [];
    const legendColumns: Array<TableColumnConfig<LegendItem>> = [];

    let globalSeriesIndex = 0; // Track global series index across all queries

    for (let queryIndex = 0; queryIndex < queryResults.length; queryIndex++) {
      const result = queryResults[queryIndex];

      let seriesIndex = 0;
      for (const seriesData of result?.data.series ?? []) {
        // Use custom color if defined for this query, otherwise use categorical palette
        const seriesColor = queryColors?.[queryIndex] || getCategoricalPaletteColor(
          categoricalPalette as string[],
          globalSeriesIndex,
          muiTheme.palette.primary.main
        );

        const seriesId = `${chartId}${seriesData.name}${seriesIndex}${queryIndex}`;

        const series = {
          id: seriesId,
          value: calculate(seriesData.values) ?? null,
          name: seriesData.formattedName ?? '',
          itemStyle: {
            color: seriesColor,
          },
        };
        pieChartData.push(series);

        legendItems.push({
          id: seriesId,
          label: series.name,
          color: seriesColor,
          data: {},
        });
        seriesIndex++;
        globalSeriesIndex++; // Increment global index for next series
      }
    }

    const sortedPieChartData = sortSeriesData(pieChartData, sort);

    if (pieChartLegend?.values?.length && pieChartLegend?.mode === 'table') {
      const { values } = pieChartLegend;
      [...values].sort().forEach((v) => {
        /* First, create a column for the current legend value */
        legendColumns.push({
          accessorKey: `data.${v}`,
          header: comparisonLegends[v as ComparisonValues]?.label || v,
          headerDescription: comparisonLegends[v as ComparisonValues]?.description,
          width: 90,
          align: 'right',
          cellDescription: true,
          enableSorting: true,
        });
        /* Then, settle the legend items related to this legend value */
        switch (v as ComparisonValues) {
          case 'abs':
            legendItems.forEach((li) => {
              const { value: itemAbsoluteValue } = pieChartData.find((pd) => li.id === pd.id) || {};
              if (typeof itemAbsoluteValue === 'number' && li.data) {
                li.data['abs'] = itemAbsoluteValue;
              }
            });
            break;
          case 'relative':
            legendItems.forEach((li) => {
              const { value: itemPercentageValue } =
                calculatePercentages(sortedPieChartData).find((ppd) => li.id === ppd.id) || {};
              if (typeof itemPercentageValue === 'number' && li.data) {
                li.data['relative'] = `${itemPercentageValue.toFixed(2)}%`;
              }
            });
            break;
          default:
            break;
        }
      });
    }

    return {
      pieChartData: mode === 'percentage' ? calculatePercentages(sortedPieChartData) : sortedPieChartData,
      legendItems,
      legendColumns,
    };
  }, [
    calculation,
    sort,
    mode,
    queryResults,
    categoricalPalette,
    muiTheme.palette.primary.main,
    chartId,
    pieChartLegend,
    queryColors,
  ]);

  const contentPadding = chartsTheme.container.padding.default;
  const adjustedContentDimensions: typeof contentDimensions = contentDimensions
    ? {
        width: contentDimensions.width - contentPadding * 2,
        height: contentDimensions.height - contentPadding * 2,
      }
    : undefined;

  const legend = useMemo(() => {
    return props.spec.legend && validateLegendSpec(props.spec.legend)
      ? merge({}, DEFAULT_LEGEND, props.spec.legend)
      : undefined;
  }, [props.spec.legend]);

  const [selectedLegendItems, setSelectedLegendItems] = useState<SelectedLegendItemState>('ALL');

  const [legendSorting, setLegendSorting] = useState<NonNullable<LegendProps['tableProps']>['sorting']>();

  const chartRef = useRef<ChartInstance>(null);

  // ensures there are fallbacks for unset properties since most
  // users should not need to customize visual display

  if (!contentDimensions) return null;

  return (
    <Box sx={{ padding: `${PADDING}px` }}>
      <ContentWithLegend
        width={adjustedContentDimensions?.width ?? 400}
        height={adjustedContentDimensions?.height ?? 1000}
        // Making this small enough that the medium size doesn't get
        // responsive-handling-ed away when in the panel options editor.
        minChildrenHeight={50}
        legendSize={legend?.size}
        legendProps={
          legend && {
            options: legend,
            data: legendItems,
            selectedItems: selectedLegendItems,
            onSelectedItemsChange: setSelectedLegendItems,
            tableProps: {
              columns: legendColumns,
              sorting: legendSorting,
              onSortingChange: setLegendSorting,
            },
            onItemMouseOver: (e, { id }): void => {
              chartRef.current?.highlightSeries({ name: id });
            },
            onItemMouseOut: (): void => {
              chartRef.current?.clearHighlightedSeries();
            },
          }
        }
      >
        {({ height, width }) => {
          return (
            <Box style={{ height, width }}>
              <PieChartBase
                data={pieChartData}
                width={contentDimensions.width - PADDING * 2}
                height={contentDimensions.height - PADDING * 2}
              />
            </Box>
          );
        }}
      </ContentWithLegend>
    </Box>
  );
}
