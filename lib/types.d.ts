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

