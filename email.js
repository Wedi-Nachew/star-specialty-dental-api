const { Resend } = require("resend");
const config = require("./config");

const resend = new Resend(config.email.resendKey);

// Booking confirmation email
const sendBookingEmail = async ({ to, patientName, service, date, time }) => {
    await resend.emails.send({
        from: "Star Specialty Dental <onboarding@resend.dev>",
        to,
        subject: "✅ Appointment Request — Star Specialty Dental",
        html: emailTemplate({
            title: "Appointment Request Received ✅",
            body: `
        <p>Dear ${patientName},</p>
        <p>We received your appointment request:</p>
        ${infoBox({ Service: service, Date: date || "Flexible", Time: time || "Flexible" })}
        <p>⏰ <strong>We'll confirm within 24 hours.</strong></p>
        <p>Urgent? Call: 📞 <strong>034-XXX-XXXX</strong></p>
      `,
        }),
    });
};

// Status update email (confirmed, canceled, completed)
const sendStatusEmail = async ({
    to,
    patientName,
    service,
    date,
    time,
    status,
}) => {
    const subjects = {
        confirmed: "✅ Appointment Confirmed — Star Specialty Dental",
        canceled: "❌ Appointment Canceled — Star Specialty Dental",
        completed: "✔️ Thank you — Star Specialty Dental",
    };

    const messages = {
        confirmed: `
      <p>Dear ${patientName},</p>
      <p>Your appointment has been <strong>confirmed</strong>! ✅</p>
      ${infoBox({ Service: service, Date: date || "Flexible", Time: time || "Flexible" })}
      <p>Please arrive 10 minutes early.</p>
      <p>Need to reschedule? Call: 📞 <strong>034-XXX-XXXX</strong></p>
    `,
        cancelled: `
      <p>Dear ${patientName},</p>
      <p>Your appointment has been <strong>cancelled</strong>.</p>
      ${infoBox({ Service: service, Date: date || "Flexible", Time: time || "Flexible" })}
      <p>To rebook, visit our website or call: 📞 <strong>034-XXX-XXXX</strong></p>
    `,
        completed: `
      <p>Dear ${patientName},</p>
      <p>Thank you for visiting Star Specialty Dental Clinic! ✔️</p>
      <p>We hope you had a great experience.</p>
      <p>For any follow-up needs: 📞 <strong>034-XXX-XXXX</strong></p>
    `,
    };

    await resend.emails.send({
        from: "Star Specialty Dental <onboarding@resend.dev>",
        to,
        subject: subjects[status] || "Update - Star Specialty Dental ",
        html: emailTemplate({
            title:
                subjects[status]?.replace(" - Star Specialty Dental", "") ||
                "Update",
            body:
                messages[status] || `<p>Your appointment status: ${status}</p>`,
        }),
    });
};

// Contact form
const sendContactEmail = async ({ name, email, phone, message }) => {
    await resend.emails.send({
        from: "Star Specialty Dental <onboarding@resend.dev>",
        to: config.email.clinicEmail,
        subject: `📩 New Message from ${name}`,
        html: emailTemplate({
            title: "New Contact Form Submission 📩",
            body: `<p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email || "Not provided"}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            `,
        }),
    });
};

const emailTemplate = ({ title, body }) => {
    return `
     <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto">
      <div style="background:#0D9488;color:white;padding:20px;
                  text-align:center;border-radius:10px 10px 0 0">
        <h2 style="margin:0">🦷 Star Specialty Dental Clinic</h2>
      </div>
      <div style="padding:20px;background:#f9f9f9;border:1px solid #eee;
                  border-radius:0 0 10px 10px">
        <h3>${title}</h3>
        ${body}
        <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
        <p style="color:#999;font-size:12px">
          Star Dental Clinic · Mekelle · Your smile, our priority 😊
        </p>
      </div>
    </div>
    `;
};

const infoBox = (fields) => {
    const rows = Object.entries(fields)
        .map(
            ([key, value]) =>
                `<p style="margin:4px 0"><strong>${key}:</strong> ${value}</p>`,
        )
        .join("");

    return `<div style="background:white;padding:12px;border-radius:8px;
                      margin:12px 0;border:1px solid #eee">${rows}</div>`;
};

module.exports = {
    sendBookingEmail,
    sendStatusEmail,
    sendContactEmail,
};
