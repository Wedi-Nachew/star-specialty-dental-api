const { Markup } = require("telegraf");
const db = require("../db");
const {
    esc,
    formatDate,
    statusIcon,
    shortId,
    todayStr,
    dateOffsetStr,
} = require("./helpers");

const PAGE_SIZE = 5;

// Fetch data by list type
const getListData = async (type) => {
    switch (type) {
        case "today":
            return await db.getBookingsByDate(todayStr());
        case "tmrw":
            return await db.getBookingsByDate(dateOffsetStr(1));
        case "week":
            return await db.getBookingsByDateRange(
                todayStr(),
                dateOffsetStr(7),
            );
        case "pend":
            return await db.getPendingBookings();
        default:
            return [];
    }
};

// List title
const getListTitle = (type) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const titles = {
        today: `📅 <b>TODAY</b> — ${formatDate(todayStr())}`,
        tmrw: `📅 <b>TOMORROW</b> — ${formatDate(dateOffsetStr(1))}`,
        week: `📊 <b>THIS WEEK</b>`,
        pend: `⏳ <b>PENDING</b>`,
    };

    return titles[type] || "📋 <b>BOOKINGS</b>";
};

// Build list message
const showList = async (ctx, type, page) => {
    const allData = await getListData(type);
    const totalItems = allData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    // clamp page number
    page = Math.max(0, Math.min(page, totalPages - 1));

    const pageData = allData.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // Build message text
    let text = getListTitle(type) + "\n";
    text += "━━━━━━━━━━━━━━\n\n";

    if (totalItems === 0) {
        text += "No appointments found 📭\n";
    } else {
        pageData.forEach((b, i) => {
            const num = page * PAGE_SIZE + i + 1;
            const icon = statusIcon(b.status);
            text += `${num}. ${icon} <b>${esc(b.patient_name)}</b>\n`;
            text += `   ${esc(b.service)} · ${formatDate(b.preferred_date)}\n`;
            text += `   ${b.preferred_time || "Flexible"}\n\n`;
        });
    }
    text += `━━━━━━━━━━━━━━━\n`;
    text += `📊 Total: ${totalItems} appointments`;

    // Build inline keyboard
    const buttons = [];

    // Each item button
    pageData.forEach((b, i) => {
        buttons.push([
            Markup.button.callback(
                `👤 ${b.patient_name} — ${b.service}`,
                `d:${shortId(b.id)}:${type}:${page}`,
            ),
        ]);
    });

    // Pagination row
    if (totalPages > 1) {
        const navRow = [];

        if (page > 0) {
            navRow.push(
                Markup.button.callback("◀️ Prev", `${type}:${page - 1}`),
            );
        }

        navRow.push(
            Markup.button.callback(`${page + 1}/${totalPages}`, "noop"),
        );

        if (page < totalPages - 1) {
            navRow.push(
                Markup.button.callback("Next ▶️", `${type}:${page + 1}`),
            );
        }

        buttons.push(navRow);
    }

    // Back to Menu
    buttons.push([Markup.button.callback("🏠 Back to Menu", "menu")]);

    const keyboard = Markup.inlineKeyboard(buttons);

    await ctx.editMessageText(text, {
        parse_mode: "HTML",
        ...keyboard,
    });
};

module.exports = {
    showList,
};
