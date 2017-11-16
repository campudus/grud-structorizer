"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var request = require("sync-request");

function tableauxApi(baseUrl) {

  function doCall(method, url, json) {
    var option = json ? { json: json } : null;
    var response = request(method, baseUrl + url, option).getBody("utf-8");
    return JSON.parse(response);
  }

  function resetSchema(nonce) {
    var json = {
      qs: {
        nonce: nonce
      }
    };
    var response = request("POST", baseUrl + "/system/reset", json).getBody("utf-8");
    return JSON.parse(response);
  }

  function fetchTable(tableId, includeRows) {
    if (typeof tableId !== "number") {
      throw new Error("parameter 'tableId' should be a number");
    }

    var table = doCall("GET", "/tables/" + tableId);

    delete table["id"];
    delete table["status"];

    var columns = doCall("GET", "/tables/" + tableId + "/columns");

    delete columns["status"];

    Object.assign(table, columns);

    if (includeRows) {
      var rows = doCall("GET", "/tables/" + tableId + "/rows");

      delete rows["page"];
      delete rows["status"];

      Object.assign(table, rows);
    }

    return table;
  }

  function createTable(name, hidden, displayName, type, group) {
    var json = {
      "name": name,
      "hidden": typeof hidden === "boolean" ? hidden : false
    };

    if (displayName && (typeof displayName === "undefined" ? "undefined" : _typeof(displayName)) === "object") {
      json["displayName"] = displayName;
    }

    if (type && typeof type === "string") {
      json["type"] = type;
    }

    if (group && typeof group === "number") {
      json["group"] = group;
    }

    return doCall("POST", "/tables", json);
  }

  function createColumns(tableId, columnObjArray) {
    var json = {
      "columns": columnObjArray
    };

    return doCall("POST", "/tables/" + tableId + "/columns", json).columns;
  }

  function createColumn(tableId, columnObject) {
    var json = {
      "columns": [columnObject]
    };

    return doCall("POST", "/tables/" + tableId + "/columns", json).columns[0];
  }

  function createRow(tableId, columnIds, values) {
    return createRows(tableId, columnIds, [values])[0];
  }

  function createRows(tableId, columnIds, rows) {
    var json = {
      "columns": columnIds.map(function (columnId) {
        return { "id": columnId };
      }),
      "rows": rows.map(function (rowValues) {
        return { "values": rowValues };
      })
    };

    var result = doCall("POST", "/tables/" + tableId + "/rows", json);

    return result.rows.map(function (row) {
      return row.id;
    });
  }

  return {
    "resetSchema": resetSchema,
    "createTable": createTable,
    "createColumn": createColumn,
    "createColumns": createColumns,
    "createRow": createRow,
    "createRows": createRows,
    "fetchTable": fetchTable,
    "doCall": doCall
  };
}

module.exports = tableauxApi;