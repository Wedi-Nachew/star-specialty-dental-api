const { Markup } = require("telegraf");

const menuText = () => {
    return [
        "🦷 <b>Star Speciality Dental Clinic</b>",
        "━━━━━━━━━━━━━━━",
        "",
        "Manage your appointments 👇",
    ].join("\n");
};

const menuKeyboard = () => {
    return Markup.inlineKeyboard([
        [
            Markup.button.callback("📅 Today", "today:0"),
            Markup.button.callback("📅 Tomorrow", "tmrw:0"),
        ],
        [
            Markup.button.callback("📊 This Week", "week:0"),
            Markup.button.callback("⏳ Pending", "pend:0"),
        ],
        [Markup.button.callback("📈 Stats", "stats")],
    ]);
};

const sendMenu = async (ctx) => {
    await ctx.reply(menuText(), {
        parse_mode: "HTML",
        ...menuKeyboard(),
    });
};

const editToMenu = async (ctx) => {
    await ctx.editMessageText(menuText(), {
        parse_mode: "HTML",
        ...menuKeyboard(),
    });
};

module.exports = { sendMenu, editToMenu, menuKeyboard };
