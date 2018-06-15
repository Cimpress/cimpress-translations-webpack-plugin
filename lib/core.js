"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var winston = require("winston");

var _require = require("cimpress-translations"),
    CimpressTranslationsClient = _require.CimpressTranslationsClient;

var LOG_HEADER = "cimpress-translations-webpack-plugin";

var PluginCore = function () {
  function PluginCore(options) {
    var _this = this;

    (0, _classCallCheck3.default)(this, PluginCore);

    this.serviceId = options.serviceId;
    this.languages = options.languages;
    this.authorizer = options.authorizer;
    this.path = options.path;
    this.verbose = typeof options.verbose === "undefined" ? true : options.verbose;

    this.logger = winston.createLogger({
      level: this.verbose ? "info" : "error",
      format: winston.format.combine(winston.format.colorize(), winston.format.printf(function (info) {
        return "[" + LOG_HEADER + "] " + info.level + ": " + info.message;
      })),
      transports: [new winston.transports.Console()]
    });

    this.translationsClient = new CimpressTranslationsClient(null, function () {
      return _this.authorizer.getAccessToken();
    });
    this.translationsPromise = null;
  }

  (0, _createClass3.default)(PluginCore, [{
    key: "updateTranslationsFromService",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.logger.info("Updating translations from service...");
                _context.next = 3;
                return this.getTranslationsFromService();

              case 3:
                this.translations = _context.sent;

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function updateTranslationsFromService() {
        return _ref.apply(this, arguments);
      }

      return updateTranslationsFromService;
    }()
  }, {
    key: "getTranslationsFromService",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var _this2 = this;

        var client, serviceDescription, languageBlobPromises;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                client = this.translationsClient;

                if (this.languages) {
                  _context2.next = 7;
                  break;
                }

                this.logger.warn("The plugin will look up available languages. Consider setting options.languages to cut down on execution time.");
                _context2.next = 5;
                return client.describeService(this.serviceId);

              case 5:
                serviceDescription = _context2.sent;

                this.languages = serviceDescription.languages.map(function (l) {
                  return l.blobId;
                });

              case 7:

                this.logger.info("Retrieving language blobs...");
                languageBlobPromises = this.languages.map(function (l) {
                  return client.getLanguageBlob(_this2.serviceId, l);
                });
                return _context2.abrupt("return", Promise.all(languageBlobPromises).then(function (languageBlobs) {
                  _this2.logger.info("Retrieved languages: " + languageBlobs.map(function (b) {
                    return b.blobId;
                  }));
                  return languageBlobs;
                }));

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getTranslationsFromService() {
        return _ref2.apply(this, arguments);
      }

      return getTranslationsFromService;
    }()
  }, {
    key: "_destinationIsDirectory",
    get: function get() {
      return !path.extname(this.path);
    }
  }, {
    key: "translations",
    get: function get() {
      var _this3 = this;

      var currentTranslationsArray = null;
      if (this._destinationIsDirectory) {
        currentTranslationsArray = fs.readdirSync(this.path).map(function (file) {
          return {
            blobId: path.basename(file, path.extname(file)),
            data: JSON.parse(fs.readFileSync(path.join(_this3.path, file)).toString())
          };
        });
      } else {
        currentTranslationsArray = Object.entries(JSON.parse(fs.readFileSync(this.path).toString())).map(function (e) {
          return {
            blobId: e[0],
            data: e[1]
          };
        });
      }

      return currentTranslationsArray;
    },
    set: function set(languageBlobs) {
      var _this4 = this;

      this.logger.info("Saving translations...");
      if (this._destinationIsDirectory) {
        mkdirp.sync(this.path);

        languageBlobs.map(function (t) {
          fs.writeFileSync(path.join(_this4.path, t.blobId + ".json"), JSON.stringify(t.data, null, 2));
        });
      } else {
        mkdirp.sync(path.dirname(this.path));

        var all = {};
        languageBlobs.map(function (t) {
          all[t.blobId] = t.data;
        });
        return fs.writeFileSync(this.path, JSON.stringify(all, null, 2));
      }
    }
  }]);
  return PluginCore;
}();

module.exports = PluginCore;