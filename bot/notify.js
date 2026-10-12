const { Markup } = require("telegraf");
const config = require("../config");
const { esc, formatDate, nowTime, shortId } = require("./helpers");

// New booking notification
// This sends a notification not an edit

const notifyNewBooking = async (bot, booking) => {
    const cleanPhone = booking.patient_phone.replace(/[\s\-\(\)\+]/g, "");
    const sid = shortId(booking.id);

    const text = [
        `🦷 <b>NEW APPOINTMENT</b>`,
        `━━━━━━━━━━━━━━━`,
        ``,
        `👤 <b>${esc(booking.patient_name)}</b>`,
        `📞 ${esc(booking.patient_phone)}`,
        `✉️ ${booking.patient_email ? esc(booking.patient_email) : "No email"}`,
        ``,
        `🏥 ${esc(booking.service)}`,
        `📅 ${formatDate(booking.preferred_date)}`,
        `🕐 ${booking.preferred_time || "Flexible"}`,
        booking.message ? `💬 "${esc(booking.message)}"` : "",
        ``,
        `⏰ ${nowTime()}`,
    ]
        .filter(Boolean)
        .join("\n");

    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.url(
                "💬 Message TG",
                `tg://resolve?phone=${cleanPhone}`,
            ),
            Markup.button.url("📞 Call", `tel:+${cleanPhone}`),
        ],
        [
            Markup.button.callback("✅ Confirm", `cf:${sid}:notif:0`),
            Markup.button.callback("❌ Cancel", `cn:${sid}:notif:0`),
        ],
    ]);

    await bot.telegram.sendMessage(config.bot.chatId, text, {
        parse_mode: "HTML",
        ...keyboard,
    });
};

// Contact form notification
// Not saved in DB, just notify and email

const notifyContact = async (bot, contact) => {
    const cleanPhone = contact.phone
        ? contact.phone.replace(/[\s\-\+]/g, "")
        : "";

    const text = [
        `📨 <b>NEW MESSAGE</b>`,
        `━━━━━━━━━━━━━━━━━━`,
        ``,
        `👤 <b>${esc(contact.name)}</b>`,
        contact.phone ? `📞 ${esc(contact.phone)}` : "",
        contact.email ? `✉️ ${esc(contact.email)}` : "",
        ``,
        `💬 "${esc(contact.message)}"`,
        ``,
        `⏰ ${nowTime()}`,
    ]
        .filter(Boolean)
        .join("\n");

    const buttons = [];
    const contactRow = [];
    if (cleanPhone) {
        contactRow.push(
            Markup.button.url(
                "💬 Message TG",
                `tg://resolve?phone=${cleanPhone}`,
            ),
        );
        contactRow.push(Markup.button.url("📞 Call", `tel:+${cleanPhone}`));
    }
    if (contactRow.length > 0) buttons.push(contactRow);

    if (contact.email) {
        buttons.push([
            Markup.button.url("✉️ Reply Email", `mailto:${contact.email}`),
        ]);
    }

    buttons.push([Markup.button.callback("✅ Noted", "contact_noted")]);

    const keyboard = Markup.inlineKeyboard(buttons);

    await bot.telegram.sendMessage(config.bot.chatId, text, {
        parse_mode: "HTML",
        ...keyboard,
    });
};

module.exports = {
    notifyNewBooking,
    notifyContact,
};
