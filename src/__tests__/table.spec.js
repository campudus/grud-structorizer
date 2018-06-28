const structorizer = require("../index")("http://localhost:8181");

const ColumnBuilder = structorizer.ColumnBuilder;
const Table = structorizer.Table;
const StaticHelpers = structorizer.StaticHelpers;

describe("Table", () => {
  let defaultTable;

  beforeEach(() => {
    defaultTable = new Table(1, "testTable");

    const col1 = new ColumnBuilder("a_number", "numeric");
    const col2 = new ColumnBuilder("name", "shorttext");
    const col3 = new ColumnBuilder("hexcode", "shorttext");

    defaultTable.columns = [col1.column, col2.column, col3.column];

    const rows = [
      { "id": 1, "values": [ 11, "black", "000000" ] },
      { "id": 2, "values": [ 22, "white", "FFFFFF" ] },
      { "id": 4, "values": [ 44, "red", "ba2a29" ] }
    ];

    defaultTable.rows = rows;
  });

  it("should not run on exception 'column '0' is not defined in table'", () => {
    const table = new Table(1, "testTable");

    const col1 = new ColumnBuilder("length", "numeric");
    const col2 = new ColumnBuilder("x", "shorttext");
    col1.column.id = 0;
    col2.column.id = 1;

    table.columns = [col1.column, col2.column];

    const {columnIds, values} = table.getValuesFromCreateRowByObj({ length: 42, x: "someText" });

    expect(columnIds).toEqual([0, 1]);
    expect(values).toEqual([42, "someText"]);
  });

  it("should contain a array of three row ojects", () => {
    expect(defaultTable.getRows().length).toEqual(3);
    expect(defaultTable.getRows()[0]).toEqual({ "a_number": 11, "name": "black", "hexcode": "000000" });
    expect(defaultTable.getRows()[1]).toEqual({ "a_number": 22, "name": "white", "hexcode": "FFFFFF" });
    expect(defaultTable.getRows()[2]).toEqual({ "a_number": 44, "name": "red", "hexcode": "ba2a29" });
  });

  it("should contain a single row ojects", () => {
    expect(defaultTable.getRow(2)).toEqual({ "a_number": 22, "name": "white", "hexcode": "FFFFFF" });
  });

  it("should throw row for id does not exist", () => {
    expect(() => defaultTable.getRow(42)).toThrow("No row found for id '42'");
  });

  it("should throw 'id' should be a number", () => {
    expect(() => defaultTable.getRow("not_a_number")).toThrow("Parameter 'id' should be a number");
  });

  it("should throw an error if rows aren't fetched", () => {
    const table = new Table(1, "testTable");
    expect(() => table.getRows()).toThrow("Fetch table and rows first");
    expect(() => table.getRow(42)).toThrow("Fetch table and rows first");
  });
});

let convertTable;

beforeEach(() => {
  convertTable = new Table(1, "testTable");

  const col1 = new ColumnBuilder("number", "numeric");
  const col2 = new ColumnBuilder("name_single", "shorttext");
  const col3 = new ColumnBuilder("name_multi", "shorttext");

  convertTable.columns = [col1.column, col2.column, col3.column];
  col1.column.id = 1;
  col2.column.id = 2;
  col3.column.id = 3;
  col3.column.multilanguage = true;

  const rows = [
    { "id": 1, "values": [ 11, "abc", {de: "de_abc", en: "en_abc"} ] },
    { "id": 2, "values": [ 22, "def", {de: "de_def", en: "en_def"} ] },
    { "id": 4, "values": [ 44, "ghi", {de: "de_ghi", en: "en_ghi"} ] }
  ];

  convertTable.rows = rows;

  // mock fetchTable
  structorizer.api.fetchTable = jest.fn();
});

describe("Table convert to single language (single)", () => {

  it("should throw error for unknown column name", () => {
    expect(() => convertTable.convertColumnToSinglelanguage("unknown_column")).toThrow("Column name 'unknown_column' does not exist");
  });

  it("should throw error for unknown language (single)", () => {
    StaticHelpers.getLanguages = jest.fn(() => ["de", "en"]);

    expect(() => convertTable.convertColumnToSinglelanguage("name_multi", "very_special_language")).toThrow("Language 'very_special_language' not in '/system/settings/langtags'");
  });

  it("should throw error for invalid type (single)", () => {
    StaticHelpers.getLanguages = jest.fn(() => ["de", "en"]);

    expect(() => convertTable.convertColumnToSinglelanguage("number", "de")).toThrow("Column must be of kind 'shorttext' or 'text'");
  });

  it("should throw error because it's already single language (single)", () => {
    StaticHelpers.getLanguages = jest.fn(() => ["de", "en"]);

    expect(() => convertTable.convertColumnToSinglelanguage("name_single", "de")).toThrow("Column is already single language");
  });
});

describe("Table convert to multi language", () => {

  it("should throw error for unknown column name (multi)", () => {
    expect(() => convertTable.convertColumnToMultilanguage("unknown_column")).toThrow("Column name 'unknown_column' does not exist");
  });

  it("should throw error for unknown language (multi)", () => {
    StaticHelpers.getLanguages = jest.fn(() => ["de", "en"]);

    expect(() => convertTable.convertColumnToMultilanguage("name_multi", "very_special_language")).toThrow("Language 'very_special_language' not in '/system/settings/langtags'");
  });

  it("should throw error for invalid type (multi)", () => {
    StaticHelpers.getLanguages = jest.fn(() => ["de", "en"]);

    expect(() => convertTable.convertColumnToMultilanguage("number", "de")).toThrow("Column must be of kind 'shorttext' or 'text'");
  });

  it("should throw error because it's already multi language (multi)", () => {
    StaticHelpers.getLanguages = jest.fn(() => ["de", "en"]);

    expect(() => convertTable.convertColumnToMultilanguage("name_multi", "de")).toThrow("Column is already multi language");
  });
});
