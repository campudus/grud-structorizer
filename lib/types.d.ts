/**
 * @typedef {object} SyncApiOptions
 * @property cookies {object}
 */
declare type SyncApiOptions = {
    cookies: any;
};

declare class SyncApi {
    constructor(baseUrl: string, options: SyncApiOptions);

    /**
     * @param method {string}
     * @param url {string}
     * @param [json] {object}
     * @param [nonce] {string}
     */
    doCall(method: string, url: string, json?: any, nonce?: string): void;

    /**
     * @param nonce {string}
     */
    resetSchema(nonce: string): void;

    /**
     * @param tableId {number}
     * @param [includeRows=false] {boolean}
     */
    fetchTable(tableId: number, includeRows?: boolean): void;

    /**
     * @param name {string}
     * @param hidden {boolean}
     * @param displayName {object} multi-language object
     * @param type {string}
     * @param group {number}
     * @returns {object}
     */
    createTable(name: string, hidden: boolean, displayName: any, type: string, group: number): any;

    /**
     * @param tableId
     * @param columnObjArray
     */
    createColumns(tableId: any, columnObjArray: any): void;

    /**
     * @param tableId
     * @param columnObject
     */
    createColumn(tableId: any, columnObject: any): void;

    /**
     * @param tableId
     * @param columnIds
     * @param values
     * @returns {*}
     */
    createRow(tableId: any, columnIds: any, values: any): any;

    /**
     * @param tableId
     * @param columnIds
     * @param rows
     */
    createRows(tableId: any, columnIds: any, rows: any): void;

}

/**
 * @param baseUrl {string}
 * @param options {object}
 * @returns {{api: SyncApi, Table: Table, Tables: Tables, TableBuilder: TableBuilder, ColumnBuilder: ColumnBuilder,
 *   ConstraintBuilder: ConstraintBuilder}}
 */
declare function grudStructorizer(baseUrl: string, options: any): any;

declare class Tables {
    constructor();

    /**
     * Fetches all tables
     * @returns {Tables}
     */
    fetch(): Tables;

    /**
     * Searches for a specific table. Fetch tables first
     * @param tableName {string}
     * @returns {Table}
     */
    find(tableName: string): Table;

}

/**
 * @typedef {object} Column
 * @property id {number}
 * @property name {string}
 * @property kind {string}
 */
declare type Column = {
    id: number;
    name: string;
    kind: string;
};

declare class Table {
    constructor(tableId: number, tableName: string);

    /**
     * Fetches meta and columns for this Table object.
     * @param includeRows retrieves rows (default: false) {boolean}
     * @returns {Table}
     */
    fetch(includeRows?: boolean): Table;

    /**
     * Returns an array of row objects zipped with column names for this Table.
     * The `rowId` property represents the row ID (PK) of the database,
     * so this value can be reused for updates/deletions/etc.
     * @returns {Array.<object>} array row objects
     */
    getRows(): any[];

    /**
     * Returns a single row object zipped with column names for this Table.
     * The `rowId` property represents the row ID (PK) of the database,
     * so this value can be reused for updates/deletions/etc.
     * @param id {number}
     * @returns {Object} row object
     */
    getRow(id: number): any;

    /**
     * @param nameOrId {string|number}
     */
    findColumn(nameOrId: string | number): void;

    /**
     * @param columnBuilderArray {Array.<ConstraintBuilder>}
     * @returns {Array.<Column>}
     */
    createColumns(columnBuilderArray: (ConstraintBuilder)[]): (Column)[];

    /**
     * @param nameOrId {string|number}
     */
    deleteColumn(nameOrId: string | number): void;

    /**
     * @param columnBuilder {ColumnBuilder}
     * @return {number} column id
     */
    createColumn(columnBuilder: ColumnBuilder): number;

    /**
     * @param columnNameToValueObject {object}
     * @returns {number} row id
     */
    createRowByObj(columnNameToValueObject: any): number;

    /**
     * @returns {number} row id
     */
    createRow(): number;

    /**
     * @param rows {Array.<Array.<any>>}
     * @param columns {Array.<number>}
     * @returns {Array.<number>} array of row ids
     */
    createRows(rows: (any[])[], columns: number[]): number[];

    /**
     * Convenient method to change a single language column to multi language
     * @param columnName {string}
     * @param pickLanguage language in which raw values should be inserted (default: "first language of '/system/settings/langtags'") {string}
     */
    convertColumnToMultilanguage(columnName: string, pickLanguage: string): void;

    /**
     * Convenient method to change a multi language column to single language
     * @param columnName {string}
     * @param pickLanguage language from which values are taken as new values (default: first language of '/system/settings/langtags') {string}
     */
    convertColumnToSinglelanguage(columnName: string, pickLanguage: string): void;

}

declare class TableBuilder {
    constructor(name: string, type: any | any);

    /**
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {TableBuilder}
     */
    displayName(...args: (any | string)[]): TableBuilder;

    /**
     * @param [hidden=true] {boolean}
     * @returns {TableBuilder}
     */
    hidden(hidden?: boolean): TableBuilder;

    /**
     * @param groupId {number}
     * @returns {TableBuilder}
     */
    group(groupId: number): TableBuilder;

    /**
     * @returns {Table}
     */
    create(): Table;

}

declare class ColumnBuilder {
    constructor(name: string, kind: string);

    /**
     * @param constraint {ConstraintCardinality|ConstraintDeleteCascade}
     * @returns {ColumnBuilder}
     */
    addConstraint(constraint: ConstraintCardinality | ConstraintDeleteCascade): ColumnBuilder;

    /**
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {ColumnBuilder}
     */
    displayName(...args: (any | string)[]): ColumnBuilder;

    /**
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {ColumnBuilder}
     */
    description(...args: (any | string)[]): ColumnBuilder;

    /**
     * @param ordering {number}
     * @returns {ColumnBuilder}
     */
    ordering(ordering: number): ColumnBuilder;

    /**
     * @param [multilanguage=true] {boolean}
     * @returns {ColumnBuilder}
     */
    multilanguage(multilanguage?: boolean): ColumnBuilder;

    /**
     * @param languageType {string}
     * @param [countryCodes=undefined] {Array.<string>}
     * @returns {ColumnBuilder}
     */
    languageType(languageType: string, countryCodes?: string[]): ColumnBuilder;

    /**
     * @param [identifier=true] {boolean}
     * @returns {ColumnBuilder}
     */
    identifier(identifier?: boolean): ColumnBuilder;

    /**
     * @param [separator=true] {boolean}
     * @returns {ColumnBuilder}
     */
    separator(separator?: boolean): ColumnBuilder;

    /**
     * @param toTable {Table|number}
     * @returns {ColumnBuilder}
     */
    simpleLink(toTable: Table | number): ColumnBuilder;

    /**
     * @param toTable {Table|number}
     * @returns {ColumnBuilder}
     */
    link(toTable: Table | number): ColumnBuilder;

    /**
     * @param groups {Array.<number>}
     * @returns {ColumnBuilder}
     */
    groups(groups: number[]): ColumnBuilder;

    /**
     * @param formatPattern {string}
     * @returns {ColumnBuilder}
     */
    formatPattern(formatPattern: string): ColumnBuilder;

    /**
     * @param toName {string}
     * @returns {ColumnBuilder}
     */
    toName(toName: string): ColumnBuilder;

    /**
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {ColumnBuilder}
     */
    toDisplayName(...args: (any | string)[]): ColumnBuilder;

    /**
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {ColumnBuilder}
     */
    toDescription(...args: (any | string)[]): ColumnBuilder;

    /**
     * @param toOrdering {number|null}
     * @returns {ColumnBuilder}
     */
    toOrdering(toOrdering: number | any): ColumnBuilder;

    /**
     * @returns {ColumnBuilder}
     */
    singleDirection(): ColumnBuilder;

}

/**
 * @typedef {{cardinality: {from: number, to: number}}} ConstraintCardinality
 */
declare type ConstraintCardinality = any;

/**
 * @typedef {{deleteCascade: boolean}} ConstraintDeleteCascade
 */
declare type ConstraintDeleteCascade = any;

declare class ConstraintBuilder {
    /**
     * @returns {ConstraintCardinality}
     */
    static cardinalityOneToOne(): ConstraintCardinality;

    /**
     * @returns {ConstraintCardinality}
     */
    static cardinalityOneToMany(): ConstraintCardinality;

    /**
     * @returns {ConstraintCardinality}
     */
    static cardinalityManyToOne(): ConstraintCardinality;

    /**
     * @param from {number}
     * @param to {number}
     * @returns {ConstraintCardinality}
     */
    static cardinality(from: number, to: number): ConstraintCardinality;

    /**
     * @param deleteCascade {boolean}
     * @returns {ConstraintDeleteCascade}
     */
    static deleteCascade(deleteCascade: boolean): ConstraintDeleteCascade;

}

