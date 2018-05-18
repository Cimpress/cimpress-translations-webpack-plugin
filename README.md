# cimpress-translations-webpack-client

[![npm version](https://badge.fury.io/js/cimpress-translations-webpack-client.svg)](https://badge.fury.io/js/cimpress-translations-webpack-client)

cimpress-translations-webpack-plugin is a Webpack plugin allowing for advanced integration of your software project with Cimpress' Translations service.

The plugin automatically retrieves updates your project's locale files at build time to keep your translations up to date. The newest files are readily available to commit.

A major feature of this plugin is the ability to interactively translate your application during live development. Once you've set up your application in watch mode, browse over to [Cimpress Translations](https://translations.cimpress.io) and begin editing. Any changes that you make will cause your project to automatically update. Implement HMR in your i18n module for the smoothest editing experience.

Authentication is handled by customizable plugins, some of which are ready out of the box. Examples include a plugin executing the Client Credentials Grant using secrets decrypted using KMS.

Features:
- ensures that your service's locale files always stay up to date
- installs all available languages or their predefined subset
- supports live translation edition on Cimpress Translations
- keeps each language in its own locale file or maintains a single file for all languages
- allows you to configure authentication routines to match your development environment

The plugin has been tested with webpack 3.8.1, but should also work with major version 4.

## Getting Started

Include [cimpress-translations-webpack-plugin](https://www.npmjs.com/package/cimpress-translations-webpack-plugin) in your project using npm or yarn:
```
npm install --save-dev cimpress-translations-webpack-plugin
```

In your webpack configuration, add the plugin and configure it to your liking. The example configuration below uses the Client Credentials Grant authentication flow with secrets decrypted using KMS:

```
const CimpressTranslationsWebpackPlugin = require("cimpress-translations-webpack-plugin");
const authorizers = CimpressTranslationsWebpackPlugin.authorizers; 

let plugin = new CimpressTranslationsWebpackPlugin({
  serviceId: "280c6549-0845-44d4-99c1-4f664122fcf3",
  languages: ["eng", "fra" ],
  path: path.join(__dirname, "./src/locale"),
  authorizer: new authorizers.KmsClientIdAuthorizer("my-client-id",
    "my-kms-encrypted-client-secret")
});
```

The plugin will henceforth connect to Cimpress Translations and retrieve current translation data on every build (typically `npm run-script build`).

## Plugin options

The plugin's constructor supports the following options:

##### serviceId *required*

The GUID of your service in Cimpress Translations. If you have not yet set up your service in Cimpress Translations, head there and add it first.

##### languages

A list of languages to install. This parameter is optional; when it isn't supplied, the plugin will fetch a list of all supported languages. Set this parameter to minimize execution time.

##### path *required*

The path under which any locale files will be saved. The path can either point to a directory, in which case each language will have its own locale file, or a file, in which case all locale data will be saved to a single file. The path has to be an absolute path.

##### authorizer *required*

Any object exposing a synchronous or asynchronous `getAccessToken()` method, which will be called in order to retrieve an Auth0 access token for use with Cimpress Translations.

## Built-in authorization modules

Built-in authorization modules can be found under CimpressTranslationsWebpackPlugin.authorizers.

##### kmsClientIdAuthorizer(clientId, encryptedClientSecret)

The module uses the Client Credentials Grant authentication flow to obtain a valid access token. An encrypted client secret is stored in your webpack configuration and is decrypted using AWS KMS.

## Live development

When webpack is run in watch mode, it keeps watch on all files in the dependency tree. It is possible to make edits to your local locale files directly, but not only is it slow, but your changes are also not reflected in Cimpress Translations.

The plugin offers a different approach which allows you to leverage the breadth of helper features available in Cimpress Translations. When you start your application in watch ("development") mode, the plugin sets up a small HTTP server which listens to updates coming from Cimpress Translations. This way you can see your changes in your locally developed service as you make them.

## Built With

 * [cimpress-translations](https://github.com/Cimpress/cimpress-translations) - Node.js Cimpress Translations client
 * [express](https://github.com/expressjs/express) - Fast, unopinionated, minimalist web framework

## Contributing

Have you benefited from this plugin? Have you found or fixed a bug? Would you like to see a new feature implemented? We are eager to collaborate with you on GitHub.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

 * **Igor Sowinski** <[isowinski@cimpress.com](mailto:isowinski@cimpress.com), [igor@sowinski.blue](mailto:igor@sowinski.blue)> - [GitHub](https://github.com/Igrom)

 See also the list of [contributors](https://github.com/Cimpress/cimpress-translations/graphs/contributors) who participated in this project.

## License

This project is licensed under the Apache 2.0 license - see the [LICENSE](LICENSE) file for details.
