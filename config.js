require("dotenv").config();

module.exports = {
    port: process.env.PORT || 3000,

    supabase: {
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_KEY,
    },

    bot: {
        token: process.env.TELEGRAM_BOT_TOKEN,
        chatId: process.env.TELEGRAM_CHAT_ID,
        webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    },

    email: {
        resendKey: process.env.RESEND_API_KEY,
        clinicEmail: process.env.CLINIC_EMAIL,
    },

    admin: {
        key: process.env.ADMIN_KEY,
    },

    urls: {
        app: process.env.APP_URL,
        frontend: process.env.FRONTEND_URL,
    },
};
