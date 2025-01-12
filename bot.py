import logging
from telegram import Update, Bot, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

TOKEN = "7983006290:AAGGq-0BtQLKAncpMJZNKnYOJj5sgFpVtZw"
WEBAPP_URL = "https://example.com"  # адрес, где хостится ваше Flask-приложение

logging.basicConfig(level=logging.INFO)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Создаём кнопку, которая откроет веб-приложение
    button = KeyboardButton(
        text="Открыть мини-игры",
        web_app=WebAppInfo(url=WEBAPP_URL)
    )
    kb = ReplyKeyboardMarkup([[button]], resize_keyboard=True)
    
    await update.message.reply_text(
        "Привет! Нажми кнопку, чтобы открыть мини-игры:",
        reply_markup=kb
    )

def main():
    app = ApplicationBuilder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))

    print("Бот запущен...")
    app.run_polling()

if __name__ == "__main__":
    main()
