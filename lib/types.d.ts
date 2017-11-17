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
    createColumns(columnBuilderArray: (ConstraintBuilder)[]): any[];

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
     * @returns {TableBuilder}
     */
    displayName(): TableBuilder;

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
     * @returns {ColumnBuilder}
     */
    displayName(): ColumnBuilder;

    /**
     * @returns {ColumnBuilder}
     */
    description(): ColumnBuilder;

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
     * @param countryCodes {Array.<string>}
     * @returns {ColumnBuilder}
     */
    languageType(languageType: string, countryCodes: string[]): ColumnBuilder;

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
     * @returns {ColumnBuilder}
     */
    toDisplayName(): ColumnBuilder;

    /**
     * @returns {ColumnBuilder}
     */
    toDescription(): ColumnBuilder;

    /**
     * @param toOrdering {number}
     * @returns {ColumnBuilder}
     */
    toOrdering(toOrdering: number): ColumnBuilder;

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

