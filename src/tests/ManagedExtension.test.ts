import { ManagedExtension } from '../ManagedExtension';
import { getMockContext } from './test-helpers';

import { ScriptEntryHandler } from '../types';
import waitForExpect from 'wait-for-expect';

describe('Managed extension', () => {
  let ext: ReturnType<typeof ManagedExtension>;

  afterEach(async () => {
    if (ext) {
      ext.stop();
    }
  });

  test('should start', async () => {
    const entryMockFn = jest.fn();

    const ExtensionOptions = {};

    const Entry: ScriptEntryHandler = (socket, extension) => {
      entryMockFn(extension);
    };

    const SLEEP_DETECT_TIMEOUT = 40;

    const settingValuesMockFn = jest.fn();
    const Context = getMockContext({
      api: {
        getSettingValues: (keys) => {
          settingValuesMockFn(keys);
          return Promise.resolve([SLEEP_DETECT_TIMEOUT] as any);
        },
      },
    });

    ext = ManagedExtension(Entry, {}, ExtensionOptions, () => Context);

    (Context.socket as any).onConnected({});

    await waitForExpect(() => {
      expect(settingValuesMockFn).toHaveBeenCalled();
    });

    expect(entryMockFn.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "configPath": "mock-settings-path",
          "debugMode": false,
          "logPath": "mock-log-path",
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

    expect(settingValuesMockFn.mock.calls[0]).toMatchInlineSnapshot(`
      Array [
        Array [
          "ping_timeout",
        ],
      ]
    `);

    expect(ext.getStats().sleepDetectTimeoutMs).toEqual(
      SLEEP_DETECT_TIMEOUT * 1000
    );
  });
});
