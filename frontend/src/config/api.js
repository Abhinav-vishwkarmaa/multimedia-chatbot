// API Configuration
export const API_CONFIG = {
  // Replace with your actual API endpoint
  BASE_URL: 'http://localhost:8000/api', // or 'https://your-api-domain.com/api'
  
  // API endpoints
  ENDPOINTS: {
    CHAT: '/chat',
    UPLOAD: '/upload',
    PROCESS_AUDIO: '/process-audio',
    PROCESS_IMAGE: '/process-image'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    // Add your API key or authentication token here
    // 'Authorization': 'Bearer YOUR_API_KEY_HERE',
    // 'X-API-Key': 'YOUR_API_KEY_HERE',
  }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to make API calls
export const apiCall = async (endpoint, data, options = {}) => {
  const url = buildApiUrl(endpoint);
  
  const config = {
    method: 'POST',
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers
    },
    body: JSON.stringify(data),
    ...options
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};
