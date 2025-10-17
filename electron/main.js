const path = require("node:path");
const fs = require("node:fs");
const { fileURLToPath, URL } = require("node:url");
const { app, BrowserWindow, protocol } = require("electron");

const isDev = process.env.NODE_ENV === "development";
const DIST_PATH = path.join(__dirname, "..", "out");

if (!isDev) {
  app.setAppUserModelId("com.jsoncrack.app");
}

function ensureDistAvailable() {
  if (isDev) {
    return true;
  }

  const entryExists = fs.existsSync(path.join(DIST_PATH, "index.html"));
  if (!entryExists) {
    throw new Error(
      `Static export was not found. Please run \"pnpm build\" before packaging the Electron app.`
    );
  }

  return true;
}

async function registerStaticProtocol() {
  if (isDev) {
    return;
  }

  try {
    await protocol.uninterceptProtocol("file");
  } catch (error) {
    if (error?.message && !/scheme has not been intercepted/i.test(error.message)) {
      // eslint-disable-next-line no-console
      console.warn("Unable to reset file protocol:", error);
    }
  }

  protocol.interceptFileProtocol("file", (request, callback) => {
    try {
      const requestUrl = new URL(request.url);
      const pathname = requestUrl.pathname;

      if (pathname.startsWith("/_next") || pathname.startsWith("/static")) {
        const resolvedPath = path.join(DIST_PATH, pathname.slice(1));
        callback({ path: resolvedPath });
        return;
      }

      callback({ path: fileURLToPath(requestUrl) });
    } catch (error) {
      callback({ error });
    }
  });
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#121212",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    window.loadURL("http://localhost:3000");
  } else {
    const indexPath = path.join(DIST_PATH, "index.html");
    window.loadFile(indexPath);
  }

  return window;
}

app.whenReady().then(async () => {
  ensureDistAvailable();
  await registerStaticProtocol();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
