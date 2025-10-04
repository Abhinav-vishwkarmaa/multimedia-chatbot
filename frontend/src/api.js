const BASE_URL =
  (typeof process !== 'undefined' && (
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_BASE_URL
  )) || 'http://localhost:5000';

const DEFAULT_TIMEOUT_MS = 30000;

async function requestJson(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Add authentication header if token exists
  const token = localStorage.getItem('multimodal-chatbot-token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await response.json().catch(() => ({})) : {};

    if (!response.ok) {
      const message = data?.message || data?.error || `HTTP ${response.status}`;
      return { success: false, error: message };
    }

    return { success: true, ...data };
  } catch (err) {
    const message = err.name === 'AbortError' ? 'Request timed out' : err.message || 'Network error';
    return { success: false, error: message };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function checkHealth() {
  return requestJson(`${BASE_URL}/health`, { method: 'GET' });
}

// Authentication APIs
export async function registerUser(userData) {
  return requestJson(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
}

export async function loginUser(credentials) {
  return requestJson(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
}

// Chat Management APIs
export async function getChats() {
  return requestJson(`${BASE_URL}/api/chats`, { method: 'GET' });
}

export async function createChat(chatData) {
  return requestJson(`${BASE_URL}/api/chats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatData)
  });
}

export async function updateChat(chatId, chatData) {
  return requestJson(`${BASE_URL}/api/chats/${chatId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(chatData)
  });
}

export async function deleteChat(chatId) {
  return requestJson(`${BASE_URL}/api/chats/${chatId}`, { method: 'DELETE' });
}

// AI Chat APIs (for sending messages and getting responses)
export async function sendText(text) {
  if (!text) return { success: false, error: 'Text is required' };
  const form = new FormData();
  form.append('text', text);
  return requestJson(`${BASE_URL}/api/chat`, { method: 'POST', body: form });
}

export async function sendImage(file) {
  if (!(file instanceof Blob)) return { success: false, error: 'Invalid image file' };
  const form = new FormData();
  form.append('file', file);
  return requestJson(`${BASE_URL}/api/chat`, { method: 'POST', body: form });
}

export async function sendAudio(file) {
  if (!(file instanceof Blob)) return { success: false, error: 'Invalid audio file' };
  const form = new FormData();
  form.append('file', file);
  return requestJson(`${BASE_URL}/api/chat`, { method: 'POST', body: form });
}

export default {
  checkHealth,
  registerUser,
  loginUser,
  getChats,
  createChat,
  updateChat,
  deleteChat,
  sendText,
  sendImage,
  sendAudio
};
