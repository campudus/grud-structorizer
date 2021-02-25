"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("lodash");
var SyncApi = require("./SyncApi");

function argumentsToMultiLanguageObj(argsObj) {
  var args = _.toArray(argsObj);
  var langtagRegex = /[a-z]{2,3}[-_][A-Z]{2,3}|[a-z]{2,3}/;

  var obj = {};

  if (args.length === 1 && _.isPlainObject(args[0])) {
    var valid = _.every(_.keys(args[0]), function (key) {
      return langtagRegex.test(key);
    });

    if (valid) {
      obj = args[0];
    } else {
      throw new Error("arguments must be either key/value list (e.g. de-DE, Tabelle, en-GB, table) or a plain object");
    }
  } else if (_.isArray(args) && args.length % 2 === 0) {
    var object = {};

    for (var i = 0; i < args.length; i += 2) {
      var langtag = args[i];
      var value = args[i + 1];

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

  var tableaux = new SyncApi(baseUrl, options);

  var StaticHelpers = {
    getLanguages: function getLanguages() {
      return tableaux.doCall("GET", "/system/settings/langtags").value;
    },

    checkKindForLanguageConversion: function checkKindForLanguageConversion(kind) {
      var ALLOWED_TYPES = ["shorttext", "text"];

      if (!_.includes(ALLOWED_TYPES, kind)) {
        throw new Error("Column must be of kind '" + _.join(ALLOWED_TYPES, "' or '") + "'");
      }
    },

    checkLanguageForLanguageConversion: function checkLanguageForLanguageConversion(languages, targetLanguage) {
      if (!_.includes(languages, targetLanguage)) {
        throw new Error("Language '" + targetLanguage + "' not in '/system/settings/langtags'");
      }
    }
  };

  /**
   *
   */

  var Tables = function () {

    /**
     *
     */
    function Tables() {
      _classCallCheck(this, Tables);

      this.tables = [];
    }

    /**
     * Fetches all tables
     *
     * @returns {Tables}
     */


    _createClass(Tables, [{
      key: "fetch",
      value: function fetch() {
        Object.assign(this, tableaux.doCall("GET", "/tables"));
        return this;
      }

      /**
       * Searches for a specific table. Fetch tables first
       *
       * @param tableName {string}
       * @returns {Table}
       */

    }, {
      key: "find",
      value: function find(tableName) {
        var table = _.find(this.tables, { name: tableName });

        if (table) {
          return new Table(table.id, table.name);
        }
      }
    }]);

    return Tables;
  }();

  /**
   * @typedef {object} Column
   * @property id {number}
   * @property name {string}
   * @property kind {string}
   */

  /**
   *
   */


  var Table = function () {
    /**
     *
     * @param tableId {number}
     * @param tableName {string}
     */
    function Table(tableId, tableName) {
      _classCallCheck(this, Table);

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


    _createClass(Table, [{
      key: "fetch",
      value: function fetch() {
        var includeRows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

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

    }, {
      key: "getRows",
      value: function getRows() {
        var _this = this;

        if (!this.columns || !this.rows) {
          throw new Error("Fetch table and rows first");
        }
        return _.map(this.rows, function (row) {
          var obj = _.zipObject(_.map(_this.columns, "name"), row.values);
          obj.rowId = row.id;
          return obj;
        });
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

    }, {
      key: "getRow",
      value: function getRow(id) {
        if (!this.columns || !this.rows) {
          throw new Error("Fetch table and rows first");
        }
        if (typeof id !== "number") {
          throw new Error("Parameter 'id' should be a number");
        }

        var foundRow = _.find(this.rows, function (row) {
          return row.id === id;
        });

        if (!foundRow) {
          throw new Error("No row found for id '" + id + "'");
        }

        var obj = _.zipObject(_.map(this.columns, "name"), foundRow.values);
        obj.rowId = foundRow.id;

        return obj;
      }

      /**
       *
       * @param nameOrId {string|number}
       */

    }, {
      key: "findColumn",
      value: function findColumn(nameOrId) {
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

    }, {
      key: "createColumns",
      value: function createColumns(columnBuilderArray) {
        if (typeof this.tableId === "undefined") {
          throw new Error("table " + this.name + " should be created first");
        }

        var columnObjArray = columnBuilderArray.map(function (columnBuilder) {
          return columnBuilder.build();
        });

        var self = this;

        columnObjArray.forEach(function (columnObject) {
          self.columns.forEach(function (column) {
            if (column.name === columnObject.name) {
              throw new Error("column " + columnObject.name + " can't be created because its name " + columnObject.name + " is already used");
            }
          });
        });

        var newColumns = tableaux.createColumns(this.tableId, columnObjArray);

        newColumns.forEach(function (newColumn) {
          self.columns.push(newColumn);
        });

        return newColumns;
      }

      /**
       *
       * @param nameOrId {string|number}
       */

    }, {
      key: "deleteColumn",
      value: function deleteColumn(nameOrId) {
        var column = this.findColumn(nameOrId);

        if (!column) {
          throw new Error("No column with this name or ID found '" + nameOrId + "'");
        }

        var response = tableaux.doCall("DELETE", "/tables/" + this.tableId + "/columns/" + column.id);

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

    }, {
      key: "createColumn",
      value: function createColumn(columnBuilder) {
        if (typeof this.tableId === "undefined") {
          throw new Error("table " + this.name + " should be created first");
        }

        var columnObject = columnBuilder.build();

        this.columns.forEach(function (column) {
          if (column.name === columnObject.name) {
            throw new Error("column " + columnObject.name + " can't be created because its name " + columnObject.name + " is already used");
          }
        });

        var newColumn = tableaux.createColumn(this.tableId, columnBuilder.build());

        this.columns.push(newColumn);

        return newColumn.id;
      }
    }, {
      key: "getValuesFromCreateRowByObj",
      value: function getValuesFromCreateRowByObj(columnNameToValueObject) {
        var _this2 = this;

        if (!this.columns) {
          throw new Error("table needs to be fetched first, columns should be defined");
        }

        if (!_.isPlainObject(columnNameToValueObject)) {
          throw new Error("columnNameToValueObject should be a simple plain object");
        }

        var columnNames = _.keys(columnNameToValueObject);
        var columnIdToValueArray = columnNames.map(function (columnName) {
          var column = _.find(_this2.columns, ["name", columnName]);

          if (!column) {
            throw new Error("column '" + columnName + "' is not defined in table '" + _this2.name + "'");
          }
          return [column.id, columnNameToValueObject[columnName]];
        });

        var columnIds = _.map(columnIdToValueArray, _.first);
        var values = _.map(columnIdToValueArray, _.last);

        return {
          columnIds: columnIds,
          values: values
        };
      }

      /**
       *
       * @param columnNameToValueObject {object}
       * @returns {number} row id
       */

    }, {
      key: "createRowByObj",
      value: function createRowByObj(columnNameToValueObject) {
        var _getValuesFromCreateR = this.getValuesFromCreateRowByObj(columnNameToValueObject),
            columnIds = _getValuesFromCreateR.columnIds,
            values = _getValuesFromCreateR.values;

        return this.createRows([values], columnIds)[0];
      }

      /**
       *
       * @returns {number} row id
       */

    }, {
      key: "createRow",
      value: function createRow() {
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

    }, {
      key: "createRows",
      value: function createRows(rows, columns) {
        if (typeof this.tableId === "undefined") {
          throw new Error("table should be created first");
        }

        var firstRowValues = _.head(rows) || [];
        var sameLength = _.every(rows, function (rowValues) {
          return rowValues.length === firstRowValues.length;
        });

        if (!sameLength) {
          throw new Error("all rows need to have same values length");
        }

        // generate IDs based on rowValues length
        var columnIds = columns || _.range(1, firstRowValues.length + 1);

        return tableaux.createRows(this.tableId, columnIds, rows);
      }
    }, {
      key: "changeColumn",
      value: function changeColumn(columnId, changeObj) {
        return tableaux.doCall("POST", "/tables/" + this.tableId + "/columns/" + columnId, changeObj);
      }
    }, {
      key: "getColumn",
      value: function getColumn(columnName) {
        var column = this.findColumn(columnName);
        if (!column) {
          throw new Error("Column name '" + columnName + "' does not exist");
        }
        return column;
      }
    }, {
      key: "convertColumnToMultilanguage",

      /**
       * Convenient method to change a single language column to multi language
       *
       * @param columnName {string}
       * @param pickLanguage language in which raw values should be inserted (default: "first language of '/system/settings/langtags'") {string}
       */
      value: function convertColumnToMultilanguage(columnName, pickLanguage) {
        var _this3 = this;

        this.fetch();

        var column = this.getColumn(columnName);

        var _$find = _.find(this.columns, { name: columnName }),
            ordering = _$find.ordering,
            kind = _$find.kind,
            identifier = _$find.identifier,
            displayName = _$find.displayName,
            description = _$find.description,
            multilanguage = _$find.multilanguage;

        var languages = StaticHelpers.getLanguages();
        var defaultLanguage = _.head(languages);

        StaticHelpers.checkLanguageForLanguageConversion(languages, pickLanguage || defaultLanguage);
        StaticHelpers.checkKindForLanguageConversion(kind);

        if (multilanguage) {
          throw new Error("Column is already multi language");
        }

        var columnIndex = _.findIndex(this.columns, { name: columnName });

        this.changeColumn(column.id, { name: columnName + "_convert_language" });
        this.fetch(true);

        var newColumnId = this.createColumn(new ColumnBuilder(columnName, kind).displayName(displayName).identifier(identifier).description(description).ordering(ordering).multilanguage(true));

        _.forEach(this.rows, function (row) {
          var rowId = row.id,
              values = row.values;

          var value = values[columnIndex];
          var url = "/tables/" + _this3.tableId + "/columns/" + newColumnId + "/rows/" + rowId;

          if (!value) {
            return;
          }

          var mapValueIntoLanguage = function mapValueIntoLanguage(value, lang) {
            return {
              value: _defineProperty({}, lang, value)
            };
          };

          var newValue = mapValueIntoLanguage(value, pickLanguage || defaultLanguage);

          tableaux.doCall("PATCH", url, newValue);

          tableaux.doCall("POST", url + "/annotations", {
            langtags: languages,
            type: "flag",
            value: "needs_translation"
          });
        });

        tableaux.doCall("DELETE", "/tables/" + this.tableId + "/columns/" + column.id);
      }
    }, {
      key: "convertColumnToSinglelanguage",


      /**
       * Convenient method to change a multi language column to single language
       * @param columnName {string}
       * @param pickLanguage language from which values are taken as new values (default: first language of '/system/settings/langtags') {string}
       */
      value: function convertColumnToSinglelanguage(columnName, pickLanguage) {
        var _this4 = this;

        this.fetch();

        var column = this.getColumn(columnName);

        var _$find2 = _.find(this.columns, { name: columnName }),
            ordering = _$find2.ordering,
            kind = _$find2.kind,
            identifier = _$find2.identifier,
            displayName = _$find2.displayName,
            description = _$find2.description,
            multilanguage = _$find2.multilanguage;

        var languages = StaticHelpers.getLanguages();
        var defaultLanguage = _.head(languages);

        StaticHelpers.checkLanguageForLanguageConversion(languages, pickLanguage || defaultLanguage);
        StaticHelpers.checkKindForLanguageConversion(kind);

        if (!multilanguage) {
          throw new Error("Column is already single language");
        }

        var columnIndex = _.findIndex(this.columns, { name: columnName });

        this.changeColumn(column.id, { name: columnName + "_convert_language" });
        this.fetch(true);

        var newColumnId = this.createColumn(new ColumnBuilder(columnName, kind).displayName(displayName).identifier(identifier).description(description).ordering(ordering).multilanguage(false));

        _.forEach(this.rows, function (row) {
          var rowId = row.id,
              values = row.values,
              annotations = row.annotations;


          var newValue = _.get(values[columnIndex], pickLanguage || defaultLanguage);
          var url = "/tables/" + _this4.tableId + "/columns/" + newColumnId + "/rows/" + rowId;

          if (!newValue) {
            return;
          }

          tableaux.doCall("PATCH", url, { value: newValue });

          if (_.includes(annotations, columnIndex)) {
            // there schould be not more than one translation flag per cell
            var langAnnotation = _.head(_.filter(annotations[columnIndex], { "value": "needs_translation" }));

            if (langAnnotation) {
              tableaux.doCall("DELETE", url + "/annotations/" + langAnnotation.uuid);
            }
          }
        });

        tableaux.doCall("DELETE", "/tables/" + this.tableId + "/columns/" + column.id);
      }
    }]);

    return Table;
  }();

  /**
   *
   */


  var TableBuilder = function () {

    /**
     *
     * @param name {string}
     * @param type {("generic"|"settings")}
     */
    function TableBuilder(name, type) {
      _classCallCheck(this, TableBuilder);

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


    _createClass(TableBuilder, [{
      key: "displayName",
      value: function displayName() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        this._displayName = argumentsToMultiLanguageObj(args);
        return this;
      }

      /**
       *
       * @param [hidden=true] {boolean}
       * @returns {TableBuilder}
       */

    }, {
      key: "hidden",
      value: function hidden(_hidden) {
        this._hidden = typeof _hidden === "boolean" ? _hidden : true;
        return this;
      }

      /**
       *
       * @param groupId {number}
       * @returns {TableBuilder}
       */

    }, {
      key: "group",
      value: function group(groupId) {
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

    }, {
      key: "create",
      value: function create() {
        var tableId = tableaux.createTable(this.name, this._hidden, this._displayName, this.type, this._groupId).id;

        return new Table(tableId, this.name);
      }
    }]);

    return TableBuilder;
  }();

  /**
   *
   */


  var ColumnBuilder = function () {
    /**
     *
     * @param name {string}
     * @param kind {string}
     */
    function ColumnBuilder(name, kind) {
      _classCallCheck(this, ColumnBuilder);

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


    _createClass(ColumnBuilder, [{
      key: "addConstraint",
      value: function addConstraint(constraint) {
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

    }, {
      key: "displayName",
      value: function displayName() {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        this.column.displayName = argumentsToMultiLanguageObj(args);
        return this;
      }

      /**
       *
       * @param args {Array.<object|string>} one multi-language object or langtag-value list
       * @returns {ColumnBuilder}
       */

    }, {
      key: "description",
      value: function description() {
        for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }

        this.column.description = argumentsToMultiLanguageObj(args);
        return this;
      }

      /**
       *
       * @param ordering {number}
       * @returns {ColumnBuilder}
       */

    }, {
      key: "ordering",
      value: function ordering(_ordering) {
        this.column.ordering = _ordering;
        return this;
      }

      /**
       *
       * @param [multilanguage=true] {boolean}
       * @returns {ColumnBuilder}
       */

    }, {
      key: "multilanguage",
      value: function multilanguage(_multilanguage) {
        if (_multilanguage === true || typeof _multilanguage === "undefined") {
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

    }, {
      key: "languageType",
      value: function languageType(_languageType) {
        var countryCodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

        switch (_languageType) {
          case "country":
            if (!_.isEmpty(_languageType) && (!_.isArray(countryCodes) || _.isEmpty(countryCodes))) {
              throw new Error("if languageType 'country' argument countryCodes can't be empty", this.column);
            }

            this.column.languageType = _languageType;
            this.column.countryCodes = countryCodes;
            break;
          case "language":
          case "neutral":
            this.column.languageType = _languageType;
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

    }, {
      key: "identifier",
      value: function identifier(_identifier) {
        this.column.identifier = typeof _identifier === "boolean" ? _identifier : true;
        return this;
      }

      /**
       *
       * @param [separator=true] {boolean}
       * @returns {ColumnBuilder}
       */

    }, {
      key: "separator",
      value: function separator(_separator) {
        this.column.separator = typeof _separator === "boolean" ? _separator : true;
        return this;
      }

      /**
       *
       * @param toTable {Table|number}
       * @returns {ColumnBuilder}
       */

    }, {
      key: "simpleLink",
      value: function simpleLink(toTable) {
        this.link(toTable).singleDirection();
        return this;
      }

      /**
       *
       * @param toTable {Table|number}
       * @returns {ColumnBuilder}
       */

    }, {
      key: "link",
      value: function link(toTable) {
        if (this.column.kind !== "link") {
          throw new Error("column " + this.column.name + " should be of type link to set 'link(...)'");
        }

        var tableId = void 0;

        if ((typeof toTable === "undefined" ? "undefined" : _typeof(toTable)) === "object" && typeof toTable["tableId"] === "number") {
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

    }, {
      key: "groups",
      value: function groups(_groups) {
        if (this.column.kind !== "group") {
          throw new Error("column " + this.column.name + " should be of type 'group' to set 'groups(...)'");
        }

        if (!_.every(_groups, _.isInteger)) {
          throw new Error("every value of 'groups' parameter should be a positive integer number");
        }

        this.column.groups = _groups;

        return this;
      }

      /**
       *
       * @param formatPattern {string}
       * @returns {ColumnBuilder}
       */

    }, {
      key: "formatPattern",
      value: function formatPattern(_formatPattern) {
        if (this.column.kind !== "group") {
          throw new Error("column " + this.column.name + " should be of type 'group' to set 'groups(...)'");
        }

        this.column.formatPattern = _formatPattern;

        return this;
      }

      /**
       *
       * @param toName {string}
       * @returns {ColumnBuilder}
       */

    }, {
      key: "toName",
      value: function toName(_toName) {
        if (this.column.kind !== "link") {
          throw new Error("column " + this.column.name + " should be of type link to set 'toName(...)'");
        } else if (typeof this.column.singleDirection !== "undefined") {
          throw new Error("column " + this.column.name + " can't have 'toName(...)' and 'singleDirection()'");
        }

        this.column.toName = _toName;
        return this;
      }

      /**
       *
       * @param args {Array.<object|string>} one multi-language object or langtag-value list
       * @returns {ColumnBuilder}
       */

    }, {
      key: "toDisplayName",
      value: function toDisplayName() {
        if (this.column.kind !== "link") {
          throw new Error("column " + this.column.name + " should be of type link to set 'toDisplayName(...)'");
        } else if (typeof this.column.singleDirection !== "undefined") {
          throw new Error("column " + this.column.name + " can't have 'toDisplayName(...)' and 'singleDirection()'");
        }

        if (!this.column.toDisplayInfos) {
          this.column.toDisplayInfos = {};
        }

        for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        this.column.toDisplayInfos.displayName = argumentsToMultiLanguageObj(args);
        return this;
      }

      /**
       *
       * @param args {Array.<object|string>} one multi-language object or langtag-value list
       * @returns {ColumnBuilder}
       */

    }, {
      key: "toDescription",
      value: function toDescription() {
        if (this.column.kind !== "link") {
          throw new Error("column " + this.column.name + " should be of type link to set 'toDisplayName(...)'");
        } else if (typeof this.column.singleDirection !== "undefined") {
          throw new Error("column " + this.column.name + " can't have 'toDisplayName(...)' and 'singleDirection()'");
        }

        if (!this.column.toDisplayInfos) {
          this.column.toDisplayInfos = {};
        }

        for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          args[_key5] = arguments[_key5];
        }

        this.column.toDisplayInfos.description = argumentsToMultiLanguageObj(args);
        return this;
      }

      /**
       *
       * @param toOrdering {number|null}
       * @returns {ColumnBuilder}
       */

    }, {
      key: "toOrdering",
      value: function toOrdering(_toOrdering) {
        if (this.column.kind !== "link") {
          throw new Error("column " + this.column.name + " should be of type link to set 'toOrdering(...)'");
        } else if (typeof this.column.singleDirection !== "undefined") {
          throw new Error("column " + this.column.name + " can't have 'toOrdering(...)' and 'singleDirection()'");
        } else if (!_.isNumber(_toOrdering) && _toOrdering !== null) {
          throw new Error("toOrdering needs to be called with a number or null", this.column);
        }

        this.column.toOrdering = _toOrdering;

        return this;
      }

      /**
       *
       * @returns {ColumnBuilder}
       */

    }, {
      key: "singleDirection",
      value: function singleDirection() {
        if (this.column.kind !== "link") {
          throw new Error("column " + this.column.name + " should be of type link to set 'singleDirection()'");
        } else if (typeof this.column.toName !== "undefined") {
          throw new Error("column " + this.column.name + " can't have 'singleDirection()' and 'toName(...)'");
        }

        this.column.singleDirection = true;
        return this;
      }
    }, {
      key: "build",
      value: function build() {
        if (typeof this.column.name !== "string" || typeof this.column.kind !== "string") {
          throw new Error("at least 'name' (" + this.column.name + ") and 'kind' (" + this.column.kind + ") must be defined");
        }

        return this.column;
      }
    }]);

    return ColumnBuilder;
  }();

  /**
   * @typedef {{cardinality: {from: number, to: number}}} ConstraintCardinality
   */

  /**
   * @typedef {{deleteCascade: boolean}} ConstraintDeleteCascade
   */

  /**
   *
   */


  var ConstraintBuilder = function () {
    function ConstraintBuilder() {
      _classCallCheck(this, ConstraintBuilder);
    }

    _createClass(ConstraintBuilder, null, [{
      key: "cardinalityOneToOne",

      /**
       *
       * @returns {ConstraintCardinality}
       */
      value: function cardinalityOneToOne() {
        return ConstraintBuilder.cardinality(1, 1);
      }

      /**
       *
       * @returns {ConstraintCardinality}
       */

    }, {
      key: "cardinalityOneToMany",
      value: function cardinalityOneToMany() {
        return ConstraintBuilder.cardinality(1, 0);
      }

      /**
       *
       * @returns {ConstraintCardinality}
       */

    }, {
      key: "cardinalityManyToOne",
      value: function cardinalityManyToOne() {
        return ConstraintBuilder.cardinality(0, 1);
      }

      /**
       *
       * @param from {number}
       * @param to {number}
       * @returns {ConstraintCardinality}
       */

    }, {
      key: "cardinality",
      value: function cardinality(from, to) {
        return {
          cardinality: {
            from: from,
            to: to
          }
        };
      }

      /**
       *
       * @param deleteCascade {boolean}
       * @returns {ConstraintDeleteCascade}
       */

    }, {
      key: "deleteCascade",
      value: function deleteCascade(_deleteCascade) {
        return {
          deleteCascade: _.isBoolean(_deleteCascade) ? _deleteCascade : true
        };
      }
    }]);

    return ConstraintBuilder;
  }();

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