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

import { LRLanguage } from '@codemirror/language';
import { parser } from '@grafana/lezer-logql';
import { Extension } from '@uiw/react-codemirror';
import { logqlHighlight } from './logql-highlight';

function logqlLanguage(): LRLanguage {
  return LRLanguage.define({
    parser: parser.configure({
      props: [logqlHighlight],
    }),
    languageData: {
      closeBrackets: { brackets: ['(', '[', '{', "'", '"', '`'] },
      commentTokens: { line: '#' },
    },
  });
}

export function LogQLExtension(): Array<LRLanguage | Extension> {
  const language = logqlLanguage();
  return [language];
}
