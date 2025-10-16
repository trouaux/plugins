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
  name: 'Tempo',
  rsbuildConfig: {
    server: { port: 3015 },
    plugins: [pluginReact()],
  },
  moduleFederation: {
    exposes: {
      './TempoDatasource': './src/plugins/tempo-datasource.tsx',
      './TempoTraceQuery': './src/plugins/tempo-trace-query/TempoTraceQuery.ts',
      './TempoExplorer': './src/explore/TempoExplorer.tsx',
    },
    shared: {
      react: { requiredVersion: '18.2.0', singleton: true },
      'react-dom': { requiredVersion: '18.2.0', singleton: true },
      echarts: { singleton: true },
      'date-fns': { singleton: true },
      'date-fns-tz': { singleton: true },
      lodash: { singleton: true },
      '@perses-dev/components': { singleton: true },
      '@perses-dev/plugin-system': { singleton: true },
      '@perses-dev/explore': { singleton: true },
      '@perses-dev/dashboards': { singleton: true },
      '@emotion/react': { requiredVersion: '^11.11.3', singleton: true },
      '@emotion/styled': { singleton: true },
      '@hookform/resolvers': { singleton: true },
      '@tanstack/react-query': { singleton: true },
      'react-hook-form': { singleton: true },
    },
  },
});
