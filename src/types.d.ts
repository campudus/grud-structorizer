declare type ApiOptions = {
    cookies: any;
};

declare class Api {
    constructor(baseUrl: string, options: ApiOptions);
    doCall(method: string, url: string, json?: any, nonce?: string): Promise<object>;
    resetSchema(nonce: string): Promise<void>;
    fetchTable(tableId: number, includeRows?: boolean): Promise<object | undefined>;
    /**
     * @param displayName - multi-language object
     */
    createTable(name: string, hidden: boolean, displayName: any, type: string, group: number): Promise<object>;
    createColumns(tableId: any, columnObjArray: any): Promise<any[]>;
    createColumn(tableId: any, columnObject: any): Promise<object>;
    createRow(tableId: any, columnIds: any, values: any): Promise<number>;
    createRows(tableId: any, columnIds: any, rows: any): Promise<number[]>;
}

declare type GRUDStructorizer = {
    api: Api;
    Table: Table;
    Tables: Tables;
    TableBuilder: TableBuilder;
    ColumnBuilder: ColumnBuilder;
    ConstraintBuilder: ConstraintBuilder;
};

declare function grudStructorizer(baseUrl: string, options: any): GRUDStructorizer;

declare class Tables {
    constructor();
    /**
     * Fetches all tables
     */
    fetch(): Promise<Tables>;
    /**
     * Searches for a specific table. Fetch tables first
     */
    find(tableName: string): Table | undefined;
}

declare type Column = {
    id: number;
    name: string;
    kind: string;
};

declare class Table {
    constructor(tableId: number, tableName: string);
    /**
     * Fetches meta and columns for this Table object.
     * @param includeRows - retrieves rows (default: false)
     */
    fetch(includeRows: boolean): Promise<Table>;
    /**
     * Returns an array of row objects zipped with column names for this Table.
     *
     * The `rowId` property represents the row ID (PK) of the database,
     * so this value can be reused for updates/deletions/etc.
     * @returns array row objects
     */
    getRows(): object[];
    /**
     * Returns a single row object zipped with column names for this Table.
     *
     * The `rowId` property represents the row ID (PK) of the database,
     * so this value can be reused for updates/deletions/etc.
     * @returns row object
     */
    getRow(id: number): any;
    findColumn(nameOrId: string | number): void;
    createColumns(columnBuilderArray: ConstraintBuilder[]): Promise<Column[]>;
    deleteColumn(nameOrId: string | number): void;
    /**
     * @returns column id
     */
    createColumn(columnBuilder: ColumnBuilder): Promise<number>;
    /**
     * @returns row id
     */
    createRowByObj(columnNameToValueObject: any): Promise<number>;
    /**
     * @returns row id
     */
    createRow(): Promise<number>;
    /**
     * @returns array of row ids
     */
    createRows(rows: any[][], columns: number[]): Promise<number[]>;
    /**
     * Convenient method to change a single language column to multi language
     * @param pickLanguage - language in which raw values should be inserted (default: "first language of '/system/settings/langtags'")
     */
    convertColumnToMultilanguage(columnName: string, pickLanguage: string): Promise<void>;
    /**
     * Convenient method to change a multi language column to single language
     * @param pickLanguage - language from which values are taken as new values (default: first language of '/system/settings/langtags')
     */
    convertColumnToSinglelanguage(columnName: string, pickLanguage: string): Promise<void>;
}

declare class TableBuilder {
    constructor(name: string, type: "generic" | "settings" | "taxonomy");
    /**
     * @param args - one multi-language object or langtag-value list
     */
    displayName(...args: (object | string)[][]): TableBuilder;
    hidden(hidden?: boolean): TableBuilder;
    group(groupId: number): TableBuilder;
    create(): Promise<Table>;
}

declare class ColumnBuilder {
    constructor(name: string, kind: string);
    addConstraint(constraint: ConstraintCardinality | ConstraintDeleteCascade): ColumnBuilder;
    /**
     * @param args - one multi-language object or langtag-value list
     */
    displayName(...args: (object | string)[][]): ColumnBuilder;
    /**
     * @param args - one multi-language object or langtag-value list
     */
    description(...args: (object | string)[][]): ColumnBuilder;
    ordering(ordering: number): ColumnBuilder;
    multilanguage(multilanguage?: boolean): ColumnBuilder;
    languageType(languageType: string, countryCodes?: string[]): ColumnBuilder;
    identifier(identifier?: boolean): ColumnBuilder;
    separator(separator?: boolean): ColumnBuilder;
    hidden(hidden?: boolean): ColumnBuilder;
    maxLength(maxLength: number): ColumnBuilder;
    minLength(minLength: number): ColumnBuilder;
    decimalDigits(decimalDigits: number): ColumnBuilder;
    simpleLink(toTable: Table | number): ColumnBuilder;
    link(toTable: Table | number): ColumnBuilder;
    groups(groups: number[]): ColumnBuilder;
    showMemberColumns(showMemberColumns: boolean): ColumnBuilder;
    formatPattern(formatPattern: string): ColumnBuilder;
    toName(toName: string): ColumnBuilder;
    /**
     * @param args - one multi-language object or langtag-value list
     */
    toDisplayName(...args: (object | string)[][]): ColumnBuilder;
    /**
     * @param args - one multi-language object or langtag-value list
     */
    toDescription(...args: (object | string)[][]): ColumnBuilder;
    toOrdering(toOrdering: number | null): ColumnBuilder;
    singleDirection(): ColumnBuilder;
}

declare type ConstraintCardinality = any;

declare type ConstraintDeleteCascade = any;

declare type ConstraintArchiveCascade = any;

declare type ConstraintFinalCascade = any;

declare class ConstraintBuilder {
    static cardinalityOneToOne(): ConstraintCardinality;
    static cardinalityOneToMany(): ConstraintCardinality;
    static cardinalityManyToOne(): ConstraintCardinality;
    static cardinality(from: number, to: number): ConstraintCardinality;
    static deleteCascade(deleteCascade: boolean): ConstraintDeleteCascade;
    static archiveCascade(archiveCascade: boolean): ConstraintArchiveCascade;
    static finalCascade(finalCascade: boolean): ConstraintFinalCascade;
}

export { grudStructorizer as default };
