const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { Record, connectDB } = require("./db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const TELEGRAM_VIEWPORT_META = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">';

const sharedLayoutMarkup = `
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style id="shared-layout-styles">
  :root {
    --tg-viewport-height: 100vh;
    --tg-content-safe-area-inset-top: env(safe-area-inset-top, 0px);
    --tg-content-safe-area-inset-right: env(safe-area-inset-right, 0px);
    --tg-content-safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
    --tg-content-safe-area-inset-left: env(safe-area-inset-left, 0px);
  }

  html,
  body {
    margin: 0;
    padding: 0;
    height: var(--tg-viewport-height, 100vh) !important;
    min-height: var(--tg-viewport-height, 100vh) !important;
    overflow: hidden !important;
    box-sizing: border-box;
    overscroll-behavior: none;
  }

  body {
    padding-top: var(--tg-content-safe-area-inset-top, env(safe-area-inset-top, 0px)) !important;
    padding-right: var(--tg-content-safe-area-inset-right, env(safe-area-inset-right, 0px)) !important;
    padding-bottom: var(--tg-content-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) !important;
    padding-left: var(--tg-content-safe-area-inset-left, env(safe-area-inset-left, 0px)) !important;
  }

  header {
    position: relative;
    box-sizing: border-box;
    display: flex !important;
    align-items: center;
    justify-content: center;
    min-height: 88px;
    padding: 16px 20px !important;
    z-index: 100;
  }

  header h1 {
    margin: 0;
    padding: 0 110px;
    line-height: 1.2;
  }

  .back-button {
    position: absolute !important;
    left: 20px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    padding: 0 24px !important;
    border: none;
    text-decoration: none;
    background: #2f3138 !important;
    color: #fff !important;
    border-radius: 12px !important;
    font-size: 16px !important;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.2px;
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.18);
    -webkit-tap-highlight-color: transparent;
  }

  .tg-webapp .back-button {
    display: none !important;
  }

  .tg-webapp header {
    min-height: 112px !important;
    padding-top: 40px !important;
    padding-bottom: 10px !important;
  }

  .tg-webapp header h1 {
    padding: 0 16px !important;
    font-size: 16px !important;
  }

  @media (max-width: 600px) {
    header {
      min-height: 80px;
      padding: 14px 16px !important;
    }

    header h1 {
      padding: 0 94px;
      font-size: 18px !important;
    }

    .back-button {
      left: 16px !important;
      min-height: 48px;
      padding: 0 20px !important;
      border-radius: 10px !important;
      font-size: 15px !important;
    }

    .tg-webapp header {
      min-height: 104px !important;
      padding-top: 34px !important;
      padding-bottom: 8px !important;
    }

    .tg-webapp header h1 {
      padding: 0 12px !important;
      font-size: 15px !important;
    }
  }
</style>
<script id="shared-telegram-safe-area-script">
  (function waitForTelegram() {
    const tg = window.Telegram && window.Telegram.WebApp;

    if (!tg) {
      setTimeout(waitForTelegram, 50);
      return;
    }

    const root = document.documentElement;

    function px(value, fallback) {
      if (typeof value === "number" && isFinite(value) && value >= 0) {
        return value + "px";
      }
      return fallback;
    }

    function applyViewport() {
      const safe = tg.contentSafeAreaInset || tg.safeAreaInset || {};
      root.classList.add("tg-webapp");
      root.style.setProperty("--tg-viewport-height", px(tg.viewportHeight, "100vh"));
      root.style.setProperty("--tg-content-safe-area-inset-top", px(safe.top, "env(safe-area-inset-top, 0px)"));
      root.style.setProperty("--tg-content-safe-area-inset-right", px(safe.right, "env(safe-area-inset-right, 0px)"));
      root.style.setProperty("--tg-content-safe-area-inset-bottom", px(safe.bottom, "env(safe-area-inset-bottom, 0px)"));
      root.style.setProperty("--tg-content-safe-area-inset-left", px(safe.left, "env(safe-area-inset-left, 0px)"));
    }

    tg.ready();
    tg.expand();
    applyViewport();
    setTimeout(applyViewport, 120);
    setTimeout(applyViewport, 400);

    if (tg.onEvent) {
      tg.onEvent("viewportChanged", applyViewport);
      tg.onEvent("safeAreaChanged", applyViewport);
      tg.onEvent("contentSafeAreaChanged", applyViewport);
    }

    window.addEventListener("resize", applyViewport, { passive: true });
  })();
</script>`;

function injectSharedMarkup(html) {
  if (html.includes("<head>") && /<meta\s+name=["']viewport["']/i.test(html)) {
    html = html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, TELEGRAM_VIEWPORT_META);
  } else if (html.includes("<head>")) {
    html = html.replace("<head>", `<head>\n${TELEGRAM_VIEWPORT_META}`);
  }

  if (html.includes('id="shared-layout-styles"')) {
    return html;
  }

  if (html.includes("</head>")) {
    return html.replace("</head>", `${sharedLayoutMarkup}\n</head>`);
  }

  return `${sharedLayoutMarkup}\n${html}`;
}

function sendTemplate(res, fileName) {
  const filePath = path.join(__dirname, "templates", fileName);

  fs.readFile(filePath, "utf8", (err, html) => {
    if (err) {
      console.error(`Failed to read template ${fileName}:`, err);
      return res.status(500).send("Template error");
    }

    res.type("html").send(injectSharedMarkup(html));
  });
}

app.post("/api/record", async (req, res) => {
  const { user_id, username, game_type, score } = req.body;

  if (!user_id || !username || !game_type || score == null) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const newRecord = new Record({
      user_id,
      username,
      game_type,
      score,
    });

    await newRecord.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/top/:gameType", async (req, res) => {
  try {
    const records = await Record.find({ game_type: req.params.gameType })
      .sort({ score: 1 })
      .limit(10);

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  sendTemplate(res, "index.html");
});

app.get("/2048.html", (req, res) => {
  sendTemplate(res, "2048.html");
});

app.get("/minesweeper.html", (req, res) => {
  sendTemplate(res, "minesweeper.html");
});

app.get("/pong.html", (req, res) => {
  sendTemplate(res, "pong.html");
});

app.get("/snake.html", (req, res) => {
  sendTemplate(res, "snake.html");
});

app.get("/tetris.html", (req, res) => {
  sendTemplate(res, "tetris.html");
});

app.use(express.static("templates"));

module.exports = app;
