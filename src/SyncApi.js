"use strict";

const request = require("sync-request");

const Api = require("./Api");

/**
 *
 */
class SyncApi extends Api {

  /**
   *
   * @param baseUrl {string}
   * @param options {ApiOptions}
   */
  // eslint-disable-next-line no-useless-constructor
  constructor(baseUrl, options) {
    super(baseUrl, options);
  }

  /**
   *
   * @param method {string}
   * @param url {string}
   * @param [json] {object}
   * @param [nonce] {string}
   */
  doCall(method, url, json, nonce) {
    const fullUrl = this.baseUrl + url;

    const options = {
      headers: this._getRequestHeaders(),
      json: json,
      qs: {
        nonce: nonce
      }
    };

    const response = request(method, fullUrl, options).getBody("utf-8");

    return JSON.parse(response);
  }

  /**
   *
   * @param nonce {string}
   */
  resetSchema(nonce) {
    return this.doCall("POST", "/system/reset", undefined, nonce);
  }

  /**
   *
   * @param tableId {number}
   * @param [includeRows=false] {boolean}
   */
  fetchTable(tableId, includeRows = false) {
    if (typeof tableId !== "number") {
      throw new Error("parameter 'tableId' should be a number");
    }

    const table = this.doCall("GET", "/tables/" + tableId);

    delete table["id"];
    delete table["status"];

    const columns = this.doCall("GET", "/tables/" + tableId + "/columns");

    delete columns["status"];

    Object.assign(table, columns);

    if (includeRows) {
      const rows = this.doCall("GET", "/tables/" + tableId + "/rows");

      delete rows["page"];
      delete rows["status"];

      Object.assign(table, rows);
    }

    return table;
  }

  /**
   *
   * @param name {string}
   * @param hidden {boolean}
   * @param displayName {object} multi-language object
   * @param type {string}
   * @param group {number}
   * @returns {object}
   */
  createTable(name, hidden, displayName, type, group) {
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

    return this.doCall("POST", "/tables", json);
  }

  /**
   *
   * @param tableId
   * @param columnObjArray
   */
  createColumns(tableId, columnObjArray) {
    const json = {
      "columns": columnObjArray
    };

    return this.doCall("POST", "/tables/" + tableId + "/columns", json).columns;
  }

  /**
   *
   * @param tableId
   * @param columnObject
   */
  createColumn(tableId, columnObject) {
    const json = {
      "columns": [
        columnObject
      ]
    };

    return this.doCall("POST", "/tables/" + tableId + "/columns", json).columns[0];
  }

  /**
   *
   * @param tableId
   * @param columnIds
   * @param values
   * @returns {*}
   */
  createRow(tableId, columnIds, values) {
    return this.createRows(tableId, columnIds, [values])[0];
  }

  /**
   *
   * @param tableId
   * @param columnIds
   * @param rows
   */
  createRows(tableId, columnIds, rows) {
    const json = {
      "columns": columnIds.map(columnId => ({"id": columnId})),
      "rows": rows.map(rowValues => ({"values": rowValues}))
    };

    const result = this.doCall("POST", "/tables/" + tableId + "/rows", json);

    return result.rows.map(row => row.id);
  }
}

module.exports = SyncApi;
