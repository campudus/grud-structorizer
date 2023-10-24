"use strict";

const fetch = require("node-fetch");

const Api = require("./Api");

/**
 *
 */
class AsyncApi extends Api {

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
    const fullUrl = nonce
      ? this.baseUrl + url + "?" + new URLSearchParams({nonce})
      : this.baseUrl + url;

    const options = {
      method: method,
      headers: this._getRequestHeaders(),
      body: json ? JSON.stringify(json) : undefined
    };

    const response = await fetch(fullUrl, options);

    return response.json();
  }
}

module.exports = AsyncApi;
