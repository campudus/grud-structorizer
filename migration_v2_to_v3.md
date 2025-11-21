# Migration Guide from v2.x to v3.0.0

## Module Import

```javascript
// v2.x (CommonJS)
const grudStructorizer = require("grud-structorizer");

// v3.0.0 (ESM)
import grudStructorizer from "grud-structorizer";

// both versions support destructuring
const { Table, TableBuilder, ColumnBuilder, ConstraintBuilder } = structorizer;
// shorthand for
const Table = structorizer.Table;
const TableBuilder = structorizer.TableBuilder;
const ColumnBuilder = structorizer.ColumnBuilder;
const ConstraintBuilder = structorizer.ConstraintBuilder;
```

## Async/Await

All methods that make API calls are now async. Add `await` when calling them:

```javascript
// v2.x
const newTable = new TableBuilder("newTable", "generic").create();

// v3.0.0
const newTable = await new TableBuilder("newTable", "generic").create();
//or
const tableBuilder = new TableBuilder("newTable", "generic");
const newTable = await tableBuilder.create();
```

## Node.js Requirement

Node.js 18+ is required (for native ESM and global `fetch` API support)
