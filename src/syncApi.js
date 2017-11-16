"use strict";

const request = require("sync-request");

function tableauxApi(baseUrl) {

  function doCall(method, url, json) {
    const option = json ? {json: json} : null;
    const response = request(method, baseUrl + url, option).getBody("utf-8");
    return JSON.parse(response);
  }

  function resetSchema(nonce) {
    const json = {
      qs: {
        nonce: nonce
      }
    };
    const response = request("POST", baseUrl + "/system/reset", json).getBody("utf-8");
    return JSON.parse(response);
  }

  function fetchTable(tableId, includeRows) {
    if (typeof tableId !== "number") {
      throw new Error("parameter 'tableId' should be a number");
    }

    const table = doCall("GET", "/tables/" + tableId);

    delete table["id"];
    delete table["status"];

    const columns = doCall("GET", "/tables/" + tableId + "/columns");

    delete columns["status"];

    Object.assign(table, columns);

    if (includeRows) {
      const rows = doCall("GET", "/tables/" + tableId + "/rows");

      delete rows["page"];
      delete rows["status"];

      Object.assign(table, rows);
    }

    return table;
  }

  function createTable(name, hidden, displayName, type, group) {
    const json = {
      "name": name,
      "hidden": (typeof hidden === "boolean" ? hidden : false)
    };

    if (displayName && typeof displayName === "object") {
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
    const json = {
      "columns": columnObjArray
    };

    return doCall("POST", "/tables/" + tableId + "/columns", json).columns;
  }

  function createColumn(tableId, columnObject) {
    const json = {
      "columns": [
        columnObject
      ]
    };

    return doCall("POST", "/tables/" + tableId + "/columns", json).columns[0];
  }

  function createRow(tableId, columnIds, values) {
    return createRows(tableId, columnIds, [values])[0];
  }

  function createRows(tableId, columnIds, rows) {
    const json = {
      "columns": columnIds.map(function (columnId) {
        return {"id": columnId};
      }),
      "rows": rows.map(function (rowValues) {
        return {"values": rowValues};
      })
    };

    const result = doCall("POST", "/tables/" + tableId + "/rows", json);

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
