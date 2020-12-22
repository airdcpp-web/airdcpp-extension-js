import { APISocket } from 'airdcpp-apisocket';


export const EXIT_CODE_RESTART = 124;
export const EXIT_CODE_PARENT_DEAD = 69;

const isPidAlive = (pid: number) => {
  try {
    return process.kill(pid, 0)
  } catch (e) {
    return e.code === 'EPERM'
  }
};

const ProcessStateChecker = (appPid: number, socket: APISocket, onStop: () => void) => {
  const ALIVE_CHECK_INTERVAL_MS = 5000;
  const SLEEP_DETECT_TIMEOUT_MS = 30000;

  let lastParentAlive = Date.now();

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
    setInterval(checkParentAlive, ALIVE_CHECK_INTERVAL_MS);
  };

  return {
    start,
  };
};


// Legacy
const SocketPingHandler = (socket: APISocket, onStop: () => void) => {
  const PING_INTERVAL_MS = 4000;
  const PING_TIMEOUT_MS = 10000;

  let lastSocketAlive = Date.now() + 9999;

  const handlePing = () => {
    if (lastSocketAlive + PING_TIMEOUT_MS < Date.now()) {
      socket.logger.error('Socket timed out, requesting restart...');
      onStop();
      process.exit(EXIT_CODE_RESTART);
      return;
    }

    socket.post('sessions/activity')
      .then(_ => {
        lastSocketAlive = Date.now();
      })
      .catch(e => {
        socket.logger.error(`Ping failed: ${e.message}`);
      });
  };

  const start = () => {
    setInterval(handlePing, PING_INTERVAL_MS);
  };

  return {
    start,
  };
}

export const getProcessStateChecker = (appPid: number | undefined, socket: APISocket, onStop: () => void) => {
  // appPid is available starting from feature level 7
  if (!appPid) {
    // Legacy process state checker for older application versions
    return SocketPingHandler(socket, onStop);
  }

  return ProcessStateChecker(appPid, socket, onStop);
};
