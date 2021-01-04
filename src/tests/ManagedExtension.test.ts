import { ManagedExtension } from '../ManagedExtension';
import { getMockContext } from './test-helpers';

import { ScriptEntryHandler } from '../types';

describe('Managed extension', () => {
  test('should start', async () => {
    const entryMockFn = jest.fn();

    const ExtensionOptions = {

    };

    const Entry: ScriptEntryHandler = (socket, extension) => {
      entryMockFn(extension);
    };

    const ext = ManagedExtension(Entry, {}, ExtensionOptions, getMockContext);

    expect(entryMockFn.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "configPath": "",
          "debugMode": false,
          "logPath": "",
          "name": "mock-ext",
          "onStart": undefined,
          "onStop": undefined,
          "server": Object {
            "address": "mock-api-url:5600",
            "secure": false,
          },
        },
      ]
    `);

    ext.stop();
  });
});
