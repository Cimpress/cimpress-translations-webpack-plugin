"use strict";

const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");

const ClientIdAuthorizer = require("./clientIdAuthorizer");

class kmsClientIdAuthorizer {
  constructor(clientId, encryptedClientSecret) {
    this.clientId = clientId;
    this.encryptedClientSecret = encryptedClientSecret;
    this.KMS = new AWS.KMS();

    this.clientIdAuthorizer = null;
  }

  async init() {
    let params = { CiphertextBlob: new Buffer(this.encryptedClientSecret, "base64") };
    let data = await this.KMS.decrypt(params).promise();

    this.clientIdAuthorizer = new ClientIdAuthorizer(this.clientId, data.Plaintext.toString());
  }

  static isTokenExpired(token) {
    return ClientIdAuthorizer.isTokenExpired(token);
  }

  async getAccessToken() {
    return this.clientIdAuthorizer.getAccessToken();
  }
}

module.exports = kmsClientIdAuthorizer;
