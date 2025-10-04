// server.js
import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Google Gemini API key
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyAv7FWhshpknycydih7-opYppqaE-yVWXg";

const PORT = process.env.PORT || 5000;
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

/* ---------------- Google Gemini Helpers ---------------- */
const askGoogle = async (text) => {
  const model = 'gemini-2.5-flash';  // use a valid Gemini model
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }] }],
        // optionally, you can include generationConfig etc.
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Google Gemini error: ${errText}`);
  }

  const data = await resp.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text
    || 'Sorry, I could not generate a response.';
};


/* ---------------- Main Endpoint ---------------- */
app.post('/api/chat', upload.single('file'), async (req, res) => {
  try {
    let inputText = req.body.text || '';

    if (req.file) {
      const mime = req.file.mimetype;

      if (mime.startsWith('audio/')) {
        return res.status(400).json({
          success: false,
          error: 'Audio transcription is not yet supported with Gemini API in this code.'
        });
      } else if (mime.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          error: 'Image input not supported directly here. Send a text description instead.'
        });
      } else {
        return res.status(400).json({ success: false, error: 'Unsupported file type' });
      }
    }

    if (!inputText)
      return res.status(400).json({ success: false, error: 'No text found' });

    const response = await askGoogle(inputText);
    res.json({ success: true, input: inputText, response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------- Healthcheck ---------------- */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', provider: 'google-gemini' });
});

/* ---------------- Start Server ---------------- */
app.listen(PORT, () =>
  console.log(`🚀 Gemini chatbot running on http://localhost:${PORT}`)
);
