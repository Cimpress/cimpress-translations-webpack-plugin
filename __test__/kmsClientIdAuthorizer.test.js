"use strict";

const assert = require("assert");
const proxyquire = require("proxyquire");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");

const paths = {
  kmsClientIdAuthorizer: "../src/kmsClientIdAuthorizer"
};

const spies = {
  kmsDecrypt: sinon.spy(),
  authorize: sinon.spy()
};

const mockAws = {
  AWS: {
    KMS: function() {
      this.decrypt = spies.kmsDecrypt;
    }
  }
};

const kmsClientIdAuthorizer = proxyquire(paths.kmsClientIdAuthorizer, {
  "aws-sdk": mockAws
});

const testKmsDecryptResponse = null;
const testAuthorizationResponse = null;

beforeEach(() => {
  Object.values(spies).map(s => s.resetHistory());
});

describe("for kmsClientIdAuthorizer", () => {
  describe("for isTokenExpired()", () => {
    const authorizer = new kmsClientIdAuthorizer("abc", "def");

    it("returns false if not expired", () => {
      let token = jwt.sign({}, "test");
      assert(!kmsClientIdAuthorizer.isTokenExpired(token));

      token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      }, "test");
      assert(!kmsClientIdAuthorizer.isTokenExpired(token));
    });

    it("returns true if expired", () => {
      let token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) - (60 * 60)
      }, "test");
      assert(kmsClientIdAuthorizer.isTokenExpired(token));
    });
  });

  describe("for getAccessToken()", () => {

    let authorizer = null;
    const expectedToken = {};

    beforeEach(() => {
      authorizer = new kmsClientIdAuthorizer("abc", "def");
      authorizer._getNewAccessToken = sinon.spy();
      authorizer.authenticator = async () => expectedToken;
      authorizer.init = sinon.spy();
    });

    it("initializes the authenticator if needed", async () => {
      await authorizer.getAccessToken();
      assert(authorizer.init.called);
    });

    it("does not initialize the authenticator if not needed", async () => {
      await authorizer.getAccessToken();
      assert(!authorizer.init.called);
    });

    it("gets the token from cache if needed", async () => {
      authorizer.isTokenExpired = () => true;

      await authorizer.getAccessToken();
      assert(!authorizer._getNewAccessToken.called);
    });

    it("refreshes the token", async () => {
      authorizer.isTokenExpired = () => false;

      await authorizer.getAccessToken();
      assert(authorizer._getNewAccessToken.called);
    });
  });
});
