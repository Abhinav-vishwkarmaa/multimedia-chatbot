// API Integration Examples for Different Backend Types

// ========================================
// EXAMPLE 1: OpenAI API Integration
// ========================================
export const openAIExample = async (messageData) => {
  const apiData = {
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: messageData.content },
          ...(messageData.imageUrl ? [{ type: "image_url", image_url: { url: messageData.imageUrl } }] : [])
        ]
      }
    ],
    max_tokens: 1000
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_OPENAI_API_KEY'
    },
    body: JSON.stringify(apiData)
  });

  const data = await response.json();
  return {
    message: data.choices[0].message.content,
    audioUrl: null,
    imageUrl: null
  };
};

// ========================================
// EXAMPLE 2: Google Gemini API Integration
// ========================================
export const geminiExample = async (messageData) => {
  const apiData = {
    contents: [{
      parts: [
        { text: messageData.content },
        ...(messageData.imageUrl ? [{ inline_data: { mime_type: "image/jpeg", data: messageData.imageUrl.split(',')[1] } }] : [])
      ]
    }]
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_GEMINI_API_KEY`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(apiData)
  });

  const data = await response.json();
  return {
    message: data.candidates[0].content.parts[0].text,
    audioUrl: null,
    imageUrl: null
  };
};

// ========================================
// EXAMPLE 3: Custom Backend API Integration
// ========================================
export const customBackendExample = async (messageData) => {
  // For text messages
  if (messageData.content && !messageData.imageUrl && !messageData.audioUrl) {
    const response = await fetch('http://localhost:8000/api/chat/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        message: messageData.content,
        user_id: 'user123',
        session_id: 'session456'
      })
    });
    return await response.json();
  }

  // For image messages
  if (messageData.imageUrl) {
    const response = await fetch('http://localhost:8000/api/chat/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        image: messageData.imageUrl,
        text: messageData.content || '',
        user_id: 'user123'
      })
    });
    return await response.json();
  }

  // For audio messages
  if (messageData.audioUrl) {
    const response = await fetch('http://localhost:8000/api/chat/audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        audio: messageData.audioUrl,
        user_id: 'user123'
      })
    });
    return await response.json();
  }
};

// ========================================
// EXAMPLE 4: Flask/FastAPI Backend Integration
// ========================================
export const flaskBackendExample = async (messageData) => {
  const formData = new FormData();
  
  // Add text if present
  if (messageData.content) {
    formData.append('text', messageData.content);
  }
  
  // Add image if present
  if (messageData.imageUrl) {
    // Convert base64 to blob
    const response = await fetch(messageData.imageUrl);
    const blob = await response.blob();
    formData.append('image', blob, 'image.jpg');
  }
  
  // Add audio if present
  if (messageData.audioUrl) {
    const response = await fetch(messageData.audioUrl);
    const blob = await response.blob();
    formData.append('audio', blob, 'audio.wav');
  }

  const apiResponse = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
      // Don't set Content-Type for FormData, browser sets it automatically
    },
    body: formData
  });

  return await apiResponse.json();
};

// ========================================
// EXAMPLE 5: Node.js/Express Backend Integration
// ========================================
export const nodeBackendExample = async (messageData) => {
  const apiData = {
    type: 'multimodal',
    data: {
      text: messageData.content || '',
      image: messageData.imageUrl || null,
      audio: messageData.audioUrl || null
    },
    metadata: {
      timestamp: new Date().toISOString(),
      user_id: 'user123',
      session_id: 'session456'
    }
  };

  const response = await fetch('http://localhost:3001/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify(apiData)
  });

  const result = await response.json();
  
  return {
    message: result.response.text,
    audioUrl: result.response.audio_url || null,
    imageUrl: result.response.image_url || null
  };
};

// ========================================
// EXAMPLE 6: WebSocket Integration (Real-time)
// ========================================
export const websocketExample = (messageData, onResponse) => {
  const ws = new WebSocket('ws://localhost:8000/ws/chat');
  
  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'message',
      data: messageData
    }));
  };
  
  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    onResponse(response);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    onResponse({
      message: 'Connection error. Please try again.',
      audioUrl: null,
      imageUrl: null
    });
  };
  
  return ws;
};
