// server.js
import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// const OPENAI_API_KEY = "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";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const PORT = 5000;
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

/* ---------------- OpenAI Helpers ---------------- */
const askOpenAI = async (text) => {
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: text }],
      temperature: 0.7,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`OpenAI Chat error: ${errText}`);
  }

  const data = await resp.json();
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
};

const transcribeAudio = async (buffer, filename = 'audio.wav') => {
  const form = new FormData();
  form.append('file', buffer, { filename });
  form.append('model', 'whisper-1');

  const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Whisper error: ${errText}`);
  }

  const data = await resp.json();
  return data.text || '';
};

/* ---------------- Main Endpoint ---------------- */
app.post('/api/chat', upload.single('file'), async (req, res) => {
  try {
    let inputText = req.body.text || '';

    if (req.file) {
      const mime = req.file.mimetype;

      if (mime.startsWith('audio/')) {
        // Transcribe audio using Whisper
        inputText = await transcribeAudio(req.file.buffer, req.file.originalname);
      } else if (mime.startsWith('image/')) {
        // IMPORTANT: OpenAI Chat API does not process images directly.
        // You can send a description prompt instead.
        return res.status(400).json({
          success: false,
          error: 'Image input not supported directly. Use text describing the image.'
        });
      } else {
        return res.status(400).json({ success: false, error: 'Unsupported file type' });
      }
    }

    if (!inputText) return res.status(400).json({ success: false, error: 'No text found' });

    const response = await askOpenAI(inputText);
    res.json({ success: true, input: inputText, response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* ---------------- Healthcheck ---------------- */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', provider: 'openai-only' });
});

/* ---------------- Start Server ---------------- */
app.listen(PORT, () => console.log(`🚀 Multimodal chatbot running on http://localhost:${PORT}`));
