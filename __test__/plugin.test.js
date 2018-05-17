"use strict";

const assert = require("assert");
const path = require("path");

const paths = {
  plugin: "../src/plugin"
};

let functionMocks = {
  updateTranslationsFromService: jest.fn(() => Promise.resolve()),
  start: jest.fn()
};


const mockPluginCore = function() {
  this.updateTranslationsFromService = functionMocks.updateTranslationsFromService;
};

const mockDevServer = function() {
  this.start = functionMocks.start;
};

beforeEach(() => {
  Object.values(functionMocks)
    .map(v => v.mockClear());
});

jest.mock("../src/core", () => mockPluginCore);
jest.mock("../src/devServer", () => mockDevServer);
const CimpressTranslationsWebpackPlugin = require(paths.plugin);

let runMockWebpackBuild = (mode, plugin) => new Promise(resolve => {
  let start = null;
  
  if (mode === "build") {
    start = plugin.eventRun.bind(plugin);
  } else {
    start = plugin.eventRunDev.bind(plugin);
  }

  start(null, () => {
    let moduleData = {
      context: "/home/cimpress/plugin/",
      request: "./src/locale/file.js"
    };

    plugin.eventInterceptResolve(moduleData, () => {
      plugin.eventDone();
      resolve();
    });
  });
});

describe("for plugin", () => {
  describe("for matchPath", () => {
    it("matches if expected path is a directory", () => {
      let options = {
        path: "/home/cimpress/plugin/src/locale"
      };
      let plugin = new CimpressTranslationsWebpackPlugin(options);

      let testPaths = [
        options.path,
        path.join(options.path, "/subdirectory"),
        path.join(options.path, "/blob.json"),
        path.join(options.path, "/subdirectory/blob.json")
      ];

      testPaths
        .map(p => assert(plugin.matchPath(p)));
    });

    it("matches if expected path is a file", () => {
      let options = {
        path: "/home/cimpress/plugin/src/locale/all.json"
      };
      let plugin = new CimpressTranslationsWebpackPlugin(options);

      assert(plugin.matchPath(options.path));
    });

    it.only("does not match outside of directory", () => {
      let options = {
        path: "/home/cimpress/plugin/src/locale"
      };
      let plugin = new CimpressTranslationsWebpackPlugin(options);

      let testPaths = [
        path.join(options.path, "../"),
        path.join(options.path, "../../"),
        path.join(options.path, "../blob.json"),
        path.join(options.path, "../../blob.json")
      ];

      testPaths
        .map(p => assert(!plugin.matchPath(p)));
    });
  });

  describe("for build flow", () => {
    it("updates translations during build flow if a language file is required", async () => {
      let options = {
        path: "/home/cimpress/plugin/src/locale"
      };
      let plugin = new CimpressTranslationsWebpackPlugin(options);

      assert(!plugin.buildTimeUpdateComplete);
      await runMockWebpackBuild("build", plugin);
      assert(plugin.buildTimeUpdateComplete);
    });

    it("does not update translations during build flow if no language files are required", async () => {
      let options = {
        path: "/home/cimpress/plugin/src/otherfolder"
      };
      let plugin = new CimpressTranslationsWebpackPlugin(options);

      assert(!plugin.buildTimeUpdateComplete);
      await runMockWebpackBuild("build", plugin);
      assert(!plugin.buildTimeUpdateComplete);
    });
  });

  describe("for development flow", () => {
    it("updates translations during build flow if a language file is required", async () => {
      let options = {
        path: "/home/cimpress/plugin/src/locale"
      };
      let plugin = new CimpressTranslationsWebpackPlugin(options);

      assert(!plugin.buildTimeUpdateComplete);
      await runMockWebpackBuild("watch", plugin);
      assert(plugin.buildTimeUpdateComplete);
    });

    it("does not update translations during build flow if no language files are required", async () => {
      let options = {
        path: "/home/cimpress/plugin/src/otherfolder"
      };
      let plugin = new CimpressTranslationsWebpackPlugin(options);

      assert(!plugin.buildTimeUpdateComplete);
      await runMockWebpackBuild("watch", plugin);
      assert(!plugin.buildTimeUpdateComplete);
    });

    it("starts a development server", async () => {
      let options = {
        path: "/home/cimpress/plugin/src/otherfolder"
      };
      let plugin = new CimpressTranslationsWebpackPlugin(options);

      assert(!functionMocks.start.mock.calls.length);
      await runMockWebpackBuild("watch", plugin);
      assert(functionMocks.start.mock.calls.length);
    });
  });
});
