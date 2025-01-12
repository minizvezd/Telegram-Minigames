from flask import Flask, render_template, request
import os

app = Flask(__name__)

# Главная страница со списком игр
@app.route("/")
def index():
    return render_template("index.html")

# Змейка
@app.route("/snake")
def snake():
    return render_template("snake.html")

# Тетрис
@app.route("/tetris")
def tetris():
    return render_template("tetris.html")

# Pong
@app.route("/pong")
def pong():
    return render_template("pong.html")

# 2048
@app.route("/2048")
def game_2048():
    return render_template("game_2048.html")

# Сапёр
@app.route("/minesweeper")
def minesweeper():
    return render_template("minesweeper.html")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
