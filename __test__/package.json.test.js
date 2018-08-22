"use strict";

const assert = require("assert");
const path = require("path");

const packageMetadata = require('../package.json');

describe("for package.json", () => {
  // For AWS client configuration to work, the library must configure it as a peer dependency. This is because if a different version of the AWS SDK library is used in here and in the clients code,
  // two different instances of the AWS SDK will be created, each with different configuration. Making this a peer dependency allows the client to configure the AWS SDK directly.
  it("aws should be a peer dependency", () => {
    assert.equal(packageMetadata.peerDependencies['aws-sdk'], '*');
  });
  it("aws should not be a direct dependency", () => {
    assert.equal(packageMetadata.dependencies['aws-sdk'], null);
  });
});
