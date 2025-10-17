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

import { pluginReact } from '@rsbuild/plugin-react';
import { createConfigForPlugin } from '../rsbuild.shared';

export default createConfigForPlugin({
  name: 'PieChart',
  rsbuildConfig: {
    server: { port: 3008 },
    plugins: [pluginReact()],
  },
  moduleFederation: {
    exposes: {
      './PieChart': './src/PieChart.ts',
    },
    shared: {
      react: { requiredVersion: '18.2.0', singleton: true },
      'react-dom': { requiredVersion: '18.2.0', singleton: true },
      echarts: { requiredVersion: '5.5.0', singleton: true },
      'date-fns': { requiredVersion: '^4.1.0', singleton: true },
      lodash: { requiredVersion: '^4.17.21', singleton: true },
      '@perses-dev/components': { requiredVersion: '^0.53.0-beta.0', singleton: true },
      '@perses-dev/plugin-system': { requiredVersion: '^0.53.0-beta.0', singleton: true },
      '@emotion/react': { requiredVersion: '^11.11.3', singleton: true },
      '@emotion/styled': { requiredVersion: '^11.6.0', singleton: true },
      '@hookform/resolvers': { requiredVersion: '^3.2.0', singleton: true },
    },
  },
});
