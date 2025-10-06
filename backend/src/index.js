// server.js
import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();

/* ---------------- MongoDB Connection ---------------- */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ---------------- Constants ---------------- */
const GOOGLE_API_KEY =
  process.env.GOOGLE_API_KEY ||
  "AIzaSyBFUEVTvwV-SwjG-xiMW3NAKLZYn8R2weY";
const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- Routes ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);

/* ---------------- Serve Static Files ---------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../frontend/build")));

/* ---------------- Gemini Response Formatter ---------------- */
const formatGeminiResponse = (response) => {
  if (!response || typeof response !== "string") return [];

  // Split by lines and remove empty lines
  const lines = response.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  const formatted = [];

  lines.forEach((line) => {
    const regex = /\$(.+?)\$/g; // match $...$ math blocks
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const beforeMath = line.slice(lastIndex, match.index).trim();
      if (beforeMath) formatted.push({ type: "text", content: beforeMath });

      formatted.push({ type: "math", content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    const after = line.slice(lastIndex).trim();
    if (after) formatted.push({ type: "text", content: after });
  });

  return formatted;
};

/* ---------------- Google Gemini Helper ---------------- */
const askGoogle = async (input) => {
  const model = "gemini-2.5-flash"; // Keep same model

  // Detect if input is plain text or structured parts
  const contents =
    typeof input === "string"
      ? [{ role: "user", parts: [{ text: input }] }]
      : [{ role: "user", parts: input }];

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Google Gemini error: ${errText}`);
  }

  const data = await resp.json();
  console.log("📩 Gemini API Response:", JSON.stringify(data, null, 2));

  const rawText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I could not generate a response.";

  // Format response into structured array
  return formatGeminiResponse(rawText);
};

/* ---------------- Chat Endpoint ---------------- */
app.post("/api/chat", upload.single("file"), async (req, res) => {
  try {
    const inputText = req.body.text?.trim() || "";
    const file = req.file;
    const parts = [];

    // Ensure at least one input type
    if (!inputText && !file) {
      return res.status(400).json({
        success: false,
        error: "Please provide text, image, or audio input.",
      });
    }

    // Add text input
    if (inputText) parts.push({ text: inputText });

    // Handle file input
    if (file) {
      const mime = file.mimetype;
      let base64Data;

      if (file.buffer) {
        base64Data = file.buffer.toString("base64");
      } else if (file.path) {
        const fileData = fs.readFileSync(file.path);
        base64Data = fileData.toString("base64");
        fs.unlinkSync(file.path);
      } else {
        return res.status(400).json({
          success: false,
          error: "Invalid file data received.",
        });
      }

      if (mime.startsWith("image/") || mime.startsWith("audio/")) {
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: mime,
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "Unsupported file type. Only image or audio allowed.",
        });
      }
    }

    // Always pass 'parts' array to Gemini
    const response = await askGoogle(parts);

    res.json({
      success: true,
      input: inputText || (file ? file.originalname : "No input"),
      response, // now an array of { type, content }
    });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
});

/* ---------------- Healthcheck ---------------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok", provider: "google-gemini" });
});

/* ---------------- Catch-all Handler: Send back React's index.html file ---------------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});

/* ---------------- Start Server ---------------- */
app.listen(PORT, () => {
  console.log(`🚀 Gemini chatbot running on http://localhost:${PORT}`);
});
