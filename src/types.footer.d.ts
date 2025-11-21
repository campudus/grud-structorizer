/**
 * Manual insert GRUDStructorizer typedef with proper constructor types
 *
 * JSDoc @typedef cannot properly express class constructors as type properties.
 * When defining @property {Table}, JSDoc interprets it as an instance type, not a constructor.
 * The correct TypeScript syntax for a class constructor is "typeof Table", which JSDoc
 * doesn't reliably transpile. Therefore, we insert the typedef here manually to
 * ensure TypeScript knows that structorizer.Table, structorizer.Tables, etc. are
 * constructors that can be instantiated with "new", not just instances.
 */
declare type GRUDStructorizer = {
  api: Api;
  Table: typeof Table;
  Tables: typeof Tables;
  TableBuilder: typeof TableBuilder;
  ColumnBuilder: typeof ColumnBuilder;
  ConstraintBuilder: typeof ConstraintBuilder;
};

/**
 * GRUDStructorizer - Manual main entry point for the library
 */
export { grudStructorizer as default };
