"use strict";

const CimpressTranslationsWebpackPlugin = require("./plugin");
const KmsClientIdAuthorizer = require("./kmsClientIdAuthorizer");
const ClientIdAuthorizer = require("./clientIdAuthorizer");

CimpressTranslationsWebpackPlugin.authorizers = {
  ClientIdAuthorizer,
  KmsClientIdAuthorizer
};

module.exports = CimpressTranslationsWebpackPlugin;
