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

var AWS = require("aws-sdk");
var KMS = new AWS.KMS();
var jwt = require("jsonwebtoken");

var Auth0Authenticator = require("./auth0Authenticator");

var kmsClientIdAuthorizer = function () {
  function kmsClientIdAuthorizer(clientId, encryptedClientSecret) {
    (0, _classCallCheck3.default)(this, kmsClientIdAuthorizer);

    this.clientId = clientId;
    this.encryptedClientSecret = encryptedClientSecret;

    this.token = null;
    this.authenticator = null;
  }

  (0, _createClass3.default)(kmsClientIdAuthorizer, [{
    key: "init",
    value: function () {
      var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var params, data;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                params = { CiphertextBlob: new Buffer(this.encryptedClientSecret, "base64") };
                _context.next = 3;
                return KMS.decrypt(params).promise();

              case 3:
                data = _context.sent;


                this.authenticator = new Auth0Authenticator("cimpress.auth0.com", this.clientId, data.Plaintext.toString());

              case 5:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init() {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: "getAccessToken",
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(!this.token || kmsClientIdAuthorizer.isTokenExpired(this.token))) {
                  _context2.next = 4;
                  break;
                }

                _context2.next = 3;
                return this._getNewAccessToken();

              case 3:
                this.token = _context2.sent;

              case 4:
                return _context2.abrupt("return", this.token);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getAccessToken() {
        return _ref2.apply(this, arguments);
      }

      return getAccessToken;
    }()
  }, {
    key: "_getNewAccessToken",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                if (this.authenticator) {
                  _context3.next = 3;
                  break;
                }

                _context3.next = 3;
                return this.init();

              case 3:
                _context3.next = 5;
                return this.authenticator.getAuthorization();

              case 5:
                return _context3.abrupt("return", _context3.sent);

              case 6:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _getNewAccessToken() {
        return _ref3.apply(this, arguments);
      }

      return _getNewAccessToken;
    }()
  }], [{
    key: "isTokenExpired",
    value: function isTokenExpired(token) {
      var exp = jwt.decode(token).exp;
      return exp && exp < new Date().getTime() / 1000;
    }
  }]);
  return kmsClientIdAuthorizer;
}();

module.exports = kmsClientIdAuthorizer;