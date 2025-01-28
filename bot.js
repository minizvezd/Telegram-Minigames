const {Telegraf} = require('telegraf');
const {main_menu, select_game} = require('./bot/inline_keyboards');
const {connectDB, Record} = require('./db');

connectDB();

const bot = new Telegraf("7983006290:AAGGq-0BtQLKAncpMJZNKnYOJj5sgFpVtZw");

bot.command('start', (ctx) => {
    ctx.reply('Все мои возможности', main_menu);
});


bot.on('callback_query', (ctx) => {
    const callbackData = ctx.callbackQuery.data;

    const actions = {
        "top": () => ctx.editMessageText("Выберите игру: ", select_game),

        "minesweeper_top": () => {
            try {
                const gameType = "minesweeper";
                const records = Record.find({ game_type: gameType})
                    .sort({score: 1}).limit(10);
                
                let message = `🏆 Топ-10 (${gameType}):\n`;

                records.forEach((record, index) => {
                    message += `${index + 1}. @${record.username || 'anon'}: ${record.score}s\n`;});
                
                ctx.reply(message);

            } catch (error) {
                console.error(err);
                ctx.reply("Ошибка получения топа игроков");
            }
        },
        "minesweeper": () => {
            ctx.reply('Играть в сапёра', {
                reply_markup: {
                  inline_keyboard: [[{
                    text: 'Играть',
                    url: `https://telegram-minigames.vercel.app/minesweeper.html?user_id=${ctx.from.id}&username=${ctx.from.username}`
                  }]]
                }
              });
        },


        "back_main": () => ctx.editMessageText('Все мои возможности', main_menu)
    };

    if (actions[callbackData]) {
        actions[callbackData]();
    }

    ctx.answerCbQuery();

});

bot.launch();


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));