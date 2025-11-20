import Api from "./Api.js";

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
  async doCall(method, url, json, nonce) {
    const fullUrl = nonce ? this.baseUrl + url + "?" + new URLSearchParams({ nonce }) : this.baseUrl + url;

    const options = {
      method: method,
      headers: this._getRequestHeaders(),
      body: json ? JSON.stringify(json) : undefined
    };

    const response = await fetch(fullUrl, options);

    return response.json();
  }

  /**
   *
   * @param nonce {string}
   */
  async resetSchema(nonce) {
    return this.doCall("POST", "/system/reset", undefined, nonce);
  }

  /**
   *
   * @param tableId {number}
   * @param [includeRows=false] {boolean}
   */
  async fetchTable(tableId, includeRows = false) {
    if (typeof tableId !== "number") {
      throw new Error("parameter 'tableId' should be a number");
    }

    const table = await this.doCall("GET", "/tables/" + tableId);

    delete table["id"];
    delete table["status"];

    const columns = await this.doCall("GET", "/tables/" + tableId + "/columns");

    delete columns["status"];

    Object.assign(table, columns);

    if (includeRows) {
      const rows = await this.doCall("GET", "/tables/" + tableId + "/rows");

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
  async createTable(name, hidden, displayName, type, group) {
    const json = {
      name: name,
      hidden: typeof hidden === "boolean" ? hidden : false
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
  async createColumns(tableId, columnObjArray) {
    const json = {
      columns: columnObjArray
    };

    return (await this.doCall("POST", "/tables/" + tableId + "/columns", json)).columns;
  }

  /**
   *
   * @param tableId
   * @param columnObject
   */
  async createColumn(tableId, columnObject) {
    const json = {
      columns: [columnObject]
    };

    return (await this.doCall("POST", "/tables/" + tableId + "/columns", json)).columns[0];
  }

  /**
   *
   * @param tableId
   * @param columnIds
   * @param values
   * @returns {*}
   */
  async createRow(tableId, columnIds, values) {
    return (await this.createRows(tableId, columnIds, [values]))[0];
  }

  /**
   *
   * @param tableId
   * @param columnIds
   * @param rows
   */
  async createRows(tableId, columnIds, rows) {
    const json = {
      columns: columnIds.map((columnId) => ({ id: columnId })),
      rows: rows.map((rowValues) => ({ values: rowValues }))
    };

    const result = await this.doCall("POST", "/tables/" + tableId + "/rows", json);

    return result.rows.map((row) => row.id);
  }
}

export default SyncApi;
