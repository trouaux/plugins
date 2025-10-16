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

import { Box, Chip, IconButton, Tab, Tabs, Typography } from '@mui/material';
import { ReactElement, useState } from 'react';
import CloseIcon from 'mdi-material-ui/Close';
import { Span, Trace } from '../trace';
import { CustomLinks } from '../../gantt-chart-model';
import { TraceAttributes } from './Attributes';
import { SpanEventList } from './SpanEvents';
import { SpanLinkList } from './SpanLinks';

export interface DetailPaneProps {
  customLinks?: CustomLinks;
  trace: Trace;
  span: Span;
  onCloseBtnClick: () => void;
}

/**
 * DetailPane renders a sidebar showing the span attributes etc.
 */
export function DetailPane(props: DetailPaneProps): ReactElement {
  const { customLinks, trace, span, onCloseBtnClick } = props;
  const [tab, setTab] = useState<'attributes' | 'events' | 'links'>('attributes');

  // if the events tab is selected, and then a span without events is clicked,
  // we need to switch the current selected tab back to the attributes tab.
  if (tab === 'events' && span.events.length === 0) {
    setTab('attributes');
  }
  // same as above, but for span links
  if (tab === 'links' && span.links.length === 0) {
    setTab('attributes');
  }

  return (
    <Box>
      <IconButton sx={{ float: 'right' }} onClick={onCloseBtnClick}>
        <CloseIcon />
      </IconButton>
      <Typography sx={{ wordBreak: 'break-word' }}>{span.resource.serviceName}</Typography>
      <Typography variant="h2" sx={{ wordBreak: 'break-word' }}>
        {span.name}
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, tab) => setTab(tab)} variant="scrollable">
          <Tab sx={{ p: 0 }} value="attributes" label="Attributes" />
          {span.events.length > 0 && (
            <Tab
              value="events"
              label="Events"
              icon={<Chip label={span.events.length} />}
              iconPosition="end"
              sx={{ minHeight: 48, height: 48 }} // MUI Tabs with icon are bigger than those without by default
            />
          )}
          {span.links.length > 0 && (
            <Tab
              value="links"
              label="Links"
              icon={<Chip label={span.links.length} />}
              iconPosition="end"
              sx={{ minHeight: 48, height: 48 }} // MUI Tabs with icon are bigger than those without by default
            />
          )}
        </Tabs>
      </Box>
      {tab === 'attributes' && <TraceAttributes customLinks={customLinks} trace={trace} span={span} />}
      {tab === 'events' && <SpanEventList customLinks={customLinks} trace={trace} span={span} />}
      {tab === 'links' && <SpanLinkList customLinks={customLinks} span={span} />}
    </Box>
  );
}
