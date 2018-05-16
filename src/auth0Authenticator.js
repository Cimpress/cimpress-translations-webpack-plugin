"use strict";
const rp = require("request-promise-native");

class Auth0Authenticator {
  constructor(domain, clientId, clientSecret) {
    this.domain = domain;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.authorization = null;
  }

  get url() {
    return `https://${this.domain}`;
  }

  async getAccessTokenUsingRefreshToken() {
    let options = {
      method: "POST",
      uri: `${this.url}/oauth/token`,
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: "https://api.cimpress.io/",
        grant_type: "client_credentials"
      },
      json: true
    };

    let parsedBody = await rp(options);
    let authorization = parsedBody.access_token;
    this.authorization = authorization;
    return authorization;
  }

  async getAuthorization() {
    if (this.authorization) {
      return this.authorization;
    }

    return await this.getAccessTokenUsingRefreshToken();
  }
}

module.exports = Auth0Authenticator;
