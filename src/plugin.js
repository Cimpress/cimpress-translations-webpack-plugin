"use strict";

const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const winston = require("winston");

const { CimpressTranslationsClient } = require("cimpress-translations");
const PluginCore = require("./core");
const DevServer = require("./devServer");

const Auth0Authenticator = require("./auth0Authenticator");

const LOG_HEADER = "cimpress-translations-webpack-plugin";

const modes = {
  build: "build",
  watch: "watch"
};

class CimpressTranslationsWebpackPlugin {
  constructor(options) {
    this.pluginCore = new PluginCore(options);
    this.path = options.path;

    this.logger = winston.createLogger({
      level: this.verbose ? "info" : "error",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => `[${LOG_HEADER}] ${info.level}: ${info.message}`)
      ),
      transports: [new winston.transports.Console()]
    });

    this.buildTimeUpdatePromise = null;
    this.buildTimeUpdateComplete = false;
    this.mode = null;
    this.devServer = null;

    this.skipDevelopmentUpdate = options.skipDevelopmentUpdate || false;
  }

  run(mode, compiler, callback) {
    if (!this.buildTimeUpdateComplete) {
      this.mode = mode;

      if (mode === modes.build || !this.skipDevelopmentUpdate) {
        this.buildTimeUpdatePromise = this.pluginCore.updateTranslationsFromService();
      }
    }
    callback();
  }

  eventRun(compiler, callback) {
    return this.run(modes.build, compiler, callback);
  }

  eventRunDev(compiler, callback) {
    return this.run(modes.watch, compiler, callback);
  }

  eventDone() {
    if (this.mode === modes.watch && !this.devServer) {
      this.logger.info("Starting development server...");
      this.devServer = new DevServer(this.pluginCore, {
        verbose: this.verbose
      });
      this.devServer.start();
    }
  }

  matchPath(requestPath) {
    let expectedPathWithoutExtension = path.join(path.dirname(this.path), path.basename(this.path, path.extname(this.path)));
    return requestPath.match(expectedPathWithoutExtension) ? true : false;
  }

  async eventInterceptResolve(data, callback) {
    let requestPath = path.join(data.context, data.request);
    if (!this.matchPath(requestPath) || this.buildTimeUpdateComplete) {
      return callback(null, data);
    }

    await this.buildTimeUpdatePromise;
    this.buildTimeUpdateComplete = true;
    callback(null, data);
  }

  apply(compiler) {
    compiler.plugin("run", this.eventRun.bind(this));
    compiler.plugin("watch-run", this.eventRunDev.bind(this));

    if (!this.skipDevelopmentUpdates) {
      compiler.plugin("normal-module-factory", (nmf) => {
        nmf.plugin("before-resolve", this.eventInterceptResolve.bind(this));
      });
    }

    compiler.plugin("done", this.eventDone.bind(this));
  }
}

module.exports = CimpressTranslationsWebpackPlugin;
