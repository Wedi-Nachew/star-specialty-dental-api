const { date } = require("zod");
const config = require("../config");

// Check if message is from authorized chat
const isAuthorized = (ctx) => ctx.chat?.id?.toString() === config.bot.chatId;

// Escape HTML for Telegram messages
const esc = (text) => {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

// Fromat date for display
const formatDate = (dateStr) => {
    if (!dateStr) return "Flexible";

    return new Date(dateStr).toLocaleDateString("en-GB", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
};

// Get todays date in YYYY-MM-DD format
const todayStr = () => new Date().toISOString().split("T")[0];

// Get date string offset by days
const dateOffsetStr = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
};

// Get current time in East Africa Time (EAT)
const nowTime = () => {
    return new Date().toLocaleTimeString("en-GB", {
        timeZone: "Africa/Nairobi",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const shortId = (id) => id.substring(0, 8);

const statusIcon = (status) => {
    const icons = {
        pending: "⏳",
        confirmed: "✅",
        cancelled: "❌",
        completed: "⭐",
    };

    return icons[status] || "❓";
};

module.exports = {
    isAuthorized,
    esc,
    formatDate,
    todayStr,
    dateOffsetStr,
    nowTime,
    shortId,
    statusIcon,
};
