# grud-structorizer

Small synchronous JS SDK for building GRUD schemas

## Documentation

See [docs](docs/) for API documentation

## Example

```javascript
const grudStructorizer = require('grud-structorizer');

const structorizer = grudStructorizer("http://localhost:8181");

const TableBuilder = structorizer.TableBuilder;
const ColumnBuilder = structorizer.ColumnBuilder;
const ConstraintBuilder = structorizer.ConstraintBuilder;

const newTable = new TableBuilder("newTable", "generic").displayName("de", "Neue Tabelle", "en", "New table")
                                                        .create();

newTable.createColumns([
  new ColumnBuilder("rowIdentifier", "shorttext").displayName("de", "Name")
                                                 .identifier()
]);

newTable.createRowByObj({rowIdentifier: "Test"});
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## License

> Copyright 2016-present Campudus GmbH.
> 
> Licensed under the Apache License, Version 2.0 (the "License");
> you may not use this file except in compliance with the License.
> You may obtain a copy of the License at
> 
>     http://www.apache.org/licenses/LICENSE-2.0
> 
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an "AS IS" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
> See the License for the specific language governing permissions and
> limitations under the License.