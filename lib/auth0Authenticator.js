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

var rp = require("request-promise-native");

var Auth0Authenticator = function () {
  function Auth0Authenticator(domain, clientId, clientSecret) {
    (0, _classCallCheck3.default)(this, Auth0Authenticator);

    this.domain = domain;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.authorization = null;
  }

  (0, _createClass3.default)(Auth0Authenticator, [{
    key: "getAccessTokenUsingRefreshToken",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var options, parsedBody, authorization;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                options = {
                  method: "POST",
                  uri: this.url + "/oauth/token",
                  body: {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    audience: "https://api.cimpress.io/",
                    grant_type: "client_credentials"
                  },
                  json: true
                };
                _context.next = 3;
                return rp(options);

              case 3:
                parsedBody = _context.sent;
                authorization = parsedBody.access_token;

                this.authorization = authorization;
                return _context.abrupt("return", authorization);

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAccessTokenUsingRefreshToken() {
        return _ref.apply(this, arguments);
      }

      return getAccessTokenUsingRefreshToken;
    }()
  }, {
    key: "getAuthorization",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!this.authorization) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return", this.authorization);

              case 2:
                _context2.next = 4;
                return this.getAccessTokenUsingRefreshToken();

              case 4:
                return _context2.abrupt("return", _context2.sent);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getAuthorization() {
        return _ref2.apply(this, arguments);
      }

      return getAuthorization;
    }()
  }, {
    key: "url",
    get: function get() {
      return "https://" + this.domain;
    }
  }]);
  return Auth0Authenticator;
}();

module.exports = Auth0Authenticator;