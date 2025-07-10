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

import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartsProvider, testChartsTheme } from '@perses-dev/components';
import { TimeRangeValue, toAbsoluteTimeRange } from '@perses-dev/core';
import { TimeRangeContext } from '@perses-dev/plugin-system';
import { VirtuosoMockContext } from 'react-virtuoso';
import { MOCK_TIME_SERIES_DATA_MULTIVALUE } from './test/mock-query-results';
import { TimeSeriesChartPanel, TimeSeriesChartProps } from './TimeSeriesChartPanel';

const TEST_TIME_RANGE: TimeRangeValue = { pastDuration: '1h' };

const TEST_TIME_SERIES_PANEL: Omit<TimeSeriesChartProps, 'queryResults'> = {
  contentDimensions: {
    width: 500,
    height: 500,
  },
  spec: {
    legend: {
      position: 'right',
    },
    yAxis: {
      format: { unit: 'decimal', decimalPlaces: 2 },
    },
  },
};

const TEST_QUERY_DEFINITION = {
  kind: 'TimeSeriesQuery',
  spec: {
    plugin: {
      kind: 'PrometheusTimeSeriesQuery',
      spec: {
        query: '',
      },
    },
  },
};

function getLegendByName(name?: string): HTMLElement {
  if (typeof name !== 'string') {
    throw new Error('Legend name must be a string.');
  }

  return screen.getByRole('listitem', {
    name: (content, element) => {
      return element.innerHTML.includes(name);
    },
  });
}

describe('TimeSeriesChartPanel', () => {
  // Helper to render the panel with some context set
  const renderPanel = (): void => {
    const mockTimeRangeContext = {
      refreshIntervalInMs: 0,
      setRefreshInterval: (): Record<string, unknown> => ({}),
      timeRange: TEST_TIME_RANGE,
      setTimeRange: (): Record<string, unknown> => ({}),
      absoluteTimeRange: toAbsoluteTimeRange(TEST_TIME_RANGE),
      refresh: jest.fn(),
      refreshKey: `${TEST_TIME_RANGE.pastDuration}:0`,
      timeZone: 'UTC',
      setTimeZone: () => ({}),
    };

    render(
      <VirtuosoMockContext.Provider value={{ viewportHeight: 600, itemHeight: 100 }}>
        <ChartsProvider chartsTheme={testChartsTheme}>
          <TimeRangeContext.Provider value={mockTimeRangeContext}>
            <TimeSeriesChartPanel
              {...TEST_TIME_SERIES_PANEL}
              queryResults={[{ definition: TEST_QUERY_DEFINITION, data: MOCK_TIME_SERIES_DATA_MULTIVALUE }]}
            />
          </TimeRangeContext.Provider>
        </ChartsProvider>
      </VirtuosoMockContext.Provider>
    );
  };

  it('should render the legend with unformatted series labels', async () => {
    renderPanel();
    expect(
      await screen.findByText(
        'device="/dev/vda1", env="demo", fstype="ext4", instance="demo.do.prometheus.io:9100", job="node", mountpoint="/"'
      )
    ).toBeInTheDocument();
  });

  it('should toggle selected state when a legend item is clicked', async () => {
    renderPanel();

    const seriesArr = MOCK_TIME_SERIES_DATA_MULTIVALUE.series;
    const firstName = seriesArr[0]?.name;
    const secondName = seriesArr[1]?.name;

    userEvent.click(getLegendByName(firstName));
    expect(getLegendByName(firstName)).toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).not.toHaveClass('Mui-selected');

    userEvent.click(getLegendByName(secondName));
    expect(getLegendByName(firstName)).not.toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).toHaveClass('Mui-selected');
  });

  it('should modify selected state when a legend item is clicked with shift key', async () => {
    renderPanel();
    const seriesArr = MOCK_TIME_SERIES_DATA_MULTIVALUE.series;

    const firstName = seriesArr[0]?.name;
    const secondName = seriesArr[1]?.name;

    // Add first legend item
    userEvent.click(getLegendByName(firstName), {
      shiftKey: true,
    });
    expect(getLegendByName(firstName)).toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).not.toHaveClass('Mui-selected');

    // Add second legend item
    userEvent.click(getLegendByName(secondName), {
      shiftKey: true,
    });
    expect(getLegendByName(firstName)).toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).toHaveClass('Mui-selected');

    // Remove first legend item
    userEvent.click(getLegendByName(firstName), {
      shiftKey: true,
    });
    expect(getLegendByName(firstName)).not.toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).toHaveClass('Mui-selected');

    // Remove second legend item
    userEvent.click(getLegendByName(secondName), {
      shiftKey: true,
    });
    expect(getLegendByName(firstName)).not.toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).not.toHaveClass('Mui-selected');
  });

  it('should modify selected state when a legend item is clicked with meta key', async () => {
    renderPanel();
    const seriesArr = MOCK_TIME_SERIES_DATA_MULTIVALUE.series;

    // Falling back to a bogus string if not set to appease typescript.
    const firstName = seriesArr[0]?.name;
    const secondName = seriesArr[1]?.name;

    // Add first legend item
    userEvent.click(getLegendByName(firstName), {
      metaKey: true,
    });

    expect(getLegendByName(firstName)).toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).not.toHaveClass('Mui-selected');

    // Add second legend item
    userEvent.click(getLegendByName(secondName), {
      metaKey: true,
    });
    expect(getLegendByName(firstName)).toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).toHaveClass('Mui-selected');

    // Remove first legend item
    userEvent.click(getLegendByName(firstName), {
      metaKey: true,
    });
    expect(getLegendByName(firstName)).not.toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).toHaveClass('Mui-selected');

    // Remove second legend item
    userEvent.click(getLegendByName(secondName), {
      metaKey: true,
    });
    expect(getLegendByName(firstName)).not.toHaveClass('Mui-selected');
    expect(getLegendByName(secondName)).not.toHaveClass('Mui-selected');
  });
});
