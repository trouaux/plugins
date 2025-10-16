// Copyright 2023 The Perses Authors
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

import { PanelProps } from '@perses-dev/plugin-system';
import { ReactElement, useMemo } from 'react';
import { TraceData, TraceSearchResult } from '@perses-dev/core';
import { EChartsOption, SeriesOption } from 'echarts';
import { NoDataOverlay, useChartsTheme } from '@perses-dev/components';
import { Scatterplot } from './Scatterplot';
import { ScatterChartOptions } from './scatter-chart-model';

export interface EChartTraceValue extends Omit<TraceSearchResult, 'startTimeUnixMs' | 'serviceStats'> {
  name: string;
  linkVariables: Record<string, string>;
  startTime: Date;
  spanCount: number;
  errorCount: number;
}

export type ScatterChartPanelProps = PanelProps<ScatterChartOptions, TraceData>;

/** default size range of the circles diameter */
const DEFAULT_SIZE_RANGE: [number, number] = [6, 20];

/**
 * ScatterChartPanel receives data from the DataQueriesProvider and transforms it
 * into a `dataset` object that Apache ECharts can consume. Additionally,
 * data formatting is also dictated in this component. Formatting includes
 * datapoint size and color.
 *
 * Documentation for data structures accepted by Apache ECharts:
 *  https://echarts.apache.org/handbook/en/concepts/dataset
 *
 * Examples for scatter chart formatting in Apache ECharts:
 *  https://echarts.apache.org/examples/en/index.html#chart-type-scatter
 *
 * @returns a `ScatterPlot` component that contains an EChart which will handle
 * visualization of the data.
 */
export function ScatterChartPanel(props: ScatterChartPanelProps): ReactElement | null {
  const { spec, contentDimensions, queryResults: traceResults } = props;
  const chartsTheme = useChartsTheme();
  const defaultColor = chartsTheme.thresholds.defaultColor || 'blue';
  const sizeRange = spec.sizeRange || DEFAULT_SIZE_RANGE;

  // Generate dataset
  // Transform Tempo API response to fit 'dataset' structure from Apache ECharts
  // https://echarts.apache.org/handbook/en/concepts/dataset
  const { dataset, minSpanCount, maxSpanCount } = useMemo(() => {
    const dataset = [];
    let minSpanCount: number | undefined;
    let maxSpanCount: number | undefined;
    for (const result of traceResults) {
      if (result.data.searchResult === undefined) continue;
      const dataSeries = result.data.searchResult.map((trace) => {
        let spanCount = 0;
        let errorCount = 0;
        for (const stats of Object.values(trace.serviceStats)) {
          spanCount += stats.spanCount;
          errorCount += stats.errorCount ?? 0;
        }

        if (minSpanCount === undefined || spanCount < minSpanCount) {
          minSpanCount = spanCount;
        }
        if (maxSpanCount === undefined || spanCount > maxSpanCount) {
          maxSpanCount = spanCount;
        }

        const pluginSpec = result.definition.spec.plugin.spec as { datasource?: { name?: string } } | undefined;
        const newTraceValue: EChartTraceValue = {
          ...trace,
          linkVariables: {
            datasourceName: pluginSpec?.datasource?.name ?? '',
            traceId: trace.traceId,
          },
          name: `${trace.rootServiceName}: ${trace.rootTraceName}`,
          startTime: new Date(trace.startTimeUnixMs), // convert unix epoch time to Date
          spanCount,
          errorCount,
        };
        return newTraceValue;
      });
      dataset.push({
        source: dataSeries,
      });
    }
    return { dataset, minSpanCount: minSpanCount ?? 0, maxSpanCount: maxSpanCount ?? 0 };
  }, [traceResults]);

  // Formatting for the dataset
  // 1. Map x,y coordinates
  // 2. Datapoint size corresponds to the number of spans in a trace
  // 3. Color datapoint red if the trace contains an error
  const series = useMemo(() => {
    const seriesTemplate2: SeriesOption = {
      type: 'scatter',
      encode: {
        // Map to x-axis.
        x: 'startTime',
        // Map to y-axis.
        y: 'durationMs',
      },
      symbolSize: function (data) {
        // returns the diameter of the circles
        return getSymbolSize(data.spanCount, [minSpanCount, maxSpanCount], sizeRange);
      },
      itemStyle: {
        color: function (params) {
          const traceData: EChartTraceValue = params.data as EChartTraceValue;
          // If the trace contains an error, color the datapoint in red
          if (traceData.errorCount > 0) {
            return 'red';
          }
          // Else return default color
          return defaultColor;
        },
      },
    };

    // Each data set needs to have a corresponding series formatting object
    const series = [];
    for (let i = 0; i < dataset.length; i++) {
      series.push({ ...seriesTemplate2, datasetIndex: i });
    }
    return series;
  }, [dataset, defaultColor, minSpanCount, maxSpanCount, sizeRange]);

  const tracesFound = traceResults.some((traceData) => (traceData.data?.searchResult ?? []).length > 0);
  if (!tracesFound) {
    return <NoDataOverlay resource="traces" />;
  }

  const options: EChartsOption = {
    dataset: dataset,
    series: series,
  };

  if (contentDimensions === undefined) return null;

  return (
    <div data-testid="ScatterChartPanel_ScatterPlot">
      <Scatterplot
        width={contentDimensions.width}
        height={contentDimensions.height}
        options={options}
        link={spec.link}
      />
    </div>
  );
}

// exported for tests
export function getSymbolSize(
  spanCount: number,
  spanCountRange: [number, number],
  sizeRange: [number, number]
): number {
  const [minSize, maxSize] = sizeRange;
  const [minSpanCount, maxSpanCount] = spanCountRange;

  // catch divison by zero
  if (maxSpanCount - minSpanCount === 0) {
    return maxSize;
  }

  // apply linear scale of spanCount from range [minSpanCount,maxSpanCount] to a value from range [minSize,maxSize]
  const rel = (spanCount - minSpanCount) / (maxSpanCount - minSpanCount);
  return minSize + (maxSize - minSize) * rel;
}
