"use strict";

const jwt = require("jsonwebtoken");

const Auth0Authenticator = require("./auth0Authenticator");

class clientIdAuthorizer {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.token = null;
    this.authenticator = null;
  }

  async init() {
    this.authenticator = new Auth0Authenticator("cimpress.auth0.com", this.clientId, this.clientSecret);
  }

  static isTokenExpired(token) {
    let exp = jwt.decode(token).exp;
    return exp && exp < (new Date().getTime() / 1000)
  }

  async getAccessToken() {
    if (!this.token || clientIdAuthorizer.isTokenExpired(this.token)) {
      this.token = await this._getNewAccessToken();
    }

    return this.token;
  }

  async _getNewAccessToken() {
    if (!this.authenticator) {
      await this.init();
    }

    return await this.authenticator.getAuthorization();
  }
}

module.exports = clientIdAuthorizer;
