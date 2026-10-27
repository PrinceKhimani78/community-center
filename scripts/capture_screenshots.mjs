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

  if (!targets || targets.length === 0) {
    const newTabRes = await fetch(`http://localhost:${PORT}/json/new?http://localhost:3000/login`, {
      method: "PUT",
    });
    targets = [await newTabRes.json()];
  }

  const target = targets[0];
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

  // Enable Page and Network domains
  await send("Network.enable");
  await send("Page.enable");

  // Set session cookie for manager
  const sessionVal = JSON.stringify({
    userId: "manager",
    role: "manager",
    authenticatedAt: new Date().toISOString(),
  });

  await send("Network.setCookie", {
    name: "valibhoy_session",
    value: encodeURIComponent(sessionVal),
    domain: "localhost",
    path: "/",
    httpOnly: true,
  });

  console.log("Cookie set. Navigating to http://localhost:3000/dashboard...");
  await send("Page.navigate", { url: "http://localhost:3000/dashboard" });

  // Wait for load
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

  // 1. Capture 1440px desktop screenshot
  console.log("Setting viewport to 1440x900...");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(1000);

  console.log("Capturing desktop screenshot (1440px)...");
  const desktopResult = await send("Page.captureScreenshot", {
    format: "png",
  });
  const desktopPath = path.resolve("./dashboard_1440.png");
  fs.writeFileSync(desktopPath, Buffer.from(desktopResult.data, "base64"));
  console.log("Saved:", desktopPath);

  // 2. Capture 390px mobile screenshot
  console.log("Setting viewport to 390x844 (mobile)...");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(1000);

  // Get full document height for mobile to capture complete stack
  const evalRes = await send("Runtime.evaluate", {
    expression: "document.documentElement.scrollHeight",
  });
  const scrollHeight = (evalRes && evalRes.result && evalRes.result.value) || 1600;

  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: scrollHeight,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(800);

  console.log(`Capturing mobile screenshot (390x${scrollHeight})...`);
  const mobileResult = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  const mobilePath = path.resolve("./dashboard_390.png");
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
