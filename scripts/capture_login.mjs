import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const USER_DATA_DIR = path.resolve("./.chrome_headless_profile");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log("Launching Chrome headless...");
  const chromeProcess = spawn(
    CHROME_PATH,
    [
      "--headless=new",
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
    ],
    { stdio: "ignore" }
  );

  let targets = null;
  for (let i = 0; i < 30; i++) {
    await sleep(500);
    try {
      const res = await fetch(`http://localhost:${PORT}/json/list`);
      if (res.ok) {
        targets = await res.json();
        break;
      }
    } catch {
      // Chrome still starting
    }
  }

  let target = targets.find((t) => t.type === "page");
  if (!target) {
    const newTabRes = await fetch(`http://localhost:${PORT}/json/new?http://localhost:3000/login`, {
      method: "PUT",
    });
    target = await newTabRes.json();
  }

  const wsUrl = target.webSocketDebuggerUrl;
  console.log("Connected to Chrome via WebSocket:", wsUrl);

  const ws = new WebSocket(wsUrl);

  let idCounter = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      callbacks.set(id, (msg) => {
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  await new Promise((resolve) => (ws.onopen = resolve));

  await send("Network.enable");
  await send("Page.enable");
  await send("Network.clearBrowserCookies");

  console.log("Navigating to http://localhost:3000/login...");
  await send("Page.navigate", { url: "http://localhost:3000/login" });

  await sleep(3000);

  // Hide dev overlay icon
  try {
    await send("Runtime.evaluate", {
      expression: `
        const style = document.createElement('style');
        style.innerHTML = 'nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button] { display: none !important; }';
        document.head.appendChild(style);
      `
    });
  } catch (e) {
    // ignore
  }

  // 1. Desktop Screenshot (1440x900)
  console.log("Setting viewport to 1440x900...");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(1000);

  console.log("Capturing desktop login screenshot (1440px)...");
  const desktopResult = await send("Page.captureScreenshot", {
    format: "png",
  });
  const desktopPath = path.resolve("./login_desktop.png");
  fs.writeFileSync(desktopPath, Buffer.from(desktopResult.data, "base64"));
  console.log("Saved:", desktopPath);

  // 2. Mobile Screenshot (390x844)
  console.log("Setting viewport to 390x844 (mobile)...");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(1000);

  const evalRes = await send("Runtime.evaluate", {
    expression: "document.documentElement.scrollHeight",
  });
  const scrollHeight = (evalRes && evalRes.result && evalRes.result.value) || 1000;

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: scrollHeight,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(800);

  console.log(`Capturing mobile login screenshot (390x${scrollHeight})...`);
  const mobileResult = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  const mobilePath = path.resolve("./login_mobile.png");
  fs.writeFileSync(mobilePath, Buffer.from(mobileResult.data, "base64"));
  console.log("Saved:", mobilePath);

  ws.close();
  chromeProcess.kill();
  console.log("Screenshots captured successfully!");
}

capture().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
