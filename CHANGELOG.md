### 1.4.2 (2021-01-01)

- Set the process title to match the extension name

### 1.4.1 (2020-12-22)

- Monitor existence of the parent process by using the provided process id argument instead of sending socket messages (requires the latest application version)

### 1.4.0 (2020-12-04)

- Add support for signaling when the extension has been initialized ([`airdcpp.signalReady`](https://github.com/airdcpp-web/airdcpp-extensions/blob/master/README.md#signalready) property in package.json)
- Pass web `server` information object to the extension (`address` string + `secure` boolean)

### 1.3.1 (2020-10-27)

- Add a missing runtime dependency for RemoteExtension

### 1.3.0 (2020-10-20)

- Migrate to TypeScript
- Log the supplied command line args on startup

### 1.2.0 (2020-07-11)

- Managed extensions: request the extension to be restarted in case of unclean socket disconnects (https://github.com/airdcpp-web/airdcpp-webclient/issues/356)
- Change the chat filter example script to use the new chat command API listeners
- Update [`airdcpp-apisocket`](https://github.com/airdcpp-web/airdcpp-apisocket-js) to version 2.3.0
- Update all dependencies