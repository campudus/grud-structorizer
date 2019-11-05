# grud-structorizer

Small synchronous JS SDK for building GRUD schemas

## Documentation

See [docs](https://campudus.github.io/grud-structorizer) for API documentation

## Options

The constructor takes two arguments, url and options.

Currently we supports the following options:

- **cookies** allows to pass a cookie header as object for requests

  ```javascript
  // expressjs session cookie via cookies
  const option = { "cookies": { "connect.sid": { "value":"s%3Al...PWgk;" } } }
  ```

- **headers** allows to pass headers for requests

  ```javascript
  // expressjs session cookie via headers
  const option = { "headers": { "Cookie": "connect.sid=s%3Al...PWgk;" } }
  // OAuth 2.0 bearer token
  const option = { "headers": { "Authorization": "Bearer eyJhbG...ciOiJSUz" } }
  ```

## Example

```javascript
const grudStructorizer = require('grud-structorizer');

const options = { };
const structorizer = grudStructorizer("http://localhost:8181", options);

const TableBuilder = structorizer.TableBuilder;
const ColumnBuilder = structorizer.ColumnBuilder;
const ConstraintBuilder = structorizer.ConstraintBuilder;

const newTable = new TableBuilder("newTable", "generic")
  .displayName("de", "Neue Tabelle", "en", "New table")
  .create();

newTable.createColumns([
  new ColumnBuilder("rowIdentifier", "shorttext")
    .displayName("de", "Name")
    .identifier()
]);

newTable.createRowByObj({rowIdentifier: "Test"});
```

## Changelog

See [CHANGELOG.md](https://github.com/campudus/grud-structorizer/blob/master/CHANGELOG.md)

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