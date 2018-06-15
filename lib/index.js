"use strict";

var CimpressTranslationsWebpackPlugin = require("./plugin");
var KmsClientIdAuthorizer = require("./kmsClientIdAuthorizer");

CimpressTranslationsWebpackPlugin.authorizers = {
  KmsClientIdAuthorizer: KmsClientIdAuthorizer
};

module.exports = CimpressTranslationsWebpackPlugin;