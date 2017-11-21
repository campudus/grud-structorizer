# Release Notes

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
