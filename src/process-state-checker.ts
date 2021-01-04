import { ContextType } from './context';


export const EXIT_CODE_RESTART = 124;
export const EXIT_CODE_PARENT_DEAD = 69;

const isPidAlive = (pid: number) => {
  try {
    return process.kill(pid, 0)
  } catch (e) {
    return e.code === 'EPERM'
  }
};

const ProcessStateChecker = (appPid: number, { socket }: ContextType, onStop: () => void) => {
  const ALIVE_CHECK_INTERVAL_MS = 5000;
  const SLEEP_DETECT_TIMEOUT_MS = 30000;

  let lastParentAlive = Date.now();
  let interval: any;

  const checkParentAlive = () => {
    // System was hibernated? Request the extension to be restarted
    if (lastParentAlive + SLEEP_DETECT_TIMEOUT_MS < Date.now()) {
      socket.logger.error(`Wake up detected (last alive ${Date.now() - lastParentAlive} ms ago), requesting restart...`);
      onStop();
      process.exit(EXIT_CODE_RESTART);
      return;
    }

    // AirDC++ process was killed?
    // If the application didn't perform a clean exit, the connection may stay alive indefinitely (happens at least on Windows)
    // This will avoid leaving zombie extensions running that would also block the log file handles
    if (!isPidAlive(appPid)) {
      socket.logger.error(`Parent dead (PID ${appPid}), exiting...`);
      onStop();
      process.exit(EXIT_CODE_PARENT_DEAD);
    }

    lastParentAlive = Date.now();
  };

  const start = () => {
    interval = setInterval(checkParentAlive, ALIVE_CHECK_INTERVAL_MS);
  };
  
  const stop = () => {
    clearInterval(interval);
  };

  return {
    start,
    stop,
  };
};


// Legacy
const SocketPingHandler = ({ socket, api }: ContextType, onStop: () => void) => {
  const PING_INTERVAL_MS = 4000;
  const PING_TIMEOUT_MS = 10000;

  let lastSocketAlive = Date.now() + 9999;
  let interval: any;

  const handlePing = () => {
    if (lastSocketAlive + PING_TIMEOUT_MS < Date.now()) {
      socket.logger.error('Socket timed out, requesting restart...');
      onStop();
      process.exit(EXIT_CODE_RESTART);
      return;
    }

    api.activity()
      .then(_ => {
        lastSocketAlive = Date.now();
      })
      .catch(e => {
        socket.logger.error(`Ping failed: ${e.message}`);
      });
  };

  const start = () => {
    interval = setInterval(handlePing, PING_INTERVAL_MS);
  };
  
  const stop = () => {
    clearInterval(interval);
  };

  return {
    start,
    stop,
  };
}

export const getProcessStateChecker = (context: ContextType, onStop: () => void) => {
  // appPid is available starting from feature level 7
  if (!context.argv.appPid) {
    // Legacy process state checker for older application versions
    return SocketPingHandler(context, onStop);
  }

  return ProcessStateChecker(context.argv.appPid, context, onStop);
};
