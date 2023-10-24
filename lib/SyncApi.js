"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var request = require("sync-request");

var Api = require("./Api");

/**
 *
 */

var SyncApi = function (_Api) {
  _inherits(SyncApi, _Api);

  /**
   *
   * @param baseUrl {string}
   * @param options {ApiOptions}
   */
  // eslint-disable-next-line no-useless-constructor
  function SyncApi(baseUrl, options) {
    _classCallCheck(this, SyncApi);

    return _possibleConstructorReturn(this, (SyncApi.__proto__ || Object.getPrototypeOf(SyncApi)).call(this, baseUrl, options));
  }

  /**
   *
   * @param method {string}
   * @param url {string}
   * @param [json] {object}
   * @param [nonce] {string}
   */


  _createClass(SyncApi, [{
    key: "doCall",
    value: function doCall(method, url, json, nonce) {
      var fullUrl = this.baseUrl + url;

      var options = {
        headers: this._getRequestHeaders(),
        json: json,
        qs: {
          nonce: nonce
        }
      };

      var response = request(method, fullUrl, options).getBody("utf-8");

      return JSON.parse(response);
    }

    /**
     *
     * @param nonce {string}
     */

  }, {
    key: "resetSchema",
    value: function resetSchema(nonce) {
      return this.doCall("POST", "/system/reset", undefined, nonce);
    }

    /**
     *
     * @param tableId {number}
     * @param [includeRows=false] {boolean}
     */

  }, {
    key: "fetchTable",
    value: function fetchTable(tableId) {
      var includeRows = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (typeof tableId !== "number") {
        throw new Error("parameter 'tableId' should be a number");
      }

      var table = this.doCall("GET", "/tables/" + tableId);

      delete table["id"];
      delete table["status"];

      var columns = this.doCall("GET", "/tables/" + tableId + "/columns");

      delete columns["status"];

      Object.assign(table, columns);

      if (includeRows) {
        var rows = this.doCall("GET", "/tables/" + tableId + "/rows");

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

  }, {
    key: "createTable",
    value: function createTable(name, hidden, displayName, type, group) {
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

      return this.doCall("POST", "/tables", json);
    }

    /**
     *
     * @param tableId
     * @param columnObjArray
     */

  }, {
    key: "createColumns",
    value: function createColumns(tableId, columnObjArray) {
      var json = {
        "columns": columnObjArray
      };

      return this.doCall("POST", "/tables/" + tableId + "/columns", json).columns;
    }

    /**
     *
     * @param tableId
     * @param columnObject
     */

  }, {
    key: "createColumn",
    value: function createColumn(tableId, columnObject) {
      var json = {
        "columns": [columnObject]
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

  }, {
    key: "createRow",
    value: function createRow(tableId, columnIds, values) {
      return this.createRows(tableId, columnIds, [values])[0];
    }

    /**
     *
     * @param tableId
     * @param columnIds
     * @param rows
     */

  }, {
    key: "createRows",
    value: function createRows(tableId, columnIds, rows) {
      var json = {
        "columns": columnIds.map(function (columnId) {
          return { "id": columnId };
        }),
        "rows": rows.map(function (rowValues) {
          return { "values": rowValues };
        })
      };

      var result = this.doCall("POST", "/tables/" + tableId + "/rows", json);

      return result.rows.map(function (row) {
        return row.id;
      });
    }
  }]);

  return SyncApi;
}(Api);

module.exports = SyncApi;