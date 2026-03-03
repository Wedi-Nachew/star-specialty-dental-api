// dev.js — LOCAL DEVELOPMENT ONLY
// Uses polling instead of webhook
// DO NOT use in production

const config = require("./config");
const { bot } = require("./bot");

console.log("Starting bot in polling mode...");
console.log("Press Ctrl+C to stop");

bot.launch()
    .then(() => console.log("✅ Bot is running! Message it on Telegram."))
    .catch((err) => {
        console.error("❌ Failed to start:", err.message);
        if (err.message.includes("409")) {
            console.log("HINT: Webhook is still active.");
            console.log("Run this first:");
            console.log(
                `  curl https://api.telegram.org/bot${config.bot.token}/deleteWebhook`,
            );
        }
    });

// Graceful shutdown
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
