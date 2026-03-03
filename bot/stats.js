const { Markup } = require("telegraf");
const db = require("../db");
const { todayStr, dateOffsetStr, formatDate } = require("./helpers");

const showStats = async (ctx) => {
    const stats = await db.getBookingStats();
    const todayBookings = await db.getBookingsByDate(todayStr());
    const tmrwBookings = await db.getBookingsByDate(dateOffsetStr(1));

    const todayConfirmed = todayBookings.filter(
        (b) => b.status === "confirmed",
    ).length;
    const todayPending = todayBookings.filter(
        (b) => b.status === "pending",
    ).length;

    const text = [
        `📈 <b>Statistics</b>`,
        `━━━━━━━━━━━━━`,
        ``,
        `📅 <b>Today (${formatDate(todayStr())}):</b>`,
        `   ✅ ${todayConfirmed} confirmed · ⏳ ${todayPending} pending`,
        ``,
        `📅 <b>Tomorrow:</b> ${tmrwBookings.length} ${tmrwBookings.length === 1 ? "appointment" : "appointments"}`,
        ``,
        `📊 <b>All Time:</b>`,
        `   Total: ${stats.total}`,
        `   ⏳ Pending: ${stats.pending}`,
        `   ✅ Confirmed: ${stats.confirmed}`,
        `   ✔️ Completed: ${stats.completed}`,
        `   ❌ Cancelled: ${stats.cancelled}`,
        ``,
        `━━━━━━━━━━━━━`,
    ].join("\n");

    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback("📅 Today", "today:0"),
            Markup.button.callback("⏳ Pending", "pend:0"),
        ],
        [Markup.button.callback("🏠 Menu", "menu")],
    ]);

    await ctx.editMessageText(text, {
        parse_mode: "HTML",
        ...keyboard,
    });
};

module.exports = { showStats };
