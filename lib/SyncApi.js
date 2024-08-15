"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
var request = require("sync-request");
var Api = require("./Api");

/**
 *
 */
var SyncApi = /*#__PURE__*/function (_Api) {
  /**
   *
   * @param baseUrl {string}
   * @param options {ApiOptions}
   */
  // eslint-disable-next-line no-useless-constructor
  function SyncApi(baseUrl, options) {
    _classCallCheck(this, SyncApi);
    return _callSuper(this, SyncApi, [baseUrl, options]);
  }

  /**
   *
   * @param method {string}
   * @param url {string}
   * @param [json] {object}
   * @param [nonce] {string}
   */
  _inherits(SyncApi, _Api);
  return _createClass(SyncApi, [{
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
      if (displayName && _typeof(displayName) === "object") {
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
          return {
            "id": columnId
          };
        }),
        "rows": rows.map(function (rowValues) {
          return {
            "values": rowValues
          };
        })
      };
      var result = this.doCall("POST", "/tables/" + tableId + "/rows", json);
      return result.rows.map(function (row) {
        return row.id;
      });
    }
  }]);
}(Api);
module.exports = SyncApi;