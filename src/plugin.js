"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

const winston = require("winston");
const { CimpressTranslationsClient } = require("cimpress-translations");
const AWS = require("aws-sdk");
const KMS = new AWS.KMS();

// const Auth0Authenticator = require("./src/auth0Authenticator");
const Auth0Authenticator = {};

const PLUGIN_NAME = "cimpress-translations-webpack-plugin";

let buildTranslationsClient = async (clientId, encryptedClientSecret) => {
  let params = { CiphertextBlob: new Buffer(encryptedClientSecret, "base64") };
  let data = await KMS.decrypt(params).promise();

  let authenticator = new Auth0Authenticator("cimpress.auth0.com", clientId, data.Plaintext.toString());

  return new CimpressTranslationsClient(null, () => authenticator.getAuthorization());
};

class CimpressTranslationsWebpackPlugin {
  constructor(options) {
    this.serviceId = options.serviceId;
    this.languages = options.languages;
    this.path = options.path;
    this.verbose = typeof options.verbose === "undefined" ? true : options.verbose;

    this.clientId = options.clientId;
    this.encryptedClientSecret = options.encryptedClientSecret;

    this.logger = winston.createLogger({
      level: this.verbose ? "info" : "error",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `[${PLUGIN_NAME}] ${info.level}: ${info.message}`)
      ),
      transports: [ new winston.transports.Console() ]
    });

    this.translationsClient = null;
    this.translationsPromise = null;

    this.complete = false;
  }

  async saveTranslations() {
    let translations = await this.translationsPromise;
    this.logger.info("Updating translations...");

    if (!path.extname(this.path)) {
      return this.saveToDirectory(translations);
    }

    this.saveToFile(translations);
  }

  saveToFile(translations) {
    mkdirp.sync(path.dirname(this.path));

    let all = {};
    translations.map(t => {
      all[t.blobId] = t.data;
    });
    fs.writeFileSync(this.path, JSON.stringify(all, null, 2));
  }

  saveToDirectory(translations) {
    mkdirp.sync(this.path);

    translations.map(t => {
      fs.writeFileSync(path.join(this.path, `${t.blobId}.json`), JSON.stringify(t.data, null, 2));
    });
  }

  async getTranslations() {
    let client = await this.getTranslationsClient();

    if (!this.languages) {
      this.logger.warn("The plugin will look up available languages. Consider setting options.languages to cut down on execution time.");
      let serviceDescription = await client.describeService(this.serviceId);
      this.languages = serviceDescription.languages
        .map(l => l.blobId);
    }

    this.logger.info("Retrieving language blobs...");
    let languageBlobPromises = this.languages
      .map(l => client.getLanguageBlob(this.serviceId, l));

    return Promise.all(languageBlobPromises)
      .then(languageBlobs => {
        this.logger.info(`Retrieved languages: ${languageBlobs.map(b => b.blobId)}`);
        return languageBlobs;
      });
  }

  async getTranslationsClient() {
    this.logger.info("Provisioning a Cimpress Translations client...");
    if (!this.translationsClient) {
      this.logger.info("Creating a new Cimpress Translations client...");
      this.translationsClient = await buildTranslationsClient(this.clientId, this.encryptedClientSecret);
    }

    return this.translationsClient;
  }

  apply(compiler) {
    let that = this;
    compiler.plugin("watch-run", function (compiler, callback) {
      that.translationsPromise = that.getTranslations();
      callback();
    });

    compiler.plugin("normal-module-factory", async function(nmf) {
      if (that.translationsPromise) {
        nmf.plugin("before-resolve", async (data, callback) => {

          let requestPath = path.join(data.context, data.request);
          if (!requestPath.match(that.path) || that.complete) {
            return callback(null, data);
          }
          console.log("Got it");

          await that.saveTranslations();
          that.complete = true;
          callback(null, data);
        });
      }
    });
  }
}

module.exports = CimpressTranslationsWebpackPlugin;
