"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("lodash");

/**
 * @typedef {object} ApiOptions
 * @property cookies {object}
 */

var Api = function () {

  /**
   *
   * @param baseUrl {string}
   * @param options {ApiOptions}
   */
  function Api(baseUrl, options) {
    _classCallCheck(this, Api);

    if (this.constructor === Api) {
      throw new Error("Abstract class 'Api' cannot be instantiated!");
    }

    this.baseUrl = baseUrl;
    this.cookies = _.get(options, ["cookies"], {});
    this.headers = _.get(options, ["headers"], {});
  }

  _createClass(Api, [{
    key: "_getRequestHeaders",
    value: function _getRequestHeaders() {
      return _extends({
        "Cookie": _.map(this.cookies, function (_ref, name) {
          var value = _ref.value;

          return name + "=" + value || "undefined";
        }).join("; ")
      }, this.headers);
    }
  }]);

  return Api;
}();

module.exports = Api;