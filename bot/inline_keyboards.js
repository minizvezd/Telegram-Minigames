
const main_menu = { reply_markup: {
    inline_keyboard: [ 
        [{text: "Мини игры", web_app: { url: "https://telegram-minigames.vercel.app/?user_id=${ctx.from.id}&username=${ctx.from.username}"}}, 
         {text: "Топ игроков", callback_data: "top"}],
        [{text: "Сапер", callback_data: "minesweeper"}]
    ]
}};

const select_game = { reply_markup: {
    inline_keyboard: [
        [{text: "2048", callback_data: "2048_top"},
        {text: "Сапер", callback_data: "minesweeper_top"}, 
        {text: "Пинг понг", callback_data: "pong_top"}],
        [{text: "Змейка", callback_data: "snake_top"}, 
        {text: "Тетрис", callback_data: "tetris_top"}],
        [{text: "Вернутся назад", callback_data: "back_main"}]
    ]
}};

module.exports = {main_menu, select_game};