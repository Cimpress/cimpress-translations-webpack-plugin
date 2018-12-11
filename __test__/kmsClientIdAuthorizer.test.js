"use strict";

const assert = require("assert");
const jwt = require("jsonwebtoken");

const paths = {
  kmsClientIdAuthorizer: "../src/kmsClientIdAuthorizer"
};

const functionMocks = {
  kmsDecrypt: jest.fn()
};

const mockAws = {
  KMS: function() {
    this.decrypt = functionMocks.kmsDecrypt;
  }
};

jest.mock("aws-sdk", () => mockAws);

const kmsClientIdAuthorizer = require(paths.kmsClientIdAuthorizer);

beforeEach(() => {
  Object.values(functionMocks).map(s => s.mockClear());
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
      authorizer.init = () => authorizer.clientIdAuthorizer = { getAccessToken: async () => expectedToken };
    });

    it("gets the token using underlying clientIdAuthorizer", async () => {
      let token = await authorizer.getAccessToken();
      assert.equal(token, expectedToken);
    });
  });
});
