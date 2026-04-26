import nodemailer from "nodemailer";

const requiredEnvVars = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "CONTACT_RECEIVER_EMAIL",
];

function assertEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

function createTransporter() {
  assertEnv();

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendContactEmail({ name, email, subject, message }) {
  const transporter = createTransporter();
  const to = process.env.CONTACT_RECEIVER_EMAIL;
  const from = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  const safeSubject = subject?.trim() || "New Contact Form Message";
  const formattedMessage = message.replace(/\n/g, "<br />");

  const textBody = [
    "New message from Traffixion contact form",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${safeSubject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">New Contact Form Message</h2>
      <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 0 0 16px;"><strong>Subject:</strong> ${safeSubject}</p>
      <p style="margin: 0 0 8px;"><strong>Message:</strong></p>
      <div style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
        ${formattedMessage}
      </div>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    replyTo: email,
    subject: `Traffixion Contact Form - ${safeSubject}`,
    text: textBody,
    html: htmlBody,
  });
}
