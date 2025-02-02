const express = require("express");
const path = require("path");
const cors = require("cors");
const { Record, connectDB } = require("./db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use(express.static("templates"));

app.post("/api/record", async (req, res) => {

  const { user_id, username, game_type, score} = req.body;

  if (!user_id || !username || !game_type || score == null) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  try {
    

    const newRecord = new Record({
      user_id,
      username,
      game_type,
      score
    });

    await newRecord.save();
    res.status(201).json({success: true});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});


app.get("/api/top/:gameType", async (req, res) => {
  try {
    const records = await Record.find({ game_type: req.params.gameType })
      .sort({ score: 1 })
      .limit(10);
    res.json(records);
  } catch (err) {
    res.status(500).json({error: err.message});
  }

});


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
