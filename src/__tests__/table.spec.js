const structorizer = require("../index")("http://localhost:8181");
const ColumnBuilder = structorizer.ColumnBuilder;
const Table = structorizer.Table;
// import checkKindForLanguageConversion from "../index";

let defaultTable;

describe("Table", () => {

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

  it("should throw errors if it's not of kind 'text' or 'shorttext''", () => {
    expect(() => Table.checkKindForLanguageConversion("number")).toThrow("Column must be of kind 'shorttext' or 'text'");
    expect(() => Table.checkKindForLanguageConversion(undefined)).toThrow("Column must be of kind 'shorttext' or 'text'");
  });

  it("should NOT throw errors", () => {
    expect(Table.checkKindForLanguageConversion("shorttext"));
    expect(Table.checkKindForLanguageConversion("text"));
  });

  it("should throw errors if system langtags don't contain language", () => {
    expect(() => Table.checkLanguageForLanguageConversion([], "de")).toThrow("Language 'de' not in '/system/settings/langtags'");
    expect(() => Table.checkLanguageForLanguageConversion(undefined, "de")).toThrow("Language 'de' not in '/system/settings/langtags'");
    expect(() => Table.checkLanguageForLanguageConversion(["de", "en"], "it")).toThrow("Language 'it' not in '/system/settings/langtags'");
  });

  it("should NOT throw errors if system langtags don't contain language", () => {
    expect(Table.checkLanguageForLanguageConversion(["de", "en"], "de"));
    expect(Table.checkLanguageForLanguageConversion(["de", "en", "it"], "it"));
  });

});
