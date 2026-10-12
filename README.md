# Star Specialty Dental API & Telegram Management Bot

A Node.js backend API and Telegram bot management service for **Star Specialty Dental Clinic**. This system integrates an Express REST API, a Telegraf-powered Telegram staff bot, a Supabase PostgreSQL database, and Resend transactional email notifications to streamline patient bookings, notifications, and clinic management.

---

## 🌟 Key Features

### 1. Telegram Staff Bot (`/bot`)
- **Role-Based Authorization:** Restricts bot commands and interactions strictly to authorized clinic staff matching `TELEGRAM_CHAT_ID`.
- **Interactive Menu (`/start`):** Quick-action interface to inspect appointments:
  - 📅 **Today:** View appointments scheduled for today.
  - 📅 **Tomorrow:** View upcoming appointments for tomorrow.
  - 📊 **This Week:** View appointments scheduled within the next 7 days.
  - ⏳ **Pending:** Review all appointments awaiting confirmation.
  - 📈 **Statistics:** Instant overview of confirmed, pending, completed, cancelled, and total bookings.
- **Pagination & Detail View:** Browse booking lists in 5-item pages with direct shortcuts to patient details.
- **Direct Contact Shortcuts:** One-click links to message patients on Telegram (`tg://resolve?phone=...`) or initiate direct phone calls.
- **Status Workflow Actions:** Staff can update bookings (`Confirm`, `Cancel`, `Complete`) directly from inline buttons.
- **Real-Time Booking & Contact Alerts:** Instant alerts posted directly to staff chat when new bookings or website contact messages are submitted.

### 2. Transactional Emails (`email.js`)
- Powered by **Resend** with responsive branded HTML templates:
  - **Appointment Request:** Automatic acknowledgment to the patient upon submission.
  - **Status Updates:** Immediate patient notification when an appointment is confirmed, cancelled, or completed.
  - **Contact Form Alerts:** Forwards general inquiries directly to clinic staff.

### 3. Database Layer (`db.js`)
- Built on **Supabase** (PostgreSQL) for booking persistence and querying.
- Includes short-ID lookup (`get_booking_by_short_id`) for concise Telegram callback payloads.
- Date range filtering, status-based querying, and aggregate clinic metrics.

### 4. Express REST API (`server.js`)
- `GET /` — Health check endpoint reporting service status and timestamp.
- `GET /test-email` — Utility endpoint to verify Resend email delivery.
- `POST /api/telegram-webhook` — Telegram webhook receiver secured with `x-telegram-bot-api-secret-token` verification.

---

## 📁 Project Structure

```text
star-specialty-dental-api/
├── bot/
│   ├── detail.js       # Single booking detail view & status update handlers
│   ├── helpers.js      # Formatting, sanitization, authorization & date utilities
│   ├── index.js        # Telegraf bot configuration, routing & command handlers
│   ├── list.js         # Paginated appointment lists (today, tomorrow, week, pending)
│   ├── menu.js         # Interactive Telegram keyboard & main menu
│   ├── notify.js       # Real-time booking & contact form Telegram notification templates
│   └── stats.js        # Clinic booking statistics dashboard
├── config.js           # Centralized environment & app configuration
├── db.js               # Supabase database queries and CRUD operations
├── dev.js              # Local development script running bot in polling mode
├── email.js            # Resend transactional email templates and senders
├── package.json        # Dependencies and project metadata
├── server.js           # Express API server & Telegram webhook endpoint
├── setup.js            # Automated Telegram webhook registration script
├── .env.example        # Environment variable template
└── .gitignore          # Git exclusion rules
```

---

## ⚙️ Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Supabase Project:** Configured with a `bookings` table
- **Telegram Bot Token:** Obtained via [@BotFather](https://t.me/BotFather)
- **Resend API Key:** For transactional email notifications

---

## 🔐 Environment Variables

Create a `.env` file in the project root based on [`.env.example`](file:///d:/demos/star-specialty-dental-api/.env.example):

```env
# Server
PORT=3000
APP_URL=https://your-api-domain.com
FRONTEND_URL=https://your-frontend-domain.com

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_supabase_service_role_key

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
TELEGRAM_WEBHOOK_SECRET=your_custom_random_secret_token

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CLINIC_EMAIL=clinic@example.com

# Admin
ADMIN_KEY=your_secure_admin_key
```

### Environment Variable Reference

| Variable | Description |
|---|---|
| `PORT` | HTTP port the Express server listens on (default: `3000`) |
| `APP_URL` | Public HTTPS URL where the API is hosted (required for Telegram webhook) |
| `FRONTEND_URL` | Frontend client origin URL allowed in CORS |
| `SUPABASE_URL` | Base URL of your Supabase project |
| `SUPABASE_SECRET_KEY` | Supabase service role / API key |
| `TELEGRAM_BOT_TOKEN` | Bot authentication token from Telegram BotFather |
| `TELEGRAM_CHAT_ID` | Telegram chat ID / group ID authorized to manage appointments |
| `TELEGRAM_WEBHOOK_SECRET` | Secret token verified in `x-telegram-bot-api-secret-token` header |
| `RESEND_API_KEY` | API key from Resend for transactional email delivery |
| `CLINIC_EMAIL` | Clinic destination inbox for contact submissions and test alerts |
| `ADMIN_KEY` | Secret key for administrative actions |

---

## 🚀 Getting Started

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Wedi-Nachew/star-specialty-dental-api.git
cd star-specialty-dental-api
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Local Development (Polling Mode)

To run the bot locally without exposing a public HTTPS webhook endpoint, use the polling runner:

```bash
node dev.js
```

> **Note:** If you receive a `409 Conflict: can't use getUpdates method while webhook is active` error, delete the active webhook using:
> ```bash
> curl https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/deleteWebhook
> ```

### 4. Running the Web API Server

To start the Express server:

```bash
node server.js
```

### 5. Production Webhook Setup

When deploying to a public server (e.g. Render, Railway, VPS) with HTTPS configured in `APP_URL`:

```bash
node setup.js
```

This automatically:
1. Clears any pre-existing webhook.
2. Registers `${APP_URL}/api/telegram-webhook` with Telegram Bot API along with `secret_token`.
3. Verifies registration status and reports diagnostic information.

---

## 🗄️ Database Schema Reference

The project expects a `bookings` table in Supabase with the following structure:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary Key (Default: `gen_random_uuid()`) |
| `patient_name` | `text` | Patient full name |
| `patient_email` | `text` | Optional contact email |
| `patient_phone` | `text` | Contact phone number |
| `service` | `text` | Requested dental service |
| `preferred_date` | `date` | Preferred appointment date (`YYYY-MM-DD`) |
| `preferred_time` | `text` | Preferred time slot (e.g. `10:00 AM`, `Flexible`) |
| `message` | `text` | Patient notes or symptoms |
| `status` | `text` | `pending` \| `confirmed` \| `cancelled` \| `completed` |
| `created_at` | `timestamptz` | Record creation timestamp |

### Stored Procedure (`get_booking_by_short_id`)

For inline Telegram callback queries, the bot looks up records using the first 8 characters of UUIDs. In your Supabase SQL editor:

```sql
create or replace function get_booking_by_short_id(prefix text)
returns setof bookings as $$
  select * from bookings
  where id::text like prefix || '%'
  limit 1;
$$ language sql stable;
```

---

## 📄 License

ISC License.
