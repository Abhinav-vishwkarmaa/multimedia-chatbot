const BASE_URL =
  (typeof process !== 'undefined' && (
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.REACT_APP_API_BASE_URL
  )) || 'http://localhost:5000';

const DEFAULT_TIMEOUT_MS = 30000;

async function requestJson(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const isJson = (response.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await response.json().catch(() => ({})) : {};

    if (!response.ok) {
      const message = data?.error || `HTTP ${response.status}`;
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

export default { checkHealth, sendText, sendImage, sendAudio };
