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

  getAccessTokenUsingRefreshToken() {
    return new Promise((resolve, reject) => {
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
      rp(options)
        .then(parsedBody => {
          let authorization = `${parsedBody.token_type} ${parsedBody.access_token}`;
          this.authorization = authorization;
          resolve(authorization);
        })
        .catch(reject);
    });
  }

  getAuthorization() {
    return new Promise(resolve => {
      if (this.authorization) {
        return resolve(this.authorization);
      } else {
        this.getAccessTokenUsingRefreshToken().then(resolve);
      }
    });
  }
}

module.exports = Auth0Authenticator;
