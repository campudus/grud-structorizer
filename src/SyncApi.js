"use strict";

const request = require("sync-request");
const _ = require("lodash");

/**
 * @typedef {object} SyncApiOptions
 * @property cookies {object}
 */

/**
 *
 */
class SyncApi {

  /**
   *
   * @param baseUrl {string}
   * @param options {SyncApiOptions}
   */
  constructor(baseUrl, options) {
    this.baseUrl = baseUrl;
    this.cookies = _.get(options, ["cookies"], {});
    this.headers = _.get(options, ["headers"], {});
  }

  /**
   *
   * @param method {string}
   * @param url {string}
   * @param [json] {object}
   * @param [nonce] {string}
   */
  doCall(method, url, json, nonce) {
    const options = {
      headers: {
        "Cookie": _.map(this.cookies, (cookieObj, cookieName) => {
          return cookieName + "=" + cookieObj.value || "undefined";
        }).join("; "),
        ...this.headers
      },
      json: json,
      qs: {
        nonce: nonce
      }
    };

    const response = request(method, this.baseUrl + url, options).getBody("utf-8");
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
