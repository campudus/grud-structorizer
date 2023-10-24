"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var fetch = require("node-fetch");

var Api = require("./Api");

/**
 *
 */

var AsyncApi = function (_Api) {
  _inherits(AsyncApi, _Api);

  /**
   *
   * @param baseUrl {string}
   * @param options {ApiOptions}
   */
  // eslint-disable-next-line no-useless-constructor
  function AsyncApi(baseUrl, options) {
    _classCallCheck(this, AsyncApi);

    return _possibleConstructorReturn(this, (AsyncApi.__proto__ || Object.getPrototypeOf(AsyncApi)).call(this, baseUrl, options));
  }

  /**
   *
   * @param method {string}
   * @param url {string}
   * @param [json] {object}
   * @param [nonce] {string}
   */


  _createClass(AsyncApi, [{
    key: "doCall",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(method, url, json, nonce) {
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

      function doCall(_x, _x2, _x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return doCall;
    }()
  }]);

  return AsyncApi;
}(Api);

module.exports = AsyncApi;