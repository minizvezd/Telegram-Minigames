const express = require("express");
const path = require("path");

const app = express();

// Настройка маршрутов
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/templates" + "/index.html"));
});

app.get("/2048.html", (req, res) => {
  res.sendFile(path.join(__dirname + "/templates" + "/2048.html"));
});

app.get("/minesweeper.html", (req, res) => {
  res.sendFile(path.join(__dirname + "/templates" + "/minesweeper.html"));
});

app.get("/pong.html", (req, res) => {
  res.sendFile(path.join(__dirname + "/templates" + "/pong.html"));
});

app.get("/snake.html", (req, res) => {
  res.sendFile(path.join(__dirname + "/templates" + "/snake.html"));
});

app.get("/tetris.html", (req, res) => {
  res.sendFile(path.join(__dirname + "/templates" + "/tetris.html"));
});

// Экспорт приложения для Vercel
module.exports = app;
