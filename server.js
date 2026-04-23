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
    --tg-safe-top: env(safe-area-inset-top, 0px);
    --tg-safe-right: env(safe-area-inset-right, 0px);
    --tg-safe-bottom: env(safe-area-inset-bottom, 0px);
    --tg-safe-left: env(safe-area-inset-left, 0px);
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
    padding-top: var(--tg-safe-top) !important;
    padding-right: var(--tg-safe-right) !important;
    padding-bottom: var(--tg-safe-bottom) !important;
    padding-left: var(--tg-safe-left) !important;
  }

  html.tg-game-page body {
    width: 100%;
    display: flex !important;
    flex-direction: column;
    align-items: center;
    overflow-x: hidden !important;
    background: linear-gradient(180deg, #232427 0%, #1d1e22 50%, #18191c 100%) !important;
    color: #fff !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
  }

  html.tg-game-page header {
    width: 100%;
    min-height: 92px;
    padding: 16px 20px !important;
    box-sizing: border-box;
    position: relative;
    display: flex !important;
    align-items: center;
    justify-content: center;
    background: #4caf50 !important;
    color: #fff !important;
  }

  html.tg-game-page header h1 {
    margin: 0;
    padding: 0 120px;
    line-height: 1.15;
    font-size: clamp(22px, 2.4vw, 30px) !important;
    font-weight: 800;
    text-align: center;
  }

  html.tg-game-page .back-button {
    position: absolute !important;
    left: 22px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    min-height: 56px;
    padding: 0 24px !important;
    border: 0 !important;
    text-decoration: none !important;
    border-radius: 18px !important;
    background: #2f3138 !important;
    color: #fff !important;
    font-size: 17px !important;
    font-weight: 700 !important;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
    -webkit-tap-highlight-color: transparent;
  }

  html.tg-game-page.tg-fullscreen .back-button {
    display: none !important;
  }

  html.tg-game-page .instructions {
    width: min(calc(100% - 24px), 640px);
    margin: 14px auto 0 !important;
    padding: 15px 18px !important;
    box-sizing: border-box;
    border-radius: 16px !important;
    background: rgba(58, 59, 64, 0.95) !important;
    color: rgba(255, 255, 255, 0.97) !important;
    border: 1px solid rgba(255, 255, 255, 0.08);
    text-align: center;
    line-height: 1.42 !important;
    font-size: clamp(15px, 1.9vw, 17px) !important;
  }

  html.tg-game-page #score,
  html.tg-game-page #info {
    width: min(calc(100% - 24px), 680px);
    margin: 18px auto 0 !important;
    color: #fff !important;
    text-align: center;
  }

  html.tg-game-page #score {
    font-size: clamp(24px, 3.2vw, 32px) !important;
    font-weight: 700;
  }

  html.tg-game-page #info {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 16px !important;
  }

  html.tg-game-page #info > div {
    padding: 12px 16px;
    border-radius: 14px;
    background: rgba(58, 59, 64, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  html.tg-game-page #gameContainer,
  html.tg-game-page #pongContainer,
  html.tg-game-page #tetrisContainer,
  html.tg-game-page #boardContainer,
  html.tg-game-page #mineContainer {
    width: min(calc(100% - 24px), 760px) !important;
    margin: 14px auto 28px !important;
    padding: 20px !important;
    box-sizing: border-box;
    display: flex !important;
    justify-content: center;
    align-items: center;
    border-radius: 26px !important;
    background: linear-gradient(180deg, rgba(44, 45, 49, 0.96) 0%, rgba(28, 29, 33, 0.96) 100%) !important;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.22);
  }

  html.tg-game-page canvas,
  html.tg-game-page #board {
    display: block;
    max-width: 100%;
    border-radius: 20px !important;
    border: 2px solid rgba(255, 255, 255, 0.14) !important;
  }

  html.tg-game-page #gameOver {
    display: none;
    position: absolute;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    min-width: min(82vw, 320px);
    max-width: calc(100% - 32px);
    padding: 28px 24px !important;
    box-sizing: border-box;
    text-align: center;
    border-radius: 24px !important;
    background: rgba(10, 10, 12, 0.92) !important;
    color: #fff !important;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 24px 56px rgba(0, 0, 0, 0.34);
    z-index: 10;
  }

  html.tg-game-page #gameOver button {
    min-height: 48px;
    padding: 0 24px !important;
    border: 0 !important;
    border-radius: 14px !important;
    background: #ff6f6f !important;
    color: #fff !important;
    font-size: 16px !important;
    font-weight: 700 !important;
    cursor: pointer;
  }

  html.tg-game-page[data-game-page="snake"] #gameContainer,
  html.tg-game-page[data-game-page="tetris"] #tetrisContainer {
    width: min(calc(100% - 24px), 520px) !important;
  }

  html.tg-game-page[data-game-page="snake"] canvas {
    width: min(86vw, 430px) !important;
    aspect-ratio: 1 / 1;
    background: #040506 !important;
  }

  html.tg-game-page[data-game-page="pong"] #pongContainer {
    width: min(calc(100% - 24px), 840px) !important;
  }

  html.tg-game-page[data-game-page="pong"] canvas {
    width: min(100%, 720px) !important;
    aspect-ratio: 3 / 2;
    background: #06070a !important;
  }

  html.tg-game-page[data-game-page="tetris"] #tetrisCanvas {
    width: min(62vw, 260px) !important;
    max-width: 260px !important;
    background: #050608 !important;
  }

  html.tg-game-page[data-game-page="2048"] #board {
    width: min(82vw, 360px) !important;
    height: min(82vw, 360px) !important;
    aspect-ratio: 1 / 1;
    padding: 10px !important;
    background: #34363d !important;
    gap: 10px !important;
  }

  html.tg-game-page[data-game-page="2048"] .cell {
    width: auto !important;
    height: auto !important;
    aspect-ratio: 1 / 1;
    border-radius: 16px !important;
    font-size: clamp(18px, 4vw, 28px) !important;
  }

  html.tg-game-page[data-game-page="minesweeper"] #board {
    display: grid !important;
    grid-template-columns: repeat(8, minmax(0, clamp(34px, 9vw, 48px))) !important;
    gap: clamp(4px, 1.2vw, 6px) !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
  }

  html.tg-game-page[data-game-page="minesweeper"] .cell {
    width: clamp(34px, 9vw, 48px) !important;
    height: clamp(34px, 9vw, 48px) !important;
    background: #43464e !important;
    color: #fff !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 12px !important;
    font-size: clamp(16px, 3vw, 22px) !important;
  }

  html.tg-game-page[data-game-page="minesweeper"] .cell.open {
    background: #292b30 !important;
  }

  html.tg-game-page[data-game-page="minesweeper"] .cell.mine {
    background: #ff6b6b !important;
  }

  @media (max-width: 768px) {
    html.tg-game-page header {
      min-height: 88px;
      padding: 14px 16px !important;
    }

    html.tg-game-page header h1 {
      padding: 0 92px;
      font-size: 17px !important;
    }

    html.tg-game-page .back-button {
      left: 16px !important;
      min-height: 50px;
      padding: 0 20px !important;
      border-radius: 16px !important;
      font-size: 15px !important;
    }

    html.tg-game-page .instructions {
      width: min(calc(100% - 20px), 100%);
      padding: 13px 15px !important;
      border-radius: 14px !important;
      font-size: 15px !important;
    }

    html.tg-game-page #gameContainer,
    html.tg-game-page #pongContainer,
    html.tg-game-page #tetrisContainer,
    html.tg-game-page #boardContainer,
    html.tg-game-page #mineContainer {
      width: min(calc(100% - 20px), 100%) !important;
      padding: 14px !important;
      margin-bottom: 20px !important;
      border-radius: 22px !important;
    }

    html.tg-game-page[data-game-page="tetris"] #tetrisCanvas {
      width: min(58vw, 220px) !important;
      max-width: 220px !important;
    }

    html.tg-game-page[data-game-page="2048"] #board {
      width: min(84vw, 330px) !important;
      height: min(84vw, 330px) !important;
      gap: 8px !important;
      padding: 8px !important;
    }
  }
</style>
<script id="shared-telegram-safe-area-script">
  (function waitForTelegram() {
    const tg = window.Telegram && window.Telegram.WebApp;
    const root = document.documentElement;
    const rawPath = window.location.pathname || "/";
    const pathname = rawPath.replace(/\/+$/, "") || "/";
    const isHome = pathname === "/" || pathname === "/index.html";
    const pageId = isHome ? "home" : pathname.replace(/^\//, "").replace(/\.html$/, "");

    if (!isHome) {
      root.classList.add("tg-game-page");
      root.setAttribute("data-game-page", pageId);
    }

    if (!tg) {
      setTimeout(waitForTelegram, 50);
      return;
    }

    function px(value, fallback) {
      if (typeof value === "number" && isFinite(value) && value >= 0) {
        return value + "px";
      }
      return fallback;
    }

    function handleBack() {
      window.location.replace("/");
    }

    function bindReplaceNavigation() {
      if (window.__tgReplaceNavigationBound) return;
      window.__tgReplaceNavigationBound = true;

      document.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!link) return;

        if (isHome && link.classList.contains("game-link")) {
          event.preventDefault();
          window.location.replace(link.href);
          return;
        }

        if (!isHome && link.classList.contains("back-button")) {
          event.preventDefault();
          handleBack();
        }
      }, true);
    }

    function applyLayout() {
      const safe = tg.contentSafeAreaInset || tg.safeAreaInset || {};
      const isFullscreen = tg.isFullscreen === true;

      root.style.setProperty("--tg-viewport-height", px(tg.viewportHeight, "100vh"));
      root.style.setProperty("--tg-safe-top", px(safe.top, "env(safe-area-inset-top, 0px)"));
      root.style.setProperty("--tg-safe-right", px(safe.right, "env(safe-area-inset-right, 0px)"));
      root.style.setProperty("--tg-safe-bottom", px(safe.bottom, "env(safe-area-inset-bottom, 0px)"));
      root.style.setProperty("--tg-safe-left", px(safe.left, "env(safe-area-inset-left, 0px)"));
      root.classList.toggle("tg-fullscreen", !isHome && isFullscreen);

      if (typeof tg.setHeaderColor === "function") tg.setHeaderColor(isHome ? "#0b0e33" : "#4CAF50");
      if (typeof tg.setBackgroundColor === "function") tg.setBackgroundColor(isHome ? "#0b0e33" : "#1d1e22");
      if (typeof tg.setBottomBarColor === "function") tg.setBottomBarColor(isHome ? "#0b0e33" : "#1d1e22");

      if (tg.BackButton) {
        if (typeof tg.BackButton.offClick === "function") tg.BackButton.offClick(handleBack);
        if (!isHome && isFullscreen) {
          if (typeof tg.BackButton.onClick === "function") tg.BackButton.onClick(handleBack);
          if (typeof tg.BackButton.show === "function") tg.BackButton.show();
        } else if (typeof tg.BackButton.hide === "function") {
          tg.BackButton.hide();
        }
      }
    }

    tg.ready();
    bindReplaceNavigation();

    if (!isHome) {
      tg.expand();
      if (typeof tg.disableVerticalSwipes === "function") tg.disableVerticalSwipes();
    }

    applyLayout();
    setTimeout(applyLayout, 120);
    setTimeout(applyLayout, 400);
    setTimeout(applyLayout, 900);

    if (tg.onEvent) {
      tg.onEvent("viewportChanged", applyLayout);
      tg.onEvent("safeAreaChanged", applyLayout);
      tg.onEvent("contentSafeAreaChanged", applyLayout);
      tg.onEvent("fullscreenChanged", applyLayout);
    }

    window.addEventListener("resize", applyLayout, { passive: true });
    window.addEventListener("pageshow", applyLayout);
    window.addEventListener("focus", applyLayout);
    window.addEventListener("popstate", applyLayout);
    document.addEventListener("visibilitychange", applyLayout);
  })();
</script>`;

function injectSharedMarkup(html) {
  if (html.includes("<head>") && /<meta\s+name=["']viewport["']/i.test(html)) {
    html = html.replace(/<meta\s+name=["']viewport["'][^>]*>/i, TELEGRAM_VIEWPORT_META);
  } else if (html.includes("<head>")) {
    html = html.replace("<head>", `<head>\n${TELEGRAM_VIEWPORT_META}`);
  }

  if (html.includes('id="shared-layout-styles"')) return html;
  if (html.includes("</head>")) return html.replace("</head>", `${sharedLayoutMarkup}\n</head>`);
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
    const newRecord = new Record({ user_id, username, game_type, score });
    await newRecord.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/top/:gameType", async (req, res) => {
  try {
    const records = await Record.find({ game_type: req.params.gameType }).sort({ score: 1 }).limit(10);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => sendTemplate(res, "index.html"));
app.get("/2048.html", (req, res) => sendTemplate(res, "2048.html"));
app.get("/minesweeper.html", (req, res) => sendTemplate(res, "minesweeper.html"));
app.get("/pong.html", (req, res) => sendTemplate(res, "pong.html"));
app.get("/snake.html", (req, res) => sendTemplate(res, "snake.html"));
app.get("/tetris.html", (req, res) => sendTemplate(res, "tetris.html"));

app.use(express.static("templates"));

module.exports = app;
