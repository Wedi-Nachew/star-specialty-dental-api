const { Markup } = require("telegraf");
const db = require("../db");
const { sendStatusEmail } = require("../email");
const { esc, formatDate, statusIcon, nowTime } = require("./helpers");

// Show detail
const showDetail = async (ctx, bookingShortId, source, page) => {
    const booking = await db.getBookingByShortId(bookingShortId);

    if (!booking) {
        await ctx.editMessageText("❌ Booking not found.", {
            ...Markup.inlineKeyboard([
                [Markup.button.callback("🏠 Back to Menu ", `menu`)],
            ]),
        });

        return;
    }

    const text = buildDetailText(booking);
    const keyboard = buildDetailKeyboard(booking, source, page);

    await ctx.editMessageText(text, {
        parse_mode: "HTML",
        ...keyboard,
    });
};

// Build detail text
const buildDetailText = (bookingArray) => {
    const b = Array.isArray(bookingArray) ? bookingArray[0] : bookingArray;
    return [
        `🦷 <b>Appointment Detail</b>`,
        `━━━━━━━━━━━━━`,
        ``,
        `👤 <b>${esc(b.patient_name)}</b>`,
        `📞 ${esc(b.patient_phone)}`,
        `✉️ ${b.patient_email ? esc(b.patient_email) : "No email"}`,
        ``,
        `🏥 <b>${esc(b.service)}</b>`,
        `📅 ${formatDate(b.preferred_date)}`,
        `🕐 ${b.preferred_time || "Flexible"}`,
        b.message ? `💬 "${esc(b.message)}"` : "",
        ``,
        `Status: ${statusIcon(b.status)} <b>${b.status.toUpperCase()}</b>`,
        `━━━━━━━━━━━━━`,
    ]
        .filter(Boolean)
        .join("\n");
};

// Build detail keyboard
const buildDetailKeyboard = (booking, source, page) => {
    const b = Array.isArray(booking) ? booking[0] : booking;
    const sid = b.id.substring(0, 8);
    const cleanPhone = (b.patient_phone || "").replace(/[^\d]/g, "");
    const buttons = [];

    // Contact buttons always shown
    buttons.push([
        Markup.button.url("📧 Message TG", `tg://resolve?phone=${cleanPhone}`),
        Markup.button.url(
            "📞 Call",
            `https://sundentalclinicmk.netlify.app/${cleanPhone}`,
        ),
    ]);

    // Action buttons based on status
    if (b.status === "pending") {
        buttons.push([
            Markup.button.callback("✅ Confirm", `cf:${sid}:${source}:${page}`),
            Markup.button.callback("❌ Cancel", `cn:${sid}:${source}:${page}`),
        ]);
    } else if (b.status === "confirmed") {
        buttons.push([
            Markup.button.callback(
                "✅ Completed",
                `cp:${sid}:${source}:${page}`,
            ),
            Markup.button.callback("❌ Cancel", `cn:${sid}:${source}:${page}`),
        ]);
    }

    // Back button
    if (source === "notif") {
        buttons.push([Markup.button.callback("🏠 Back to Menu", `menu`)]);
    } else {
        buttons.push([
            Markup.button.callback("🔙 Back to List", `${source}:${page}`),
            Markup.button.callback("🏠 Back to Menu", `menu`),
        ]);
    }

    return Markup.inlineKeyboard(buttons);
};

// handle status update
const handleStatusUpdate = async (
    ctx,
    bookinShortId,
    newStatus,
    source,
    page,
) => {
    try {
        const booking = await db.getBookingByShortId(bookinShortId);
        if (!booking) {
            await ctx.answerCbQuery(
                "❌ Booking not found.",
                // , {show_alert: true}
            );
            return;
        }

        // Update status in DB
        const updated = await db.updateBookingStatus(booking.id, newStatus);

        // Send Status update email to patient
        if (updated.patient_email) {
            try {
                await sendStatusEmail({
                    to: updated.patient_email,
                    patientName: updated.patient_name,
                    service: updated.service,
                    date: updated.preferred_date,
                    time: updated.preferred_time,
                    status: newStatus,
                });
            } catch (error) {
                console.error("Failed to send status email:", error);
            }
        }

        await ctx.answerCbQuery(`${statusIcon(newStatus)} ${newStatus}`);

        // Refresh the detail view
        await showDetail(ctx, bookinShortId, source, page);
    } catch (error) {
        console.log("Status change error: ", error);
        await ctx.answerCbQuery("Error updating status");
    }
};

module.exports = {
    showDetail,
    handleStatusUpdate,
    buildDetailText,
    buildDetailKeyboard,
};
