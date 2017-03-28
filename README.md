# AirDC++ extension development modules for JavaScript

>If you are new to AirDC++ extension development, you should first see the [`airdcpp-create-extension`](https://github.com/airdcpp-web/airdcpp-create-extension/) starter project for a complete introduction.


This package provides the following modules for AirDC++ module development:

### [Managed extension](#managed-extension)**

Used when the extension is installed and managed by the application itself. 

### [Remote extension](#remote-extension)**

Used when the extension is launched manually with node instead of being installed in the application. Remote extension is launched externally and it connects to the API by using normal credential-based authentication. 

Remote extension can be useful for development use or when the extension needs to be run on a different machine. In generic use cases it's better to use Managed extension instead.



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
| **onStart** | function | Called when the extension is started. Receives information about the current API session as parameter. |
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
