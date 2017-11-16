"use strict";

const _ = require("lodash");

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

function tableauxStructure(baseUrl) {
  const tableaux = require("./syncApi")(baseUrl);

  class Tables {

    constructor() {
      this.tables = [];
    }

    fetch() {
      Object.assign(this, tableaux.doCall("GET", "/tables"));
      return this;
    }

    find(tableName) {
      const table = _.find(this.tables, {name: tableName});

      if (table) {
        return new Table(table.id, table.name);
      }
    }
  }

  class Table {
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

    fetch(includeRows) {
      Object.assign(this, tableaux.fetchTable(this.tableId, includeRows));
      return this;
    }

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

    createRowByObj(columnNameToValueObject) {
      if (!this.columns) {
        throw new Error("table needs to be fetched first, columns should be defined");
      }

      const self = this;

      const columnIdToValueArray = _.map(columnNameToValueObject, function (value, key) {
        const column = _.find(self.columns, ["name", key]);

        if (!column) {
          throw new Error("column '" + key + "' is not defined in table '" + this.name + "'");
        }

        return [column.id, value];
      });

      const columnsIds = _.map(columnIdToValueArray, _.first);
      const values = _.map(columnIdToValueArray, _.last);

      return this.createRows([values], columnsIds)[0];
    }

    createRow() {
      // convert arguments to array and
      // hand it over to createRows with just one row
      return this.createRows([_.toArray(arguments)])[0];
    }

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
  }

  class TableBuilder {
    constructor(name, type) {
      this.name = name;
      this._groupId = null;

      if (type === "generic" || type === "settings") {
        this.type = type;
      } else {
        throw new Error("invalid table type");
      }
    }

    displayName() {
      this._displayName = argumentsToMultiLanguageObj(arguments);
      return this;
    }

    hidden(hidden) {
      this._hidden = typeof hidden === "boolean" ? hidden : true;
      return this;
    }

    group(groupId) {
      if (typeof groupId !== "number") {
        throw new Error("groupId should be a int");
      }

      this._groupId = groupId;
      return this;
    }

    create() {
      const tableId = tableaux.createTable(this.name, this._hidden, this._displayName, this.type, this._groupId).id;

      return new Table(tableId, this.name);
    }
  }

  class ColumnBuilder {
    constructor(name, kind) {
      this.column = {
        "name": name,
        "kind": kind
      };
    }

    addConstraint(constraint) {
      _.merge(this.column, {
        constraint: constraint
      });

      return this;
    }

    displayName() {
      this.column.displayName = argumentsToMultiLanguageObj(arguments);
      return this;
    }

    description() {
      this.column.description = argumentsToMultiLanguageObj(arguments);
      return this;
    }

    ordering(ordering) {
      this.column.ordering = ordering;
      return this;
    }

    multilanguage(multilanguage) {
      if (multilanguage === true || typeof multilanguage === "undefined") {
        this.languageType("language");
      } else {
        this.languageType("neutral");
      }

      return this;
    }

    languageType(languageType, countryCodes) {
      switch (languageType) {
        case "country":
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

    identifier(identifier) {
      this.column.identifier = (typeof identifier === "boolean" ? identifier : true);
      return this;
    }

    simpleLink(toTable) {
      this.link(toTable).singleDirection();
      return this;
    }

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

    toName(toName) {
      if (this.column.kind !== "link") {
        throw new Error("column " + this.column.name + " should be of type link to set 'toName(...)'");
      } else if (typeof this.column.singleDirection !== "undefined") {
        throw new Error("column " + this.column.name + " can't have 'toName(...)' and 'singleDirection()'");
      }

      this.column.toName = toName;
      return this;
    }

    toDisplayName() {
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

    toDescription() {
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

  class ConstraintBuilder {
    static cardinalityOneToOne() {
      return ConstraintBuilder.cardinality(1, 1);
    }

    static cardinalityOneToMany() {
      return ConstraintBuilder.cardinality(1, 0);
    }

    static cardinalityManyToOne() {
      return ConstraintBuilder.cardinality(0, 1);
    }

    static cardinality(from, to) {
      return {
        cardinality: {
          from,
          to
        }
      };
    }

    static deleteCascade(deleteCascade) {
      return {
        deleteCascade: _.isBoolean(deleteCascade) ? deleteCascade : true
      };
    }
  }

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
