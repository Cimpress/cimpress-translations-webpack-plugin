"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const winston = require("winston");

const { CimpressTranslationsClient } = require("cimpress-translations");

const LOG_HEADER = "cimpress-translations-webpack-plugin";

class PluginCore {
  constructor(options) {
    this.serviceId = options.serviceId;
    this.languages = options.languages;
    this.authorizer = options.authorizer;
    this.path = options.path;
    this.verbose = typeof options.verbose === "undefined" ? true : options.verbose;

    this.logger = winston.createLogger({
      level: this.verbose ? "info" : "error",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `[${LOG_HEADER}] ${info.level}: ${info.message}`)
      ),
      transports: [ new winston.transports.Console() ]
    });

    this.translationsClient = new CimpressTranslationsClient(null, () => this.authorizer.getAccessToken());
    this.translationsPromise = null;
  }

  get _destinationIsDirectory() {
    return !path.extname(this.path);
  }

  get translations() {
    let currentTranslationsArray = null;
    if (this._destinationIsDirectory) {
      currentTranslationsArray = fs.readdirSync(this.path)
        .map(file => ({
          blobId: path.basename(file, path.extname(file)),
          data: JSON.parse(fs.readFileSync(path.join(this.path, file)).toString())
        }));
    } else {
      currentTranslationsArray = Object.entries(JSON.parse(fs.readFileSync(this.path).toString()))
        .map(e => ({
          blobId: e[0],
          data: e[1]
        }));
    }

    return currentTranslationsArray;
  }

  set translations(languageBlobs) {
    this.logger.info("Saving translations...");
    if (this._destinationIsDirectory) {
      mkdirp.sync(this.path);

      languageBlobs.map(t => {
        fs.writeFileSync(path.join(this.path, `${t.blobId}.json`), JSON.stringify(t.data, null, 2));
      });
    } else {
      mkdirp.sync(path.dirname(this.path));

      let all = {};
      languageBlobs.map(t => {
        all[t.blobId] = t.data;
      });

      fs.writeFileSync(this.path, JSON.stringify(all, null, 2));

      this.logger.info("Saved translations.");
      return;
    }
  }

  async updateTranslationsFromService() {
    this.logger.info("Updating translations from service...");
    this.translations = await this.getTranslationsFromService();
  }

  async getTranslationsFromService() {
    let client = this.translationsClient;

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
}

module.exports = PluginCore;
