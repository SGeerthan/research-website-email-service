import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { sendContactEmail } from "./mailService.js";

dotenv.config();

const logger = {
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  info: (message) => console.log(`[INFO] ${message}`),
};

const app = express();
const port = Number(process.env.PORT) || 8000;
const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
  }),
);
app.use(express.json());

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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/contact", async (req, res) => {
  const result = validateContactPayload(req.body);

  if (!result.isValid) {
    return res.status(400).json({ ok: false, message: result.error });
  }

  try {
    await sendContactEmail(result.value);
    return res.status(200).json({ ok: true, message: "Message sent successfully." });
  } catch (error) {
    logger.error("Failed to send contact email:", error);
    return res.status(500).json({
      ok: false,
      message: "Unable to send message right now. Please try again later.",
    });
  }
});

app.listen(port, () => {
  logger.info(`Contact email service running on http://localhost:${port}`);
});
