"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("lodash");
var fetch = require("node-fetch");
var request = require("sync-request");

/**
 * @typedef {object} SyncApiOptions
 * @property cookies {object}
 */

/**
 *
 */

var SyncApi = function () {

  /**
   *
   * @param baseUrl {string}
   * @param options {SyncApiOptions}
   */
  function SyncApi(baseUrl, options) {
    _classCallCheck(this, SyncApi);

    this.baseUrl = baseUrl;
    this.cookies = _.get(options, ["cookies"], {});
    this.headers = _.get(options, ["headers"], {});
  }

  _createClass(SyncApi, [{
    key: "_getRequestHeaders",
    value: function _getRequestHeaders() {
      return _extends({
        "Cookie": _.map(this.cookies, function (_ref, name) {
          var value = _ref.value;

          return name + "=" + value || "undefined";
        }).join("; ")
      }, this.headers);
    }

    /**
     *
     * @param method {string}
     * @param url {string}
     * @param [json] {object}
     * @param [nonce] {string}
     */

  }, {
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
     * @param method {string}
     * @param url {string}
     * @param [json] {object}
     * @param [nonce] {string}
     */

  }, {
    key: "doAsyncCall",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(method, url, json, nonce) {
        var fullUrl, options, response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                fullUrl = nonce ? this.baseUrl + url + "?" + new URLSearchParams({ nonce: nonce }) : this.baseUrl + url;
                options = {
                  method: method,
                  headers: this._getRequestHeaders(),
                  body: json ? JSON.stringify(json) : undefined
                };
                _context.next = 4;
                return fetch(fullUrl, options);

              case 4:
                response = _context.sent;
                return _context.abrupt("return", response.json());

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function doAsyncCall(_x, _x2, _x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return doAsyncCall;
    }()

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
}();

module.exports = SyncApi;