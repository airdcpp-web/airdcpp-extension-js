# AirDC++ extension development modules for JavaScript [![Node.js CI][build-badge]][build] [![npm package][npm-badge]][npm] [![Coverage][coverage-badge]][coverage]

>If you are new to AirDC++ extension development, you should first see the [`airdcpp-create-extension`](https://github.com/airdcpp-web/airdcpp-create-extension/) starter project for a complete introduction.


This package provides the following modules for AirDC++ module development:

### [Managed extension](#managed-extension)

Used when the extension is installed and managed by the application itself. 

### [Remote extension](#remote-extension)

Used when the extension is launched manually with node instead of being installed in the application. Remote extension is launched externally and it connects to the API by using normal credential-based authentication. 

Remote extension can be useful for development use or when the extension needs to be run on a different machine. In generic use cases it's better to use Managed extension instead.

## Running the examples

There are a few example extensions demonstrating how to use the modules in real projects. The examples are simplified and not meant for regular use but you may use the code for publishing standalone extensions with the same functionality.

Node.js version 7.7.0 or newer is required for running the examples. Please note the [hubsoft-specific remarks](https://airdcpp-web.github.io/docs/general/running-a-hub.html) as the examples may not work with all hubsofts.

1. Clone the repository
2. Install dependencies and build the project by running the following commands in the main directory

    ```
    npm install
    npm run build
    ``` 
3. Create a copy of ``examples/settings.js.example`` and rename it to ``examples/settings.js``
4. Edit ``examples/settings.js`` to contain the correct API URL and user credentials
5. Run the wanted example with `node run_example.js example_name_without_file_extension` (such as `node run_example.js airdcpp-chat-filter`). Debian/Ubuntu users may have to use the command `nodejs` instead of `node`.

Visual Studio Code users may also use the included launch configurations to run the examples.


## Extension entry structure

### Default export

`function(socket, extension)`

**Arguments**

`socket`

[airdcpp-apisocket](https://github.com/airdcpp-web/airdcpp-apisocket-js/) instance that can be used to communicate with AirDC++ Web API.

`extension` (object)

Object containing generic information about the extension.

| Name | Type | Description
| :--- | :--- | :--- |
| **name** | string | Name of the extension |
| **configPath** | string | Path that the extension should use when saving possible config files |
| **logPath** | string | Path that the extension should use when saving possible additional log files (saving of console output will be handled by the application itself) |
| **debugMode** | boolean | Whether the extension was started in a debug mode. When launching a remote extension, this is `true` unless the `NODE_ENV` environment variable has been set to `production`. |
| **server** | object | API information object with `address` (string) and `secure` (boolean) properties (e.g. for accessing the application via HTTP). |
| **onStart** | function | Called when the extension is started. Receives information about the current API session as parameter. If the [`airdcpp.signalReady`](https://github.com/airdcpp-web/airdcpp-extensions/blob/master/README.md#signalready) property in package.json has been set to true, the application will be notified about a completed initialization when the function returns (async functions are supported). |
| **onStop** | string | Called when the extension is stopped. All pending extension tasks/timers should be cancelled. |




## Managed extension

### Constructor

`ManagedExtension(entry, socketOptions)`

**Arguments**

`entry` ([Extension entry](#extension-entry-structure))

`socketOptions` (object, optional)

See [airdcpp-apisocket](https://github.com/airdcpp-web/airdcpp-apisocket-js/blob/master/GUIDE.md#settings) documentation for available options. No API connection information should be supplied as the connection is being managed automatically.

### Example usage

See the package entry point of [`airdcpp-create-extension`]((https://github.com/airdcpp-web/airdcpp-create-extension/)) starter project.




## Remote extension

### Constructor

`ManagedExtension(entry, socketOptions, extensionOptions)`

**Arguments**

`entry` ([Extension entry](#extension-entry-structure))

`socketOptions` (object, required)

See [airdcpp-apisocket](https://github.com/airdcpp-web/airdcpp-apisocket-js/blob/master/GUIDE.md#settings) documentation for available options. Full API connection information should be supplied.

`extensionOptions` (object, required)

| Name | Type | Required | Description
| :--- | :--- | :--- | :--- |
| **packageInfo** | object | ✓ | Required package.json properties |
| **dataPath** | string | ✓ | Root path for saving of possible config/log files (note that saving of console output is not handled by Remote extension) |
| **nameSuffix** | string | | Optional suffix to add to avoid possible extension name conflicts |

### Example usage

See the [dev server of `airdcpp-create-extension`](https://github.com/airdcpp-web/airdcpp-create-extension/tree/master/devtools) starter project.


[build-badge]: https://github.com/airdcpp-web/airdcpp-release-validator/actions/workflows/node.js.yml/badge.svg
[build]: https://github.com/airdcpp-web/airdcpp-release-validator/actions/workflows/node.js.yml

[npm-badge]: https://img.shields.io/npm/v/airdcpp-release-validator.svg?style=flat-square
[npm]: https://www.npmjs.org/package/airdcpp-extension

[coverage-badge]: https://codecov.io/gh/airdcpp-web/airdcpp-extension-js/branch/master/graph/badge.svg
[coverage]: https://codecov.io/gh/airdcpp-web/airdcpp-extension-js
