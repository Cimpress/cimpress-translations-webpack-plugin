"use strict";

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require("express");
var bodyParser = require("body-parser");
var winston = require("winston");
var cors = require("cors");

var LOG_HEADER = "cimpress-translations-webpack-plugin";
var PORT_NUMBER = 28070;

var DevServer = function () {
  function DevServer(pluginCore, options) {
    (0, _classCallCheck3.default)(this, DevServer);

    this.pluginCore = pluginCore;
    this.verbose = options.verbose;

    this.logger = winston.createLogger({
      level: this.verbose ? "info" : "error",
      format: winston.format.combine(winston.format.colorize(), winston.format.printf(function (info) {
        return "[" + LOG_HEADER + "] " + info.level + ": " + info.message;
      })),
      transports: [new winston.transports.Console()]
    });

    this.app = null;
    this.setupApp();
  }

  (0, _createClass3.default)(DevServer, [{
    key: "setupApp",
    value: function setupApp() {
      this.app = express();
      this.app.use(bodyParser.json());
      this.app.use(cors());
      this.app.post("/v1/update", this.update.bind(this));
      this.app.get("/livecheck", this.livecheck.bind(this));
    }
  }, {
    key: "start",
    value: function start() {
      var _this = this;

      this.app.listen(PORT_NUMBER, function () {
        _this.logger.info("Development server ready on port " + PORT_NUMBER);
      });
    }
  }, {
    key: "livecheck",
    value: function livecheck(req, res) {
      res.status(200).end();
    }
  }, {
    key: "update",
    value: function update(req, res) {
      try {
        var body = req.body;

        var currentTranslations = this.pluginCore.translations;
        this.pluginCore.translations = currentTranslations.filter(function (languageBlob) {
          return languageBlob.blobId !== body.blobId;
        }).concat(req.body);

        res.status(200).end();
      } catch (err) {
        this.logger.error("Could not update translation.");
        console.error(err);
        res.status(500).json(err);
      }
    }
  }]);
  return DevServer;
}();

module.exports = DevServer;