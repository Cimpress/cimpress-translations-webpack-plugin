"use strict";

const assert = require("assert");

const paths = {
  core: "../src/core"
};

let mockLanguageBlob = {
  blobId: "blobId",
  data: {}
};

let mockFs = {
  readdirSync: jest.fn(() => [ "blobId.json", "blobId.json", "blobId.json" ]),
  readFileSync: jest.fn(() => Buffer.from(JSON.stringify(mockFileContents))),
  writeFileSync: jest.fn(() => {})
};
jest.mock("fs", () => mockFs);

let mockCimpressTranslationsClient = {
  describeService: jest.fn(async (id) => ({
    serviceId: id,
    languages: [ mockLanguageBlob ]
  })),
  getLanguageBlob: jest.fn(async (id, blobId) => mockLanguageBlob)
};
jest.mock("cimpress-translations", () => ({
  CimpressTranslationsClient: function() {
    return mockCimpressTranslationsClient;
  }
}));

jest.mock("mkdirp", () => ({
  sync: () => {}
}));

let mockFileContents = null;

beforeEach(() => {
  Object.values(mockFs)
    .concat(Object.values(mockCimpressTranslationsClient))
    .map(v => v.mockClear());
});

const PluginCore = require(paths.core);

describe("for PluginCore", () => {
  describe("for getter/setter translations()", () => {
    it("reads from and writes to a file", () => {
      let options = {
        path: "./all.json"
      };

      let core = new PluginCore(options);
      mockFileContents = {
        blobId: {}
      };

      let read = core.translations;
      assert.deepEqual(read, [mockLanguageBlob]);
    });

    it("reads from a directory", () => {
      let options = {
        path: "./"
      };

      let core = new PluginCore(options);
      mockFileContents = mockLanguageBlob.data;

      let read = core.translations;
      assert.deepEqual(read, [mockLanguageBlob, mockLanguageBlob, mockLanguageBlob]);
    });

    it("writes to a file", () => {
      let options = {
        path: "./all.json"
      };

      let core = new PluginCore(options);
      core.translations = [mockLanguageBlob];
      assert.deepEqual(JSON.parse(mockFs.writeFileSync.mock.calls[0][1]), { blobId: {} });
    });

    it("writes to a directory", () => {
      let options = {
        path: "./"
      };

      let core = new PluginCore(options);
      core.translations = [mockLanguageBlob, mockLanguageBlob, mockLanguageBlob];
      mockFs.writeFileSync.mock.calls
        .map(call => assert.deepEqual(JSON.parse(call[1]), mockLanguageBlob.data));
    });
  });

  describe("for getter _destinationIsDirectory()", () => {
    it("returns true if a directory", () => {
      let core = new PluginCore({path: "./"});
      assert(core._destinationIsDirectory);
    });

    it("returns false if a directory", () => {
      let core = new PluginCore({path: __filename});
      assert(!core._destinationIsDirectory);
    });
  });

  describe("for getTranslationsFromService()", () => {
    it("looks up available languages if not present", async () => {
      let options = {
        serviceId: 123,
        verbose: false
      };

      let core = new PluginCore(options);
      let languageBlobs = await core.getTranslationsFromService();
      assert(mockCimpressTranslationsClient.describeService.mock.calls.length);
      assert(languageBlobs.length);
      languageBlobs.map(b => {
        assert(b.blobId);
        assert(b.data);
      });
    });

    it("if list of languages is given, returns a list of language blobs without first looking them up", async () => {
      let options = {
        serviceId: 123,
        languages: ["blobId"],
        verbose: false
      };

      let core = new PluginCore(options);
      let languageBlobs = await core.getTranslationsFromService();
      assert(!mockCimpressTranslationsClient.describeService.mock.calls.length);
      assert(languageBlobs.length);
      languageBlobs.map(b => {
        assert(b.blobId);
        assert(b.data);
      });
    });
  });
});
