"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var _ = require("lodash");
var AsyncApi = require("./AsyncApi");
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
 * @typedef {object} GRUDStructorizer
 * @property api {SyncApi}
 * @property asyncApi {AsyncApi}
 * @property Table {Table}
 * @property Tables {Tables}
 * @property TableBuilder {TableBuilder}
 * @property ColumnBuilder {ColumnBuilder}
 * @property ConstraintBuilder {ConstraintBuilder}
 */

/**
 *
 *  @param baseUrl {string}
 *  @param options {object}
 *  @returns {GRUDStructorizer}
 */
function grudStructorizer(baseUrl, options) {
  var syncApi = new SyncApi(baseUrl, options);
  var asyncApi = new AsyncApi(baseUrl, options);
  var StaticHelpers = {
    getLanguages: function getLanguages() {
      return syncApi.doCall("GET", "/system/settings/langtags").value;
    },
    checkKindForLanguageConversion: function checkKindForLanguageConversion(kind) {
      var ALLOWED_TYPES = ["shorttext", "text"];
      if (!_.includes(ALLOWED_TYPES, kind)) {
        throw new Error("Column must be of kind '".concat(_.join(ALLOWED_TYPES, "' or '"), "'"));
      }
    },
    checkLanguageForLanguageConversion: function checkLanguageForLanguageConversion(languages, targetLanguage) {
      if (!_.includes(languages, targetLanguage)) {
        throw new Error("Language '".concat(targetLanguage, "' not in '/system/settings/langtags'"));
      }
    }
  };

  /**
   *
   */
  var Tables = /*#__PURE__*/function () {
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
    return _createClass(Tables, [{
      key: "fetch",
      value: function fetch() {
        Object.assign(this, syncApi.doCall("GET", "/tables"));
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
        var table = _.find(this.tables, {
          name: tableName
        });
        if (table) {
          return new Table(table.id, table.name);
        }
      }
    }]);
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
  var Table = /*#__PURE__*/function () {
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
    return _createClass(Table, [{
      key: "fetch",
      value: function fetch() {
        var includeRows = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        Object.assign(this, syncApi.fetchTable(this.tableId, includeRows));
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
        var newColumns = syncApi.createColumns(this.tableId, columnObjArray);
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
        var response = syncApi.doCall("DELETE", "/tables/" + this.tableId + "/columns/" + column.id);
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
        var newColumn = syncApi.createColumn(this.tableId, columnBuilder.build());
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
        var _this$getValuesFromCr = this.getValuesFromCreateRowByObj(columnNameToValueObject),
          columnIds = _this$getValuesFromCr.columnIds,
          values = _this$getValuesFromCr.values;
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
        return syncApi.createRows(this.tableId, columnIds, rows);
      }
    }, {
      key: "changeColumn",
      value: function changeColumn(columnId, changeObj) {
        return syncApi.doCall("POST", "/tables/" + this.tableId + "/columns/" + columnId, changeObj);
      }
    }, {
      key: "getColumn",
      value: function getColumn(columnName) {
        var column = this.findColumn(columnName);
        if (!column) {
          throw new Error("Column name '".concat(columnName, "' does not exist"));
        }
        return column;
      }
    }, {
      key: "convertColumnToMultilanguage",
      value:
      /**
       * Convenient method to change a single language column to multi language
       *
       * @param columnName {string}
       * @param pickLanguage language in which raw values should be inserted (default: "first language of
       *   '/system/settings/langtags'") {string}
       */
      function convertColumnToMultilanguage(columnName, pickLanguage) {
        var _this3 = this;
        this.fetch();
        var column = this.getColumn(columnName);
        var _$find = _.find(this.columns, {
            name: columnName
          }),
          ordering = _$find.ordering,
          kind = _$find.kind,
          identifier = _$find.identifier,
          displayName = _$find.displayName,
          description = _$find.description,
          multilanguage = _$find.multilanguage,
          maxLength = _$find.maxLength,
          minLength = _$find.minLength;
        var languages = StaticHelpers.getLanguages();
        var defaultLanguage = _.head(languages);
        StaticHelpers.checkLanguageForLanguageConversion(languages, pickLanguage || defaultLanguage);
        StaticHelpers.checkKindForLanguageConversion(kind);
        if (multilanguage) {
          throw new Error("Column is already multi language");
        }
        var columnIndex = _.findIndex(this.columns, {
          name: columnName
        });
        this.changeColumn(column.id, {
          name: columnName + "_convert_language"
        });
        this.fetch(true);
        var newColumnId = this.createColumn(new ColumnBuilder(columnName, kind).displayName(displayName).identifier(identifier).description(description).ordering(ordering).maxLength(maxLength).minLength(minLength).multilanguage(true));
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
          syncApi.doCall("PATCH", url, newValue);
          syncApi.doCall("POST", "".concat(url, "/annotations"), {
            langtags: languages,
            type: "flag",
            value: "needs_translation"
          });
        });
        syncApi.doCall("DELETE", "/tables/" + this.tableId + "/columns/" + column.id);
      }
    }, {
      key: "convertColumnToSinglelanguage",
      value:
      /**
       * Convenient method to change a multi language column to single language
       * @param columnName {string}
       * @param pickLanguage language from which values are taken as new values (default: first language of
       *   '/system/settings/langtags') {string}
       */
      function convertColumnToSinglelanguage(columnName, pickLanguage) {
        var _this4 = this;
        this.fetch();
        var column = this.getColumn(columnName);
        var _$find2 = _.find(this.columns, {
            name: columnName
          }),
          ordering = _$find2.ordering,
          kind = _$find2.kind,
          identifier = _$find2.identifier,
          displayName = _$find2.displayName,
          description = _$find2.description,
          multilanguage = _$find2.multilanguage,
          maxLength = _$find2.maxLength,
          minLength = _$find2.minLength;
        var languages = StaticHelpers.getLanguages();
        var defaultLanguage = _.head(languages);
        StaticHelpers.checkLanguageForLanguageConversion(languages, pickLanguage || defaultLanguage);
        StaticHelpers.checkKindForLanguageConversion(kind);
        if (!multilanguage) {
          throw new Error("Column is already single language");
        }
        var columnIndex = _.findIndex(this.columns, {
          name: columnName
        });
        this.changeColumn(column.id, {
          name: columnName + "_convert_language"
        });
        this.fetch(true);
        var newColumnId = this.createColumn(new ColumnBuilder(columnName, kind).displayName(displayName).identifier(identifier).description(description).ordering(ordering).maxLength(maxLength).minLength(minLength).multilanguage(false));
        _.forEach(this.rows, function (row) {
          var rowId = row.id,
            values = row.values,
            annotations = row.annotations;
          var newValue = _.get(values[columnIndex], pickLanguage || defaultLanguage);
          var url = "/tables/" + _this4.tableId + "/columns/" + newColumnId + "/rows/" + rowId;
          if (!newValue) {
            return;
          }
          syncApi.doCall("PATCH", url, {
            value: newValue
          });
          if (_.includes(annotations, columnIndex)) {
            // there schould be not more than one translation flag per cell
            var langAnnotation = _.head(_.filter(annotations[columnIndex], {
              "value": "needs_translation"
            }));
            if (langAnnotation) {
              syncApi.doCall("DELETE", "".concat(url, "/annotations/").concat(langAnnotation.uuid));
            }
          }
        });
        syncApi.doCall("DELETE", "/tables/" + this.tableId + "/columns/" + column.id);
      }
    }]);
  }();
  /**
   *
   */
  var TableBuilder = /*#__PURE__*/function () {
    /**
     *
     * @param name {string}
     * @param type {("generic"|"settings")}
     */
    function TableBuilder(name, type) {
      _classCallCheck(this, TableBuilder);
      var ALLOWED_TYPES = ["generic", "settings", "taxonomy"];
      this.name = name;
      this._groupId = null;
      if (ALLOWED_TYPES.includes(type)) {
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
    return _createClass(TableBuilder, [{
      key: "displayName",
      value: function displayName() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
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
        var tableId = syncApi.createTable(this.name, this._hidden, this._displayName, this.type, this._groupId).id;
        return new Table(tableId, this.name);
      }
    }]);
  }();
  /**
   *
   */
  var ColumnBuilder = /*#__PURE__*/function () {
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
    return _createClass(ColumnBuilder, [{
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
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
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
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
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
       * @param [hidden=true] {boolean}
       * @returns {ColumnBuilder}
       */
    }, {
      key: "hidden",
      value: function hidden(_hidden2) {
        this.column.hidden = typeof _hidden2 === "boolean" ? _hidden2 : true;
        return this;
      }

      /**
       *
       * @param maxLength {number}
       * @returns {ColumnBuilder}
       */
    }, {
      key: "maxLength",
      value: function maxLength(length) {
        this.column.maxLength = length;
        return this;
      }

      /**
       *
       * @param minLength {number}
       * @returns {ColumnBuilder}
       */
    }, {
      key: "minLength",
      value: function minLength(length) {
        this.column.minLength = length;
        return this;
      }

      /**
       *
       * @param decimalDigits {number}
       * @returns {ColumnBuilder}
       */
    }, {
      key: "decimalDigits",
      value: function decimalDigits(_decimalDigits) {
        if (this.column.kind !== "numeric") {
          throw new Error("column " + this.column.name + " should be of type numeric to set 'decimalDigits(...)'");
        }
        if (!_.isInteger(_decimalDigits) || _decimalDigits < 0) {
          throw new Error("parameter 'decimalDigits' should be a positive integer number");
        }
        this.column.decimalDigits = _decimalDigits;
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
        var tableId;
        if (_typeof(toTable) === "object" && typeof toTable["tableId"] === "number") {
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
       * @param showMemberColumns {boolean}
       * @returns {ColumnBuilder}
       */
    }, {
      key: "showMemberColumns",
      value: function showMemberColumns(_showMemberColumns) {
        if (this.column.kind !== "group") {
          throw new Error("column " + this.column.name + " should be of type 'group' to set 'showMemberColumns(...)'");
        }
        this.column.showMemberColumns = _.isBoolean(_showMemberColumns) ? _showMemberColumns : true;
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
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
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
        for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
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
  }();
  /**
   * @typedef {{cardinality: {from: number, to: number}}} ConstraintCardinality
   */
  /**
   * @typedef {{deleteCascade: boolean}} ConstraintDeleteCascade
   */
  /**
   * @typedef {{archiveCascade: boolean}} ConstraintArchiveCascade
   */
  /**
   * @typedef {{finalCascade: boolean}} ConstraintFinalCascade
   */
  /**
   *
   */
  var ConstraintBuilder = /*#__PURE__*/function () {
    function ConstraintBuilder() {
      _classCallCheck(this, ConstraintBuilder);
    }
    return _createClass(ConstraintBuilder, null, [{
      key: "cardinalityOneToOne",
      value:
      /**
       *
       * @returns {ConstraintCardinality}
       */
      function cardinalityOneToOne() {
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

      /**
       *
       * @param archiveCascade {boolean}
       * @returns {ConstraintArchiveCascade}
       */
    }, {
      key: "archiveCascade",
      value: function archiveCascade(_archiveCascade) {
        return {
          archiveCascade: _.isBoolean(_archiveCascade) ? _archiveCascade : true
        };
      }

      /**
       *
       * @param finalCascade {boolean}
       * @returns {ConstraintFinalCascade}
       */
    }, {
      key: "finalCascade",
      value: function finalCascade(_finalCascade) {
        return {
          finalCascade: _.isBoolean(_finalCascade) ? _finalCascade : true
        };
      }
    }]);
  }();
  return {
    api: syncApi,
    asyncApi: asyncApi,
    Table: Table,
    Tables: Tables,
    TableBuilder: TableBuilder,
    ColumnBuilder: ColumnBuilder,
    ConstraintBuilder: ConstraintBuilder,
    StaticHelpers: StaticHelpers
  };
}
module.exports = grudStructorizer;