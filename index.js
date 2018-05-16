"use strict";

const CimpressTranslationsWebpackPlugin = require("./src/plugin");
const KmsClientIdAuthorizer = require("./src/kmsClientIdAuthorizer");

module.exports = {
  CimpressTranslationsWebpackPlugin,
  authorizers: { KmsClientIdAuthorizer }
};
