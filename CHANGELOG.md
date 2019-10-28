# Release Notes

## 1.9.2

* added `headers` parameter to options in backward compatible manner (cookies and headers object will be merged). This adds the ability to pass for example authorization bearer to SyncApi (e.g.`{ "headers": { "Authorization": "Bearer eyJhbGciOiJSU...C6XZsFhVsxFw"}`)

## 1.9.1

* added property `rowId` to methods `getRow` and `getRows` so it can be used for further manipulation like updates/deletions/etc.

## 1.9.0

* added method `convertColumnToMultilanguage` and `convertColumnToSinglelanguage` to `Table`

## 1.8.0

* added tests for `Table`
* added method `getRows` for `Table` which returns an array of row objects zipped with column names
* added method `getRow` for `Table` returns a single row object depending on the parameter `id`

## 1.7.1

* fix bug in `Table.createRowByObj` if columnName is a special word like 'length'
* fix typos in `package.json`

## 1.7.0

* add ability to configure `formatPattern` on group columns

## 1.6.0

* add new parameter for options
  * currently only cookies are implemented (e.g. `{ "cookies": { "cookie-name": { "value": "cookie-value" } }}`)
* rewrite syncApi to class implementation with better type support

## 1.5.0

* remove `minimist` dependency

## 1.4.0

* add a typedef for `Column`
* add some tests for `ColumnBuilder` and remove `resetSchema` test
* add type definitions for multi-language methods `displayName()`, `description()`, etc.
* add argument checks for `languageType()` and `toOrdering()`

## 1.3.0

* add TypeScript definitions

## 1.2.0

* add simple JSDoc comments and generate docs

## 1.1.1

* fix bug in `Table.createRowByObj` in error case

## 1.1.0

* add new method `toOrdering` to `ColumnBuilder`
* change npm script `prepare` to `prepublishOnly` b/c this shouldn't run on `npm install`

## 1.0.0

* initial release
