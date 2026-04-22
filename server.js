const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { Record, connectDB } = require("./db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const sharedLayoutStyles = `
<style id="shared-layout-styles">
  :root {
    --tg-safe-top: 0px;
    --tg-safe-right: 0px;
    --tg-safe-bottom: 0px;
    --tg-safe-left: 0px;
    --tg-overlay-top: 0px;
  }

  html,
  body {
    min-height: 100%;
  }

  body {
    min-height: 100dvh;
    padding-top: calc(max(env(safe-area-inset-top, 0px), var(--tg-safe-top)) + var(--tg-overlay-top));
    padding-right: max(env(safe-area-inset-right, 0px), var(--tg-safe-right));
    padding-bottom: max(env(safe-area-inset-bottom, 0px), var(--tg-safe-bottom));
    padding-left: max(env(safe-area-inset-left, 0px), var(--tg-safe-left));
  }

  header {
    box-sizing: border-box;
    display: flex !important;
    align-items: center;
    justify-content: center;
    min-height: 88px;
    padding: 16px 20px !important;
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
    transition: background 0.2s ease, transform 0.2s ease, opacity 0.2s ease;
  }

  .back-button:hover {
    background: #3a3d45 !important;
  }

  .back-button:active {
    transform: translateY(-50%) scale(0.98) !important;
  }

  .back-button:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.7);
    outline-offset: 2px;
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
  }
</style>`;

const sharedTelegramScript = `
<script id="shared-telegram-safe-area-script">
  (function () {
    const root = document.documentElement;
    const tg = window.Telegram && window.Telegram.WebApp;
    const isiOS = /iP(ad|hone|od)/.test(navigator.userAgent || "");

    function px(value) {
      return typeof value === "number" && isFinite(value) ? Math.max(value, 0) + "px" : "0px";
    }

    function getFullscreenOverlayTop() {
      const screenHeight = Math.max(window.screen?.availHeight || 0, window.screen?.height || 0);
      const ratio = screenHeight ? window.innerHeight / screenHeight : 0;
      const isFullscreenLike = ratio > 0.82;
      return isiOS && isFullscreenLike ? 56 : 0;
    }

    function applyInsets() {
      if (!tg) return;

      const safe = tg.safeAreaInset || {};
      const content = tg.contentSafeAreaInset || {};

      root.style.setProperty("--tg-safe-top", px(Math.max(content.top || 0, safe.top || 0)));
      root.style.setProperty("--tg-safe-right", px(Math.max(content.right || 0, safe.right || 0)));
      root.style.setProperty("--tg-safe-bottom", px(Math.max(content.bottom || 0, safe.bottom || 0)));
      root.style.setProperty("--tg-safe-left", px(Math.max(content.left || 0, safe.left || 0)));
      root.style.setProperty("--tg-overlay-top", px(getFullscreenOverlayTop()));
    }

    if (!tg) return;

    tg.ready && tg.ready();
    tg.expand && tg.expand();
    applyInsets();
    setTimeout(applyInsets, 150);
    setTimeout(applyInsets, 500);

    if (tg.onEvent) {
      tg.onEvent("safeAreaChanged", applyInsets);
      tg.onEvent("contentSafeAreaChanged", applyInsets);
      tg.onEvent("viewportChanged", applyInsets);
    }

    window.addEventListener("resize", applyInsets, { passive: true });
  })();
</script>`;

function injectSharedMarkup(html) {
  if (html.includes('id="shared-layout-styles"')) {
    return html;
  }

  const sharedMarkup = `${sharedLayoutStyles}\n${sharedTelegramScript}`;

  if (html.includes("</head>")) {
    return html.replace("</head>", `${sharedMarkup}\n</head>`);
  }

  return `${sharedMarkup}\n${html}`;
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
