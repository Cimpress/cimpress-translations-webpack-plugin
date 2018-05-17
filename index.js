"use strict";

const CimpressTranslationsWebpackPlugin = require("./src/plugin");
const KmsClientIdAuthorizer = require("./src/kmsClientIdAuthorizer");

CimpressTranslationsWebpackPlugin.authorizers = {
  KmsClientIdAuthorizer
};

module.exports = CimpressTranslationsWebpackPlugin;
