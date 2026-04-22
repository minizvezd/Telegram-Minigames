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
    --ui-shell-width: min(100%, 920px);
    --ui-radius-xl: 24px;
    --ui-radius-lg: 18px;
    --ui-radius-md: 14px;
    --ui-shadow-lg: 0 18px 40px rgba(0, 0, 0, 0.28);
    --ui-shadow-md: 0 12px 28px rgba(0, 0, 0, 0.22);
    --ui-border-dark: rgba(255, 255, 255, 0.12);
    --ui-border-light: rgba(0, 0, 0, 0.1);
    --ui-text-dark: #f7f9ff;
    --ui-text-light: #1f2430;
    --ui-muted-dark: rgba(255, 255, 255, 0.76);
    --ui-muted-light: rgba(31, 36, 48, 0.72);
    --ui-surface-dark: rgba(17, 21, 33, 0.82);
    --ui-surface-dark-strong: rgba(10, 13, 22, 0.9);
    --ui-surface-light: rgba(255, 255, 255, 0.82);
    --ui-surface-light-strong: rgba(248, 244, 236, 0.92);
    --ui-accent: #67e8f9;
    --ui-accent-strong: #7c3aed;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    height: var(--tg-viewport-height, 100vh) !important;
    min-height: var(--tg-viewport-height, 100vh) !important;
    box-sizing: border-box;
    overscroll-behavior: none;
  }

  html {
    overflow: hidden;
  }

  body {
    position: relative;
    overflow-x: hidden !important;
    overflow-y: auto !important;
    padding-top: var(--tg-content-safe-area-inset-top, env(safe-area-inset-top, 0px)) !important;
    padding-right: var(--tg-content-safe-area-inset-right, env(safe-area-inset-right, 0px)) !important;
    padding-bottom: var(--tg-content-safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)) !important;
    padding-left: var(--tg-content-safe-area-inset-left, env(safe-area-inset-left, 0px)) !important;
    -webkit-tap-highlight-color: transparent;
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(circle at top left, rgba(124, 58, 237, 0.18), transparent 34%),
      radial-gradient(circle at top right, rgba(103, 232, 249, 0.12), transparent 30%);
    opacity: 0.9;
    z-index: -1;
  }

  header {
    position: relative;
    box-sizing: border-box;
    display: flex !important;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: var(--ui-shell-width);
    min-height: 88px;
    margin: 0 auto;
    padding: 16px 20px !important;
    z-index: 100;
    background: transparent !important;
  }

  header h1 {
    margin: 0;
    padding: 0 118px;
    line-height: 1.15;
    letter-spacing: 0.02em;
  }

  .back-button {
    position: absolute !important;
    left: 20px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 52px;
    padding: 0 22px !important;
    border: 1px solid var(--ui-border-dark);
    text-decoration: none;
    background: rgba(18, 21, 30, 0.9) !important;
    color: #fff !important;
    border-radius: 999px !important;
    font-size: 15px !important;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.2px;
    box-shadow: var(--ui-shadow-md);
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
  }

  .back-button::before {
    content: "←";
    font-size: 16px;
    line-height: 1;
  }

  .back-button:hover,
  .back-button:active {
    background: rgba(28, 33, 46, 0.96) !important;
    border-color: rgba(255, 255, 255, 0.2);
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
    padding: 0 18px !important;
    font-size: 16px !important;
  }

  body > .instructions,
  body > #score,
  body > #info,
  body > #boardContainer,
  body > #mineContainer,
  body > #pongContainer,
  body > #gameContainer,
  body > #tetrisContainer {
    width: min(calc(100% - 24px), var(--ui-shell-width));
    box-sizing: border-box;
  }

  .instructions {
    margin: 8px auto 0 !important;
    padding: 16px 18px !important;
    border-radius: var(--ui-radius-lg) !important;
    border: 1px solid var(--ui-border-dark) !important;
    background: var(--ui-surface-dark) !important;
    color: var(--ui-muted-dark) !important;
    box-shadow: var(--ui-shadow-md);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    line-height: 1.5 !important;
    font-size: 14px !important;
    text-align: center;
  }

  #score,
  #info {
    margin: 14px auto 0 !important;
    padding: 14px 18px !important;
    border-radius: var(--ui-radius-lg) !important;
    border: 1px solid var(--ui-border-dark) !important;
    background: rgba(12, 15, 24, 0.82) !important;
    color: #fff !important;
    box-shadow: var(--ui-shadow-md);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    font-size: 16px !important;
  }

  #info {
    justify-content: center;
    flex-wrap: wrap;
    gap: 14px 22px !important;
  }

  #boardContainer,
  #mineContainer,
  #pongContainer,
  #gameContainer,
  #tetrisContainer {
    position: relative;
    margin: 14px auto 28px !important;
    padding: 18px !important;
    border-radius: calc(var(--ui-radius-xl) + 4px) !important;
    border: 1px solid var(--ui-border-dark) !important;
    background: rgba(9, 12, 20, 0.74) !important;
    box-shadow: var(--ui-shadow-lg);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  #boardContainer > div,
  #mineContainer > div,
  #pongContainer > div,
  #gameContainer > div,
  #tetrisContainer > div {
    width: 100%;
  }

  canvas,
  #board {
    display: block;
    margin: 0 auto;
    border-radius: 20px !important;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 12px 28px rgba(0, 0, 0, 0.28);
  }

  #board {
    overflow: hidden;
  }

  #gameOver {
    min-width: min(320px, calc(100vw - 64px));
    padding: 24px 20px !important;
    border-radius: var(--ui-radius-xl) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    background: rgba(10, 12, 20, 0.9) !important;
    box-shadow: var(--ui-shadow-lg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    z-index: 5 !important;
  }

  #gameOver h2,
  #gameOver p {
    margin: 0;
  }

  #gameOver button {
    min-height: 50px;
    padding: 0 18px !important;
    border: none;
    border-radius: 999px !important;
    background: linear-gradient(135deg, var(--ui-accent-strong), var(--ui-accent)) !important;
    color: #fff !important;
    font-size: 15px !important;
    font-weight: 800;
    letter-spacing: 0.02em;
    box-shadow: 0 12px 26px rgba(103, 232, 249, 0.22);
    transition: transform 0.18s ease, filter 0.18s ease;
  }

  #gameOver button:hover,
  #gameOver button:active {
    transform: translateY(-1px);
    filter: brightness(1.05);
  }

  html[data-page-theme="light"] .instructions {
    background: var(--ui-surface-light) !important;
    border-color: var(--ui-border-light) !important;
    color: var(--ui-muted-light) !important;
  }

  html[data-page-theme="light"] #score,
  html[data-page-theme="light"] #info,
  html[data-page-theme="light"] #boardContainer,
  html[data-page-theme="light"] #mineContainer {
    background: var(--ui-surface-light-strong) !important;
    border-color: var(--ui-border-light) !important;
    color: var(--ui-text-light) !important;
  }

  html[data-page-theme="light"] header h1,
  html[data-page-theme="light"] #score,
  html[data-page-theme="light"] #info {
    color: var(--ui-text-light) !important;
  }

  html[data-page-theme="light"] body::before {
    background:
      radial-gradient(circle at top left, rgba(237, 196, 80, 0.16), transparent 32%),
      radial-gradient(circle at top right, rgba(245, 149, 99, 0.14), transparent 30%);
  }

  @media (max-width: 600px) {
    header {
      min-height: 80px;
      padding: 14px 16px !important;
    }

    header h1 {
      padding: 0 98px;
      font-size: 18px !important;
    }

    .back-button {
      left: 16px !important;
      min-height: 46px;
      padding: 0 18px !important;
      font-size: 14px !important;
    }

    .instructions,
    #score,
    #info,
    #boardContainer,
    #mineContainer,
    #pongContainer,
    #gameContainer,
    #tetrisContainer {
      width: min(calc(100% - 20px), var(--ui-shell-width));
    }

    .instructions {
      padding: 14px 15px !important;
      font-size: 13px !important;
    }

    #score,
    #info {
      padding: 12px 14px !important;
      font-size: 15px !important;
    }

    #boardContainer,
    #mineContainer,
    #pongContainer,
    #gameContainer,
    #tetrisContainer {
      padding: 12px !important;
      border-radius: 22px !important;
      margin-bottom: 20px !important;
    }

    canvas,
    #board {
      border-radius: 16px !important;
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

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
</style>
<script id="shared-telegram-safe-area-script">
  (function initSharedLayout() {
    const root = document.documentElement;
    const rawPath = window.location.pathname || "/";
    const pathname = rawPath.replace(/\/+$/, "") || "/";
    const isHome = pathname === "/" || pathname === "/index.html";
    const pageConfig = {
      "/": { header: "#0b0e33", background: "#0b0e33", theme: "dark" },
      "/index.html": { header: "#0b0e33", background: "#0b0e33", theme: "dark" },
      "/2048.html": { header: "#faf8ef", background: "#faf8ef", theme: "light" },
      "/minesweeper.html": { header: "#d3d3d3", background: "#d3d3d3", theme: "light" },
      "/snake.html": { header: "#222222", background: "#222222", theme: "dark" },
      "/tetris.html": { header: "#222222", background: "#222222", theme: "dark" },
      "/pong.html": { header: "#000000", background: "#000000", theme: "dark" }
    };
    const config = pageConfig[pathname] || { header: "#111521", background: "#111521", theme: "dark" };

    function px(value, fallback) {
      if (typeof value === "number" && isFinite(value) && value >= 0) {
        return value + "px";
      }
      return fallback;
    }

    function applyBaseTheme() {
      root.dataset.pageTheme = config.theme;
    }

    function handleBack() {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = "/";
    }

    applyBaseTheme();

    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) {
      return;
    }

    function applyViewport() {
      const safe = tg.contentSafeAreaInset || tg.safeAreaInset || {};

      root.classList.add("tg-webapp");
      root.dataset.pageTheme = config.theme;
      root.style.setProperty("--tg-viewport-height", px(tg.viewportHeight, "100vh"));
      root.style.setProperty("--tg-content-safe-area-inset-top", px(safe.top, "env(safe-area-inset-top, 0px)"));
      root.style.setProperty("--tg-content-safe-area-inset-right", px(safe.right, "env(safe-area-inset-right, 0px)"));
      root.style.setProperty("--tg-content-safe-area-inset-bottom", px(safe.bottom, "env(safe-area-inset-bottom, 0px)"));
      root.style.setProperty("--tg-content-safe-area-inset-left", px(safe.left, "env(safe-area-inset-left, 0px)"));

      if (typeof tg.setHeaderColor === "function") {
        tg.setHeaderColor(config.header);
      }
      if (typeof tg.setBackgroundColor === "function") {
        tg.setBackgroundColor(config.background);
      }
      if (typeof tg.setBottomBarColor === "function") {
        tg.setBottomBarColor(config.background);
      }

      if (tg.BackButton) {
        if (typeof tg.BackButton.hide === "function") {
          tg.BackButton.hide();
        }
        if (typeof tg.BackButton.offClick === "function") {
          tg.BackButton.offClick(handleBack);
        }
        if (!isHome) {
          if (typeof tg.BackButton.onClick === "function") {
            tg.BackButton.onClick(handleBack);
          }
          if (typeof tg.BackButton.show === "function") {
            tg.BackButton.show();
          }
        }
      }
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
