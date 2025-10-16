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

package query

import (
	"github.com/perses/perses/go-sdk/datasource"
	"github.com/perses/perses/go-sdk/query"
)

const PluginKind = "PyroscopeProfileQuery"

type LabelFilter struct {
	LabelName  *string `json:"labelName,omitempty" yaml:"labelName,omitempty"`
	LabelValue *string `json:"labelValue,omitempty" yaml:"labelValue,omitempty"`
	Operator   *string `json:"operator,omitempty" yaml:"operator,omitempty"`
}

type PluginSpec struct {
	Datasource  *datasource.Selector `json:"datasource,omitempty" yaml:"datasource,omitempty"`
	MaxNodes    *int                 `json:"maxNodes,omitempty" yaml:"maxNodes,omitempty"`
	ProfileType string               `json:"profileType" yaml:"profileType"`
	Filters     []LabelFilter        `json:"filters,omitempty" yaml:"filters,omitempty"`
	Service     *string              `json:"service,omitempty" yaml:"service,omitempty"`
}

type Option func(plugin *Builder) error

func create(options ...Option) (Builder, error) {
	builder := &Builder{
		PluginSpec: PluginSpec{},
	}

	for _, opt := range options {
		if err := opt(builder); err != nil {
			return *builder, err
		}
	}

	return *builder, nil
}

type Builder struct {
	PluginSpec `json:",inline" yaml:",inline"`
}

func ProfileQL(options ...Option) query.Option {
	return func(builder *query.Builder) error {
		plugin, err := create(options...)
		if err != nil {
			return err
		}

		builder.Spec.Plugin.Kind = PluginKind
		builder.Spec.Plugin.Spec = plugin
		return nil
	}
}
