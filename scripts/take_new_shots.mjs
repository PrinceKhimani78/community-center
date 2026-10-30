import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9555;
const USER_DATA_DIR = path.resolve("./.temp_chrome_fresh");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log("Starting Chrome on port", PORT);
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
    await sleep(400);
    try {
      const res = await fetch(`http://localhost:${PORT}/json/list`);
      if (res.ok) {
        targets = await res.json();
        break;
      }
    } catch {
      // waiting
    }
  }

  if (!targets) {
    console.error("Could not connect to Chrome");
    chromeProcess.kill();
    return;
  }

  let target = targets.find((t) => t.type === "page");
  if (!target) {
    const newTabRes = await fetch(`http://localhost:${PORT}/json/new?http://localhost:3000/dashboard`, {
      method: "PUT",
    });
    target = await newTabRes.json();
  }

  const wsUrl = target.webSocketDebuggerUrl;
  console.log("WebSocket URL:", wsUrl);
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

  // Set cookie for localhost
  await send("Network.setCookie", {
    name: "valibhoy_session",
    value: JSON.stringify({ role: "manager", userId: "manager" }),
    url: "http://localhost:3000",
  });

  console.log("Navigating to http://localhost:3000/dashboard...");
  await send("Page.navigate", { url: "http://localhost:3000/dashboard" });
  await sleep(3500);

  // Hide dev overlay icon
  try {
    await send("Runtime.evaluate", {
      expression: `
        const style = document.createElement('style');
        style.innerHTML = 'nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-tools-button] { display: none !important; }';
        document.head.appendChild(style);
      `
    });
  } catch {}

  // 1440x900 viewport
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await sleep(1000);

  const evalRes = await send("Runtime.evaluate", {
    expression: `(() => {
      const el = document.querySelector('section[aria-label="Welcome and Actions"]');
      if (!el) return { error: "Not found" };
      const s = window.getComputedStyle(el);
      const parent = el.parentElement;
      const ps = window.getComputedStyle(parent);
      const grandParent = parent.parentElement;
      const gps = window.getComputedStyle(grandParent);
      const card = document.querySelector('section[aria-label="Quick Summary"] > a');
      const cs = card ? window.getComputedStyle(card) : null;
      return {
        banner: {
          paddingTop: s.paddingTop,
          paddingBottom: s.paddingBottom,
          paddingLeft: s.paddingLeft,
          paddingRight: s.paddingRight,
          height: s.height,
        },
        pageWrapper: {
          paddingTop: gps.paddingTop,
          paddingBottom: gps.paddingBottom,
          paddingLeft: gps.paddingLeft,
          paddingRight: gps.paddingRight,
        },
        cardPadding: cs ? {
          top: cs.paddingTop,
          bottom: cs.paddingBottom,
          left: cs.paddingLeft,
          right: cs.paddingRight
        } : null,
      };
    })()`,
    returnByValue: true,
  });
  console.log("COMPUTED STYLES:", JSON.stringify(evalRes.result?.value, null, 2));

  console.log("Capturing screenshot...");
  const res = await send("Page.captureScreenshot", { format: "png" });
  const outPath = path.resolve("./dashboard_desktop.png");
  fs.writeFileSync(outPath, Buffer.from(res.data, "base64"));
  console.log("Saved screenshot to", outPath);

  // Capture mobile (390 x 844)
  console.log("Capturing mobile screenshot (390x844)...");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(1000);
  const mobileRes = await send("Page.captureScreenshot", { format: "png" });
  const mobileOutPath = path.resolve("./dashboard_mobile.png");
  fs.writeFileSync(mobileOutPath, Buffer.from(mobileRes.data, "base64"));
  console.log("Saved mobile screenshot to", mobileOutPath);

  ws.close();
  chromeProcess.kill();
  console.log("Done!");
}

capture().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
