import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express from "express";
import cors from "cors";
import { sendContactEmail } from "./mailService.js";

// ----------------------
// Logger
// ----------------------
const logger = {
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  info: (message) => console.log(`[INFO] ${message}`),
};

// ----------------------
// App Setup
// ----------------------
const app = express();
const port = Number(process.env.PORT) || 8000;

// ----------------------
// CORS CONFIG (FIXED)
// ----------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://traffixion.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / server-to-server (no origin)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

// IMPORTANT: handle preflight requests
app.options("*", cors());

app.use(express.json());

// ----------------------
// Validation
// ----------------------
function validateContactPayload(payload) {
  const name = payload?.name?.trim();
  const email = payload?.email?.trim();
  const subject = payload?.subject?.trim() || "";
  const message = payload?.message?.trim();

  if (!name || !email || !message) {
    return { isValid: false, error: "Name, email, and message are required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please provide a valid email address." };
  }

  return {
    isValid: true,
    value: { name, email, subject, message },
  };
}

// ----------------------
// Routes
// ----------------------
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/status", (_req, res) => {
  const requiredEnvVars = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "CONTACT_RECEIVER_EMAIL",
  ];

  const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

  res.json({
    status: "online",
    deployment: {
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      port,
    },
    configuration: {
      corsEnabled: true,
      allowedOrigins,
      environmentConfigured: missingVars.length === 0,
      missingVariables: missingVars.length > 0 ? missingVars : null,
    },
  });
});

app.post("/api/contact", async (req, res) => {
  const result = validateContactPayload(req.body);

  if (!result.isValid) {
    return res.status(400).json({ ok: false, message: result.error });
  }

  try {
    await sendContactEmail(result.value);
    return res
      .status(200)
      .json({ ok: true, message: "Message sent successfully." });
  } catch (error) {
    logger.error("Failed to send contact email:", error);

    return res.status(500).json({
      ok: false,
      message: "Unable to send message right now. Please try again later.",
    });
  }
});

// ----------------------
// Start Server
// ----------------------
app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});