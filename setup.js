require("dotenv").config();
const { set } = require("zod");
const config = require("./config");

const setupWebhook = async () => {
    const webhookUrl = `${config.urls.app}/api/telegram-webhook`;

    console.log("Setting webhook to:", webhookUrl);
    console.log("Using bot token:", config.bot.token.substring(0, 10) + "...");

    // Step 1: Delete any existing webhook
    console.log("\n1. Deleting old webhook...");
    const deleteRes = await fetch(
        `https://api.telegram.org/bot${config.bot.token}/deleteWebhook`,
    );

    const deleteResult = await deleteRes.json();
    console.log("   Result:", deleteResult);

    // Step 2: Set new webhook
    console.log("\n2. Setting new webhook...");
    const setRes = await fetch(
        `https://api.telegram.org/bot${config.bot.token}/setWebhook`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                url: webhookUrl,
                secret_token: config.bot.webhookSecret,
                allowed_updates: ["message", "callback_query"],
            }),
        },
    );
    const setResult = await setRes.json();
    console.log("   Result:", setResult);

    // Step 3: Verify webhook info
    console.log("\n3. Verifying...");
    const infoRes = await fetch(
        `https://api.telegram.org/bot${config.bot.token}/getWebhookInfo`,
    );
    const info = await infoRes.json();
    console.log("   Webhook URL:", info.result.url);
    console.log("   Pending updates:", info.result.pending_update_count);
    console.log("   Last error:", info.result.last_error_message || "None");

    if (setResult.ok) {
        console.log("\n✅ Webhook set successfully!");
        console.log("Go message your bot on Telegram to test.");
    } else {
        console.log("\n❌ Webhook setup failed!");
        console.log("Common issues:");
        console.log("  - APP_URL must be HTTPS (not http)");
        console.log("  - APP_URL must be publicly accessible");
        console.log("  - BOT_TOKEN must be correct");
    }
};

setupWebhook().catch((err) => console.log(err));
