"use strict";

const _ = require("lodash");

/**
 * @typedef {object} ApiOptions
 * @property cookies {object}
 */

class Api {

  /**
   *
   * @param baseUrl {string}
   * @param options {ApiOptions}
   */
  constructor(baseUrl, options) {
    if (this.constructor === Api) {
      throw new Error("Abstract class 'Api' cannot be instantiated!");
    }

    this.baseUrl = baseUrl;
    this.cookies = _.get(options, ["cookies"], {});
    this.headers = _.get(options, ["headers"], {});
  }

  _getRequestHeaders() {
    return {
      "Cookie": _.map(this.cookies, ({value}, name) => {
        return name + "=" + value || "undefined";
      }).join("; "),
      ...this.headers
    };
  }
}

module.exports = Api;
