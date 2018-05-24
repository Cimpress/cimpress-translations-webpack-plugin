"use strict";

const CimpressTranslationsWebpackPlugin = require("./plugin");
const KmsClientIdAuthorizer = require("./kmsClientIdAuthorizer");

CimpressTranslationsWebpackPlugin.authorizers = {
  KmsClientIdAuthorizer
};

module.exports = CimpressTranslationsWebpackPlugin;
