"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("lodash");

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

function tableauxStructure(baseUrl) {
  var tableaux = require("./syncApi")(baseUrl);

  var Tables = function () {
    function Tables() {
      _classCallCheck(this, Tables);

      this.tables = [];
    }

    _createClass(Tables, [{
      key: "fetch",
      value: function fetch() {
        Object.assign(this, tableaux.doCall("GET", "/tables"));
        return this;
      }
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

  var Table = function () {
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

    _createClass(Table, [{
      key: "fetch",
      value: function fetch(includeRows) {
        Object.assign(this, tableaux.fetchTable(this.tableId, includeRows));
        return this;
      }
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
      key: "createRowByObj",
      value: function createRowByObj(columnNameToValueObject) {
        if (!this.columns) {
          throw new Error("table needs to be fetched first, columns should be defined");
        }

        var self = this;

        var columnIdToValueArray = _.map(columnNameToValueObject, function (value, key) {
          var column = _.find(self.columns, ["name", key]);

          if (!column) {
            throw new Error("column '" + key + "' is not defined in table '" + this.name + "'");
          }

          return [column.id, value];
        });

        var columnsIds = _.map(columnIdToValueArray, _.first);
        var values = _.map(columnIdToValueArray, _.last);

        return this.createRows([values], columnsIds)[0];
      }
    }, {
      key: "createRow",
      value: function createRow() {
        // convert arguments to array and
        // hand it over to createRows with just one row
        return this.createRows([_.toArray(arguments)])[0];
      }
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
    }]);

    return Table;
  }();

  var TableBuilder = function () {
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

    _createClass(TableBuilder, [{
      key: "displayName",
      value: function displayName() {
        this._displayName = argumentsToMultiLanguageObj(arguments);
        return this;
      }
    }, {
      key: "hidden",
      value: function hidden(_hidden) {
        this._hidden = typeof _hidden === "boolean" ? _hidden : true;
        return this;
      }
    }, {
      key: "group",
      value: function group(groupId) {
        if (typeof groupId !== "number") {
          throw new Error("groupId should be a int");
        }

        this._groupId = groupId;
        return this;
      }
    }, {
      key: "create",
      value: function create() {
        var tableId = tableaux.createTable(this.name, this._hidden, this._displayName, this.type, this._groupId).id;

        return new Table(tableId, this.name);
      }
    }]);

    return TableBuilder;
  }();

  var ColumnBuilder = function () {
    function ColumnBuilder(name, kind) {
      _classCallCheck(this, ColumnBuilder);

      this.column = {
        "name": name,
        "kind": kind
      };
    }

    _createClass(ColumnBuilder, [{
      key: "addConstraint",
      value: function addConstraint(constraint) {
        _.merge(this.column, {
          constraint: constraint
        });

        return this;
      }
    }, {
      key: "displayName",
      value: function displayName() {
        this.column.displayName = argumentsToMultiLanguageObj(arguments);
        return this;
      }
    }, {
      key: "description",
      value: function description() {
        this.column.description = argumentsToMultiLanguageObj(arguments);
        return this;
      }
    }, {
      key: "ordering",
      value: function ordering(_ordering) {
        this.column.ordering = _ordering;
        return this;
      }
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
    }, {
      key: "languageType",
      value: function languageType(_languageType, countryCodes) {
        switch (_languageType) {
          case "country":
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
    }, {
      key: "identifier",
      value: function identifier(_identifier) {
        this.column.identifier = typeof _identifier === "boolean" ? _identifier : true;
        return this;
      }
    }, {
      key: "simpleLink",
      value: function simpleLink(toTable) {
        this.link(toTable).singleDirection();
        return this;
      }
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

        this.column.toDisplayInfos.displayName = argumentsToMultiLanguageObj(arguments);
        return this;
      }
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

        this.column.toDisplayInfos.description = argumentsToMultiLanguageObj(arguments);
        return this;
      }
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

  var ConstraintBuilder = function () {
    function ConstraintBuilder() {
      _classCallCheck(this, ConstraintBuilder);
    }

    _createClass(ConstraintBuilder, null, [{
      key: "cardinalityOneToOne",
      value: function cardinalityOneToOne() {
        return ConstraintBuilder.cardinality(1, 1);
      }
    }, {
      key: "cardinalityOneToMany",
      value: function cardinalityOneToMany() {
        return ConstraintBuilder.cardinality(1, 0);
      }
    }, {
      key: "cardinalityManyToOne",
      value: function cardinalityManyToOne() {
        return ConstraintBuilder.cardinality(0, 1);
      }
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
    api: {
      "resetSchema": tableaux.resetSchema,
      "createTable": tableaux.createTable,
      "createColumn": tableaux.createColumn,
      "createRow": tableaux.createRow,
      "fetchTable": tableaux.fetchTable,
      "doCall": tableaux.doCall
    },

    Table: Table,
    Tables: Tables,
    TableBuilder: TableBuilder,
    ColumnBuilder: ColumnBuilder,
    ConstraintBuilder: ConstraintBuilder
  };
}

module.exports = tableauxStructure;