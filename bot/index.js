const { Markup, Telegraf } = require("telegraf");
const config = require("../config");
const { isAuthorized } = require("./helpers");
const { sendMenu, editToMenu } = require("./menu");

const bot = new Telegraf(config.bot.token);

// Start command handler
bot.command("start", async (ctx) => {
    if (!isAuthorized(ctx)) {
        return ctx.reply(
            "🦷 Staff only. Book at: stardentalclinicmk.netlify.app",
        );
    }
    await sendMenu(ctx);
});

// Menu button handler
bot.action("menu", async (ctx) => {
    await ctx.answerCbQuery();
    await editToMenu(ctx);
});

// Block unAuthorized users from using the bot
bot.on("message", async (ctx) => {
    if (!isAuthorized(ctx)) {
        ctx.reply(
            "🦷 Staff only.\nBook at our website stardentalclinicmk.netlify.app",
        );
    }
});

module.exports = { bot };
