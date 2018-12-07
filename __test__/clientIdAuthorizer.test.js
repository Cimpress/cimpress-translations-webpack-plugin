"use strict";

const assert = require("assert");
const jwt = require("jsonwebtoken");

const paths = {
  clientIdAuthorizer: "../src/clientIdAuthorizer"
};

const functionMocks = {
  authorize: jest.fn()
};

const clientIdAuthorizer = require(paths.clientIdAuthorizer);

beforeEach(() => {
  Object.values(functionMocks).map(s => s.mockClear());
});

describe("for clientIdAuthorizer", () => {
  describe("for isTokenExpired()", () => {
    const authorizer = new clientIdAuthorizer("abc", "def");

    it("returns false if not expired", () => {
      let token = jwt.sign({}, "test");
      assert(!clientIdAuthorizer.isTokenExpired(token));

      token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60)
      }, "test");
      assert(!clientIdAuthorizer.isTokenExpired(token));
    });

    it("returns true if expired", () => {
      let token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) - (60 * 60)
      }, "test");
      assert(clientIdAuthorizer.isTokenExpired(token));
    });
  });

  describe("for getAccessToken()", () => {
    let authorizer = null;
    const expectedToken = {};

    beforeEach(() => {
      authorizer = new clientIdAuthorizer("abc", "def");
      authorizer._getNewAccessToken = jest.fn();
      authorizer.authenticator = async () => expectedToken;
      authorizer.init = jest.fn();
    });

    it("gets the token from cache if needed", async () => {
      authorizer.token = expectedToken;
      clientIdAuthorizer.isTokenExpired = () => false;

      await authorizer.getAccessToken();
      assert(!authorizer._getNewAccessToken.mock.calls.length);
    });

    it("refreshes the token", async () => {
      authorizer.token = expectedToken;
      clientIdAuthorizer.isTokenExpired = () => true;

      await authorizer.getAccessToken();
      assert(authorizer._getNewAccessToken.mock.calls.length);
    });
  });
});
