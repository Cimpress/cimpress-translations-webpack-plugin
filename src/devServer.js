"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const winston = require("winston");
const cors = require("cors");

const LOG_HEADER = "cimpress-translations-webpack-plugin";
const PORT_NUMBER = 28070;

class DevServer {
  constructor(pluginCore, options) {
    this.pluginCore = pluginCore;
    this.verbose = options.verbose;

    this.logger = winston.createLogger({
      level: this.verbose ? "info" : "error",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `[${LOG_HEADER}] ${info.level}: ${info.message}`)
      ),
      transports: [new winston.transports.Console()]
    });

    this.app = null;
    this.setupApp();
  }

  setupApp() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.post("/v1/update", this.update.bind(this));
    this.app.get("/livecheck", this.livecheck.bind(this));
  }

  start() {
    this.app.listen(PORT_NUMBER, () => {
      this.logger.info(`Development server ready on port ${PORT_NUMBER}`)
    });
  }

  livecheck(req, res) {
    res.status(200).end();
  }

  update(req, res) {
    try {
      let body = req.body;

      let currentTranslations = this.pluginCore.translations;
      this.pluginCore.translations = currentTranslations
        .filter(languageBlob => languageBlob.blobId !== body.blobId)
        .concat(req.body);

      res.status(200).end();
    } catch (err) {
      this.logger.error("Could not update translation.");
      console.error(err);
      res.status(500).json(err);
    }
  }
}

module.exports = DevServer;
