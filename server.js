const express = require("express");
const cors = require("cors");
const config = require("./config");
const path = require("path");
const { bot } = require("./bot");
const { success } = require("zod");

const app = express();

// app.use(cors({ origin: config.urls.frontend }));
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "Star Dental API",
        time: new Date().toISOString(),
    });
});

app.get("/test-email", async (req, res) => {
    const { sendBookingEmail } = require("./email");
    try {
        await sendBookingEmail({
            to: config.email.clinicEmail,
            patientName: "Test Patient",
            service: "Dental Cleaning",
            date: "2025-04-15",
            time: "10:00 AM",
        });
        res.json({
            success: true,
            message: `Test email sent to ${config.email.clinicEmail} successfully`,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Telegram webhook endpoint
app.post("/api/telegram-webhook", (req, res) => {
    // Verify the request is from Telegram
    const secret = req.headers["x-telegram-bot-api-secret-token"];
    if (secret !== config.bot.webhookSecret) {
        return res.statusStatus(401);
    }

    // Let telegraf handle the update
    bot.handleUpdate(req.body).catch((err) => console.error("Bot error:", err));

    // Send 200 quickely
    res.sendStatus(200);
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    console.log(`Webhook path: ${config.urls.app}/api/telegram-webhook`);
});
