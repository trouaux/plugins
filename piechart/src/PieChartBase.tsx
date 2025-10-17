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

import { use } from 'echarts/core';
import { PieChart as EChartsPieChart } from 'echarts/charts';
import {
  GridComponent,
  DatasetComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  LegendComponentOption,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { Box } from '@mui/material';
import { ReactElement } from 'react';
import { EChart, useChartsTheme } from '@perses-dev/components';

use([EChartsPieChart, GridComponent, DatasetComponent, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);
export interface PieChartData {
  id?: string;
  name: string;
  value: number | null;
}

export interface PieChartBaseProps {
  width: number;
  height: number;
  data: PieChartData[] | null;
  legend?: LegendComponentOption;
}

export function PieChartBase(props: PieChartBaseProps): ReactElement {
  const { width, height, data } = props;
  const chartsTheme = useChartsTheme();

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: props.legend,
    series: [
      {
        type: 'pie',
        radius: '55%',
        label: false,
        center: ['50%', '50%'],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        itemStyle: {
          borderRadius: 2,
        },
      },
    ],
  };

  return (
    <Box
      style={{
        width: width,
        height: height,
      }}
      sx={{ overflow: 'auto' }}
    >
      <EChart
        sx={{
          width: '100%',
          height: '100%',
        }}
        option={option}
        theme={chartsTheme.echartsTheme}
      />
    </Box>
  );
}
