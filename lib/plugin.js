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

var PluginCore = require("./core");
var DevServer = require("./devServer");

var Auth0Authenticator = require("./auth0Authenticator");

var LOG_HEADER = "cimpress-translations-webpack-plugin";

var modes = {
  build: "build",
  watch: "watch"
};

var CimpressTranslationsWebpackPlugin = function () {
  function CimpressTranslationsWebpackPlugin(options) {
    (0, _classCallCheck3.default)(this, CimpressTranslationsWebpackPlugin);

    this.pluginCore = new PluginCore(options);
    this.path = options.path;

    this.logger = winston.createLogger({
      level: this.verbose ? "info" : "error",
      format: winston.format.combine(winston.format.colorize(), winston.format.printf(function (info) {
        return "[" + LOG_HEADER + "] " + info.level + ": " + info.message;
      })),
      transports: [new winston.transports.Console()]
    });

    this.buildTimeUpdatePromise = null;
    this.buildTimeUpdateComplete = false;
    this.mode = null;
    this.devServer = null;
  }

  (0, _createClass3.default)(CimpressTranslationsWebpackPlugin, [{
    key: "run",
    value: function run(mode, compiler, callback) {
      if (!this.buildTimeUpdateComplete) {
        this.buildTimeUpdatePromise = this.pluginCore.updateTranslationsFromService();
        this.mode = mode;
      }
      callback();
    }
  }, {
    key: "eventRun",
    value: function eventRun(compiler, callback) {
      return this.run(modes.build, compiler, callback);
    }
  }, {
    key: "eventRunDev",
    value: function eventRunDev(compiler, callback) {
      return this.run(modes.watch, compiler, callback);
    }
  }, {
    key: "eventDone",
    value: function eventDone() {
      if (this.mode === modes.watch && !this.devServer) {
        this.logger.info("Starting development server...");
        this.devServer = new DevServer(this.pluginCore, {
          verbose: this.verbose
        });
        this.devServer.start();
      }
    }
  }, {
    key: "matchPath",
    value: function matchPath(requestPath) {
      var expectedPathWithoutExtension = path.join(path.dirname(this.path), path.basename(this.path, path.extname(this.path)));
      return requestPath.match(expectedPathWithoutExtension) ? true : false;
    }
  }, {
    key: "eventInterceptResolve",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data, callback) {
        var requestPath;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                requestPath = path.join(data.context, data.request);

                if (!(!this.matchPath(requestPath) || this.buildTimeUpdateComplete)) {
                  _context.next = 3;
                  break;
                }

                return _context.abrupt("return", callback(null, data));

              case 3:
                _context.next = 5;
                return this.buildTimeUpdatePromise;

              case 5:
                this.buildTimeUpdateComplete = true;
                callback(null, data);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function eventInterceptResolve(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return eventInterceptResolve;
    }()
  }, {
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      compiler.plugin("run", this.eventRun.bind(this));
      compiler.plugin("watch-run", this.eventRunDev.bind(this));

      compiler.plugin("normal-module-factory", function (nmf) {
        nmf.plugin("before-resolve", _this.eventInterceptResolve.bind(_this));
      });

      compiler.plugin("done", this.eventDone.bind(this));
    }
  }]);
  return CimpressTranslationsWebpackPlugin;
}();

module.exports = CimpressTranslationsWebpackPlugin;