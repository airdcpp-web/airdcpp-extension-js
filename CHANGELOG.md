### 1.4.0 (2020-xx-xx)

- Add support for signaling when the extension has been initialized ([`airdcpp.signalReady`](https://github.com/airdcpp-web/airdcpp-extensions/blob/master/README.md#signalready) property in package.json)
- Pass web server information to the extension (server address string + secure boolean)

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