"use strict";

const _ = require("lodash");
const SyncApi = require("./SyncApi");

function argumentsToMultiLanguageObj(argsObj) {
  const args = _.toArray(argsObj);
  const langtagRegex = /[a-z]{2,3}[-_][A-Z]{2,3}|[a-z]{2,3}/;

  let obj = {};

  if (args.length === 1 && _.isPlainObject(args[0])) {
    let valid = _.every(_.keys(args[0]), function (key) {
      return langtagRegex.test(key);
    });

    if (valid) {
      obj = args[0];
    } else {
      throw new Error("arguments must be either key/value list (e.g. de-DE, Tabelle, en-GB, table) or a plain object");
    }
  } else if (_.isArray(args) && args.length % 2 === 0) {
    let object = {};

    for (let i = 0; i < args.length; i += 2) {
      const langtag = args[i];
      const value = args[i + 1];

      if (langtag !== undefined && langtagRegex.test(langtag) && value !== undefined) {
        object[langtag] = value;
      } else {
        throw new Error("Arguments are wrong. undefined or wrong langtag. (" + JSON.stringify(args) + ")");
      }
    }

    obj = object;
  } else {
    console.log("invalid args", args, _.isArray(args), _.isPlainObject(args), _.toArray(args));
    throw new Error("arguments must be either key/value list (e.g. de-DE, Tabelle, en-GB, table) or a plain object");
  }

  return obj;
}

/**
 *
 * @param baseUrl {string}
 * @param options {object}
 * @returns {{api: SyncApi, Table: Table, Tables: Tables, TableBuilder: TableBuilder, ColumnBuilder: ColumnBuilder,
 *   ConstraintBuilder: ConstraintBuilder}}
 */
function grudStructorizer(baseUrl, options) {

  const tableaux = new SyncApi(baseUrl, options);

  const StaticHelpers = {
    getLanguages: () => {
      return tableaux.doCall("GET", "/system/settings/langtags").value;
    },

    checkKindForLanguageConversion: (kind) => {
      const ALLOWED_TYPES = ["shorttext", "text"];

      if (!_.includes(ALLOWED_TYPES, kind)) {
        throw new Error(`Column must be of kind '${_.join(ALLOWED_TYPES, "' or '")}'`);
      }
    },

    checkLanguageForLanguageConversion: (languages, targetLanguage) => {
      if (!_.includes(languages, targetLanguage)) {
        throw new Error(`Language '${targetLanguage}' not in '/system/settings/langtags'`);
      }
    }
  };

  /**
   *
   */
  class Tables {

    /**
     *
     */
    constructor() {
      this.tables = [];
    }

    /**
     * Fetches all tables
     *
     * @returns {Tables}
     */
    fetch() {
      Object.assign(this, tableaux.doCall("GET", "/tables"));
      return this;
    }

    /**
     * Searches for a specific table. Fetch tables first
     *
     * @param tableName {string}
     * @returns {Table}
     */
    find(tableName) {
      const table = _.find(this.tables, {name: tableName});

      if (table) {
        return new Table(table.id, table.name);
      }
    }
  }

  /**
   * @typedef {object} Column
   * @property id {number}
   * @property name {string}
   * @property kind {string}
   */

  /**
   *
   */
  class Table {
    /**
     *
     * @param tableId {number}
     * @param tableName {string}
     */
    constructor(tableId, tableName) {
      if (typeof tableId !== "number") {
        throw new Error("parameter 'tableId' should be a number");
      }

      if (typeof tableName !== "string") {
        throw new Error("parameter 'tableName' should be a string");
      }

      this.tableId = tableId;
      this.name = tableName;
      this.columns = [];
    }

    /**
     * Fetches meta and columns for this Table object.
     *
     * @param includeRows retrieves rows (default: false) {boolean}
     * @returns {Table}
     */
    fetch(includeRows = false) {
      Object.assign(this, tableaux.fetchTable(this.tableId, includeRows));
      return this;
    }

    /**
     * Returns an array of row objects zipped with column names for this Table.
     *
     * The `rowId` property represents the row ID (PK) of the database,
     * so this value can be reused for updates/deletions/etc.
     *
     * @returns {Array.<object>} array row objects
     */
    getRows() {
      if (!this.columns || !this.rows) {
        throw new Error("Fetch table and rows first");
      }
      return _.map(
        this.rows,
        (row) => {
          const obj = _.zipObject(_.map(this.columns, "name"), row.values);
          obj.rowId = row.id;
          return obj;
        }
      );
    }

    /**
     * Returns a single row object zipped with column names for this Table.
     *
     * The `rowId` property represents the row ID (PK) of the database,
     * so this value can be reused for updates/deletions/etc.
     *
     * @param id {number}
     * @returns {Object} row object
     */
    getRow(id) {
      if (!this.columns || !this.rows) {
        throw new Error("Fetch table and rows first");
      }
      if (typeof id !== "number") {
        throw new Error("Parameter 'id' should be a number");
      }

      const foundRow = _.find(this.rows, (row) => row.id === id);

      if (!foundRow) {
        throw new Error("No row found for id '" + id + "'");
      }

      const obj = _.zipObject(_.map(this.columns, "name"), foundRow.values);
      obj.rowId = foundRow.id;

      return obj;
    }

    /**
     *
     * @param nameOrId {string|number}
     */
    findColumn(nameOrId) {
      if (!this.columns) {
        throw new Error("Fetch table first");
      }

      return _.find(this.columns, function (column) {
        if (_.isInteger(nameOrId)) {
          return column.id === nameOrId;
        } else {
          return column.name === nameOrId;
        }
      });
    }

    /**
     *
     * @param columnBuilderArray {Array.<ConstraintBuilder>}
     * @returns {Array.<Column>}
     */
    createColumns(columnBuilderArray) {
      if (typeof this.tableId === "undefined") {
        throw new Error("table " + this.name + " should be created first");
      }

      const columnObjArray = columnBuilderArray.map(function (columnBuilder) {
        return columnBuilder.build();
      });

      const self = this;

      columnObjArray.forEach(function (columnObject) {
        self.columns.forEach(function (column) {
          if (column.name === columnObject.name) {
            throw new Error("column " + columnObject.name + " can't be created because its name " + columnObject.name + " is already used");
          }
        });
      });

      const newColumns = tableaux.createColumns(this.tableId, columnObjArray);

      newColumns.forEach(function (newColumn) {
        self.columns.push(newColumn);
      });

      return newColumns;
    }

    /**
     *
     * @param nameOrId {string|number}
     */
    deleteColumn(nameOrId) {
      const column = this.findColumn(nameOrId);

      if (!column) {
        throw new Error("No column with this name or ID found '" + nameOrId + "'");
      }

      const response = tableaux.doCall("DELETE", "/tables/" + this.tableId + "/columns/" + column.id);

      if (response) {
        _.remove(this.columns, function (c) {
          return c.id === column.id;
        });
      }
    }

    /**
     *
     * @param columnBuilder {ColumnBuilder}
     * @return {number} column id
     */
    createColumn(columnBuilder) {
      if (typeof this.tableId === "undefined") {
        throw new Error("table " + this.name + " should be created first");
      }

      const columnObject = columnBuilder.build();

      this.columns.forEach(function (column) {
        if (column.name === columnObject.name) {
          throw new Error("column " + columnObject.name + " can't be created because its name " + columnObject.name + " is already used");
        }
      });

      const newColumn = tableaux.createColumn(this.tableId, columnBuilder.build());

      this.columns.push(newColumn);

      return newColumn.id;
    }

    getValuesFromCreateRowByObj(columnNameToValueObject) {
      if (!this.columns) {
        throw new Error("table needs to be fetched first, columns should be defined");
      }

      if (!_.isPlainObject(columnNameToValueObject)) {
        throw new Error("columnNameToValueObject should be a simple plain object");
      }

      const columnNames = _.keys(columnNameToValueObject);
      const columnIdToValueArray = columnNames.map((columnName) => {
        const column = _.find(this.columns, ["name", columnName]);

        if (!column) {
          throw new Error("column '" + columnName + "' is not defined in table '" + this.name + "'");
        }
        return [column.id, columnNameToValueObject[columnName]];
      });

      const columnIds = _.map(columnIdToValueArray, _.first);
      const values = _.map(columnIdToValueArray, _.last);

      return {
        columnIds,
        values
      };
    }

    /**
     *
     * @param columnNameToValueObject {object}
     * @returns {number} row id
     */
    createRowByObj(columnNameToValueObject) {

      const {columnIds, values} = this.getValuesFromCreateRowByObj(columnNameToValueObject);

      return this.createRows([values], columnIds)[0];
    }

    /**
     *
     * @returns {number} row id
     */
    createRow() {
      // convert arguments to array and
      // hand it over to createRows with just one row
      return this.createRows([_.toArray(arguments)])[0];
    }

    /**
     *
     * @param rows {Array.<Array.<any>>}
     * @param columns {Array.<number>}
     * @returns {Array.<number>} array of row ids
     */
    createRows(rows, columns) {
      if (typeof this.tableId === "undefined") {
        throw new Error("table should be created first");
      }

      const firstRowValues = _.head(rows) || [];
      const sameLength = _.every(rows, function (rowValues) {
        return rowValues.length === firstRowValues.length;
      });

      if (!sameLength) {
        throw new Error("all rows need to have same values length");
      }

      // generate IDs based on rowValues length
      const columnIds = columns || _.range(1, firstRowValues.length + 1);

      return tableaux.createRows(this.tableId, columnIds, rows);
    }

    changeColumn(columnId, changeObj) {
      return tableaux.doCall("POST", "/tables/" + this.tableId + "/columns/" + columnId, changeObj);
    }

    getColumn(columnName) {
      const column = this.findColumn(columnName);
      if (!column) {
        throw new Error(`Column name '${columnName}' does not exist`);
      }
      return column;
    };
    /**
     * Convenient method to change a single language column to multi language
     *
     * @param columnName {string}
     * @param pickLanguage language in which raw values should be inserted (default: "first language of '/system/settings/langtags'") {string}
     */
    convertColumnToMultilanguage(columnName, pickLanguage) {
      this.fetch();

      const column = this.getColumn(columnName);

      const {ordering, kind, identifier, displayName, description, multilanguage} = _.find(this.columns, {name: columnName});

      const languages = StaticHelpers.getLanguages();
      const defaultLanguage = _.head(languages);

      StaticHelpers.checkLanguageForLanguageConversion(languages, pickLanguage || defaultLanguage);
      StaticHelpers.checkKindForLanguageConversion(kind);

      if (multilanguage) {
        throw new Error("Column is already multi language");
      }

      const columnIndex = _.findIndex(this.columns, {name: columnName});

      this.changeColumn(column.id, {name: columnName + "_convert_language"});
      this.fetch(true);

      const newColumnId = this.createColumn(
        new ColumnBuilder(columnName, kind).displayName(displayName).identifier(identifier).description(description).ordering(ordering).multilanguage(true),
      );

      _.forEach(this.rows, row => {
        const { id: rowId, values } = row;
        const value = values[columnIndex];
        const url = "/tables/" + this.tableId + "/columns/" + newColumnId + "/rows/" + rowId;

        if (!value) {
          return;
        }

        const mapValueIntoLanguage = (value, lang) => {
          return {
            value: {
              [lang]: value
            }
          };
        };

        const newValue = mapValueIntoLanguage(value, pickLanguage || defaultLanguage);

        tableaux.doCall("PATCH", url, newValue);

        tableaux.doCall("POST", `${url}/annotations`, {
          langtags: languages,
          type: "flag",
          value: "needs_translation"
        });
      });

      tableaux.doCall("DELETE", "/tables/" + this.tableId + "/columns/" + column.id);
    };

    /**
     * Convenient method to change a multi language column to single language
     * @param columnName {string}
     * @param pickLanguage language from which values are taken as new values (default: first language of '/system/settings/langtags') {string}
     */
    convertColumnToSinglelanguage(columnName, pickLanguage) {
      this.fetch();

      const column = this.getColumn(columnName);
      const {ordering, kind, identifier, displayName, description, multilanguage} = _.find(this.columns, {name: columnName});

      const languages = StaticHelpers.getLanguages();
      const defaultLanguage = _.head(languages);

      StaticHelpers.checkLanguageForLanguageConversion(languages, pickLanguage || defaultLanguage);
      StaticHelpers.checkKindForLanguageConversion(kind);

      if (!multilanguage) {
        throw new Error("Column is already single language");
      }

      const columnIndex = _.findIndex(this.columns, {name: columnName});

      this.changeColumn(column.id, {name: columnName + "_convert_language"});
      this.fetch(true);

      const newColumnId = this.createColumn(
        new ColumnBuilder(columnName, kind).displayName(displayName).identifier(identifier).description(description).ordering(ordering).multilanguage(false),
      );

      _.forEach(this.rows, row => {
        const { id: rowId, values, annotations } = row;

        const newValue = _.get(values[columnIndex], pickLanguage || defaultLanguage);
        const url = "/tables/" + this.tableId + "/columns/" + newColumnId + "/rows/" + rowId;

        if (!newValue) {
          return;
        }

        tableaux.doCall("PATCH", url, {value: newValue});

        if (_.includes(annotations, columnIndex)) {
          // there schould be not more than one translation flag per cell
          const langAnnotation = _.head(_.filter(annotations[columnIndex], { "value": "needs_translation" }));

          if (langAnnotation) {
            tableaux.doCall("DELETE", `${url}/annotations/${langAnnotation.uuid}`);
          }
        }
      });

      tableaux.doCall("DELETE", "/tables/" + this.tableId + "/columns/" + column.id);
    }
  }

  /**
   *
   */
  class TableBuilder {

    /**
     *
     * @param name {string}
     * @param type {("generic"|"settings")}
     */
    constructor(name, type) {
      this.name = name;
      this._groupId = null;

      if (type === "generic" || type === "settings") {
        this.type = type;
      } else {
        throw new Error("invalid table type");
      }
    }

    /**
     *
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {TableBuilder}
     */
    displayName(...args) {
      this._displayName = argumentsToMultiLanguageObj(args);
      return this;
    }

    /**
     *
     * @param [hidden=true] {boolean}
     * @returns {TableBuilder}
     */
    hidden(hidden) {
      this._hidden = typeof hidden === "boolean" ? hidden : true;
      return this;
    }

    /**
     *
     * @param groupId {number}
     * @returns {TableBuilder}
     */
    group(groupId) {
      if (typeof groupId !== "number") {
        throw new Error("groupId should be a int");
      }

      this._groupId = groupId;
      return this;
    }

    /**
     *
     * @returns {Table}
     */
    create() {
      const tableId = tableaux.createTable(this.name, this._hidden, this._displayName, this.type, this._groupId).id;

      return new Table(tableId, this.name);
    }
  }

  /**
   *
   */
  class ColumnBuilder {
    /**
     *
     * @param name {string}
     * @param kind {string}
     */
    constructor(name, kind) {
      this.column = {
        "name": name,
        "kind": kind
      };
    }

    /**
     *
     * @param constraint {ConstraintCardinality|ConstraintDeleteCascade}
     * @returns {ColumnBuilder}
     */
    addConstraint(constraint) {
      _.merge(this.column, {
        constraint: constraint
      });

      return this;
    }

    /**
     *
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {ColumnBuilder}
     */
    displayName(...args) {
      this.column.displayName = argumentsToMultiLanguageObj(args);
      return this;
    }

    /**
     *
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {ColumnBuilder}
     */
    description(...args) {
      this.column.description = argumentsToMultiLanguageObj(args);
      return this;
    }

    /**
     *
     * @param ordering {number}
     * @returns {ColumnBuilder}
     */
    ordering(ordering) {
      this.column.ordering = ordering;
      return this;
    }

    /**
     *
     * @param [multilanguage=true] {boolean}
     * @returns {ColumnBuilder}
     */
    multilanguage(multilanguage) {
      if (multilanguage === true || typeof multilanguage === "undefined") {
        this.languageType("language");
      } else {
        this.languageType("neutral");
      }

      return this;
    }

    /**
     *
     * @param languageType {string}
     * @param [countryCodes=undefined] {Array.<string>}
     * @returns {ColumnBuilder}
     */
    languageType(languageType, countryCodes = undefined) {
      switch (languageType) {
        case "country":
          if (!_.isEmpty(languageType) && (!_.isArray(countryCodes) || _.isEmpty(countryCodes))) {
            throw new Error("if languageType 'country' argument countryCodes can't be empty", this.column);
          }

          this.column.languageType = languageType;
          this.column.countryCodes = countryCodes;
          break;
        case "language":
        case "neutral":
          this.column.languageType = languageType;
          break;
        default:
          throw new Error("invalid languageType for column", this.column);
      }

      return this;
    }

    /**
     *
     * @param [identifier=true] {boolean}
     * @returns {ColumnBuilder}
     */
    identifier(identifier) {
      this.column.identifier = (typeof identifier === "boolean" ? identifier : true);
      return this;
    }

    /**
     *
     * @param [separator=true] {boolean}
     * @returns {ColumnBuilder}
     */
    separator(separator) {
      this.column.separator = (typeof separator === "boolean" ? separator : true);
      return this;
    }

    /**
     *
     * @param [hidden=true] {boolean}
     * @returns {ColumnBuilder}
     */
    hidden(hidden) {
      this.column.hidden = (typeof hidden === "boolean" ? hidden : true);
      return this;
    }

    /**
     *
     * @param toTable {Table|number}
     * @returns {ColumnBuilder}
     */
    simpleLink(toTable) {
      this.link(toTable).singleDirection();
      return this;
    }

    /**
     *
     * @param toTable {Table|number}
     * @returns {ColumnBuilder}
     */
    link(toTable) {
      if (this.column.kind !== "link") {
        throw new Error("column " + this.column.name + " should be of type link to set 'link(...)'");
      }

      let tableId;

      if (typeof toTable === "object" && typeof toTable["tableId"] === "number") {
        tableId = toTable.tableId;
      } else if (typeof toTable === "number") {
        tableId = toTable;
      } else {
        throw new Error("parameter 'toTable' should be an Table object or a number");
      }

      this.column.toTable = tableId;
      return this;
    }

    /**
     *
     * @param groups {Array.<number>}
     * @returns {ColumnBuilder}
     */
    groups(groups) {
      if (this.column.kind !== "group") {
        throw new Error("column " + this.column.name + " should be of type 'group' to set 'groups(...)'");
      }

      if (!_.every(groups, _.isInteger)) {
        throw new Error("every value of 'groups' parameter should be a positive integer number");
      }

      this.column.groups = groups;

      return this;
    }

    /**
     *
     * @param formatPattern {string}
     * @returns {ColumnBuilder}
     */
    formatPattern(formatPattern) {
      if (this.column.kind !== "group") {
        throw new Error("column " + this.column.name + " should be of type 'group' to set 'groups(...)'");
      }

      this.column.formatPattern = formatPattern;

      return this;
    }

    /**
     *
     * @param toName {string}
     * @returns {ColumnBuilder}
     */
    toName(toName) {
      if (this.column.kind !== "link") {
        throw new Error("column " + this.column.name + " should be of type link to set 'toName(...)'");
      } else if (typeof this.column.singleDirection !== "undefined") {
        throw new Error("column " + this.column.name + " can't have 'toName(...)' and 'singleDirection()'");
      }

      this.column.toName = toName;
      return this;
    }

    /**
     *
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {ColumnBuilder}
     */
    toDisplayName(...args) {
      if (this.column.kind !== "link") {
        throw new Error("column " + this.column.name + " should be of type link to set 'toDisplayName(...)'");
      } else if (typeof this.column.singleDirection !== "undefined") {
        throw new Error("column " + this.column.name + " can't have 'toDisplayName(...)' and 'singleDirection()'");
      }

      if (!this.column.toDisplayInfos) {
        this.column.toDisplayInfos = {};
      }

      this.column.toDisplayInfos.displayName = argumentsToMultiLanguageObj(args);
      return this;
    }

    /**
     *
     * @param args {Array.<object|string>} one multi-language object or langtag-value list
     * @returns {ColumnBuilder}
     */
    toDescription(...args) {
      if (this.column.kind !== "link") {
        throw new Error("column " + this.column.name + " should be of type link to set 'toDisplayName(...)'");
      } else if (typeof this.column.singleDirection !== "undefined") {
        throw new Error("column " + this.column.name + " can't have 'toDisplayName(...)' and 'singleDirection()'");
      }

      if (!this.column.toDisplayInfos) {
        this.column.toDisplayInfos = {};
      }

      this.column.toDisplayInfos.description = argumentsToMultiLanguageObj(args);
      return this;
    }

    /**
     *
     * @param toOrdering {number|null}
     * @returns {ColumnBuilder}
     */
    toOrdering(toOrdering) {
      if (this.column.kind !== "link") {
        throw new Error("column " + this.column.name + " should be of type link to set 'toOrdering(...)'");
      } else if (typeof this.column.singleDirection !== "undefined") {
        throw new Error("column " + this.column.name + " can't have 'toOrdering(...)' and 'singleDirection()'");
      } else if (!_.isNumber(toOrdering) && toOrdering !== null) {
        throw new Error("toOrdering needs to be called with a number or null", this.column);
      }

      this.column.toOrdering = toOrdering;

      return this;
    }

    /**
     *
     * @returns {ColumnBuilder}
     */
    singleDirection() {
      if (this.column.kind !== "link") {
        throw new Error("column " + this.column.name + " should be of type link to set 'singleDirection()'");
      } else if (typeof this.column.toName !== "undefined") {
        throw new Error("column " + this.column.name + " can't have 'singleDirection()' and 'toName(...)'");
      }

      this.column.singleDirection = true;
      return this;
    }

    build() {
      if (typeof this.column.name !== "string" || typeof this.column.kind !== "string") {
        throw new Error("at least 'name' (" + this.column.name + ") and 'kind' (" + this.column.kind + ") must be defined");
      }

      return this.column;
    }
  }

  /**
   * @typedef {{cardinality: {from: number, to: number}}} ConstraintCardinality
   */

  /**
   * @typedef {{deleteCascade: boolean}} ConstraintDeleteCascade
   */

  /**
   *
   */
  class ConstraintBuilder {
    /**
     *
     * @returns {ConstraintCardinality}
     */
    static cardinalityOneToOne() {
      return ConstraintBuilder.cardinality(1, 1);
    }

    /**
     *
     * @returns {ConstraintCardinality}
     */
    static cardinalityOneToMany() {
      return ConstraintBuilder.cardinality(1, 0);
    }

    /**
     *
     * @returns {ConstraintCardinality}
     */
    static cardinalityManyToOne() {
      return ConstraintBuilder.cardinality(0, 1);
    }

    /**
     *
     * @param from {number}
     * @param to {number}
     * @returns {ConstraintCardinality}
     */
    static cardinality(from, to) {
      return {
        cardinality: {
          from,
          to
        }
      };
    }

    /**
     *
     * @param deleteCascade {boolean}
     * @returns {ConstraintDeleteCascade}
     */
    static deleteCascade(deleteCascade) {
      return {
        deleteCascade: _.isBoolean(deleteCascade) ? deleteCascade : true
      };
    }
  }

  return {
    api: tableaux,

    Table: Table,
    Tables: Tables,
    TableBuilder: TableBuilder,
    ColumnBuilder: ColumnBuilder,
    ConstraintBuilder: ConstraintBuilder,
    StaticHelpers: StaticHelpers
  };
}

module.exports = grudStructorizer;
