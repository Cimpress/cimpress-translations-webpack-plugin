"use strict";

const request = require("supertest");
const assert = require("assert");

const paths = {
  DevServer: "../src/devServer"
};

let mockLanguageBlob = {
  blobId: "blobId",
  data: {}
};

let mockOtherLanguageBlob = {
  blobId: "otherBlobId",
  data: {}
};

let currentTranslations = null

let functionMocks = {
  getTranslations: jest.fn(() => currentTranslations),
  setTranslations: jest.fn()
}

class mockPluginCore {
  get translations() {
    return functionMocks.getTranslations();
  }

  set translations(languageBlobs) {
    return functionMocks.setTranslations(languageBlobs);
  }
}

const DevServer = require(paths.DevServer);
const devServer = new DevServer(new mockPluginCore(), { verbose: true });

afterEach(() => {
  Object.values(functionMocks)
    .map(v => v.mockClear());
  currentTranslations = null;
});

describe("for devServer", () => {
  describe("for /v1/update", () => {
    it("adds a new language", () => {
      currentTranslations = [mockOtherLanguageBlob];

      return request(devServer.app)
        .post("/v1/update")
        .send(mockLanguageBlob)
        .set("Content-Type", "application/json")
        .expect(200)
        .then(() => {
          let arg = functionMocks.setTranslations.mock.calls[0][0];
          assert.deepEqual(arg, [mockOtherLanguageBlob, mockLanguageBlob]);
        });
    });

    it("updates an existing language", () => {
      currentTranslations = [mockLanguageBlob, mockOtherLanguageBlob];
      let updatedLanguageBlob = {
        blobId: "blobId",
        data: {
          key: "value"
        }
      };

      return request(devServer.app)
        .post("/v1/update")
        .send(updatedLanguageBlob)
        .set("Content-Type", "application/json")
        .expect(200)
        .then(() => {
          let arg = functionMocks.setTranslations.mock.calls[0][0];
          assert.deepEqual(arg, [mockOtherLanguageBlob, updatedLanguageBlob]);
        });
    });
  });

  describe("for /livecheck", () => {
    it("returns 200", () => {
      currentTranslations = [mockLanguageBlob, mockOtherLanguageBlob];

      return request(devServer.app)
        .get("/livecheck")
        .expect(200);
    });
  });
});
