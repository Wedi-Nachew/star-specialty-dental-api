const { Telegraf } = require("telegraf");
const config = require("../config");
const { isAuthorized } = require("./helpers");
const { sendMenu, editToMenu } = require("./menu");
const { showList } = require("./list");
const { showDetail, handleStatusUpdate } = require("./detail");
const { showStats } = require("./stats");

const bot = new Telegraf(config.bot.token);

// /start command handler
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

// Lists
// Pattern: type:page (e.g. today:1, tmrw:2, week:1, pend:3)
bot.action(/^(today|tmrw|week|pend):(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const type = ctx.match[1];
    const page = parseInt(ctx.match[2]);
    await showList(ctx, type, page);
});

// Detail
// Pattern: d:shortId:source:page
bot.action(/^d:([^:]+):([^:]+):(\d+)$/, async (ctx) => {
    await ctx.answerCbQuery();
    const [, bookingShortId, source, page] = ctx.match;
    await showDetail(ctx, bookingShortId, source, parseInt(page));
});

// Status update
// cf = confirm, cn = cancel, cp = complete
bot.action(/^cf:([^:]+):([^:]+):(\d+)$/, async (ctx) => {
    const [, sid, source, page] = ctx.match;
    await handleStatusUpdate(ctx, sid, "confirmed", source, parseInt(page));
});

bot.action(/^cn:([^:]+):([^:]+):(\d+)$/, async (ctx) => {
    const [, sid, source, page] = ctx.match;
    await updateStatus(ctx, sid, "canceled", source, parseInt(page));
});

bot.action(/^cp:([^:]+):([^:]+):(\d+)$/, async (ctx) => {
    const [, sid, source, page] = ctx.match;
    await handleStatusUpdate(ctx, sid, "completed", source, parseInt(page));
});

// Stats
bot.action("stats", async (ctx) => {
    await ctx.answerCbQuery();
    await showStats(ctx);
});

// conatct noted
bot.action("contact_noted", async (ctx) => {
    await ctx.answerCbQuery("✅ Noted");
    const originalText = ctx.callbackQuery.message.text;
    await ctx.editMessageText(originalText + "\n\n✅ <b>NOTED</b>", {
        parse_mode: "HTML",
    });
});

// Noop
bot.on("noop", (ctx) => ctx.answerCbQuery());

// Block unAuthorized users from using the bot
bot.on("message", async (ctx) => {
    if (!isAuthorized(ctx)) {
        ctx.reply(
            "🦷 Staff only.\nBook at our website stardentalclinicmk.netlify.app",
        );
    }
});

module.exports = { bot };
