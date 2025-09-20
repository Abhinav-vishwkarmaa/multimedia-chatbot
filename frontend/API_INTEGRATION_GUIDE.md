API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api', // Your API URL
  ENDPOINTS: {
    CHAT: '/chat', // Your chat endpoint
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY', // Add your auth
  }
};
```

### 2. Your API Should Accept This Format

```json
{
  "text": "User's text message",
  "image": "data:image/jpeg;base64,/9j/4AAQ...", // or null
  "audio": "blob:http://localhost:3000/...", // or null
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 3. Your API Should Return This Format

```json
{
  "message": "Bot's response text",
  "audioUrl": "https://example.com/audio.mp3", // optional
  "imageUrl": "https://example.com/image.jpg" // optional
}
```

## 🔧 **Different Integration Patterns**

### **Pattern 1: Simple Text API**
```javascript
// In ChatInterface.js, replace the apiCall with:
const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    message: messageData.content,
    user_id: 'user123'
  })
});
```

### **Pattern 2: Multimodal API (Text + Image + Audio)**
```javascript
// The current implementation already handles this:
const apiData = {
  text: messageData.content || '',
  image: messageData.imageUrl || null,
  audio: messageData.audioUrl || null,
  timestamp: new Date().toISOString()
};

const botResponseData = await apiCall(API_CONFIG.ENDPOINTS.CHAT, apiData);
```

### **Pattern 3: FormData for File Uploads**
```javascript
const formData = new FormData();
if (messageData.content) formData.append('text', messageData.content);
if (messageData.imageUrl) {
  const response = await fetch(messageData.imageUrl);
  const blob = await response.blob();
  formData.append('image', blob, 'image.jpg');
}

const response = await fetch('http://localhost:8000/api/chat', {
  method: 'POST',
  body: formData
});
```

## 🌐 **Popular API Integrations**

### **OpenAI API**
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_OPENAI_KEY'
  },
  body: JSON.stringify({
    model: "gpt-4",
    messages: [{ role: "user", content: messageData.content }]
  })
});
```

### **Google Gemini API**
```javascript
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: messageData.content }] }]
  })
});
```

### **Anthropic Claude API**
```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_ANTHROPIC_KEY'
  },
  body: JSON.stringify({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1000,
    messages: [{ role: "user", content: messageData.content }]
  })
});
```

## 🔒 **Authentication Examples**

### **Bearer Token**
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### **API Key**
```javascript
headers: {
  'X-API-Key': 'YOUR_API_KEY'
}
```

### **Basic Auth**
```javascript
headers: {
  'Authorization': 'Basic ' + btoa('username:password')
}
```

## 🛠️ **Backend Examples**

### **Flask (Python)**
```python
from flask import Flask, request, jsonify

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    text = data.get('text', '')
    image = data.get('image')
    audio = data.get('audio')
    
    # Process the multimodal input
    response = process_multimodal_input(text, image, audio)
    
    return jsonify({
        'message': response,
        'audioUrl': None,
        'imageUrl': None
    })
```

### **Express.js (Node.js)**
```javascript
app.post('/api/chat', async (req, res) => {
  const { text, image, audio } = req.body;
  
  // Process the multimodal input
  const response = await processMultimodalInput(text, image, audio);
  
  res.json({
    message: response,
    audioUrl: null,
    imageUrl: null
  });
});
```

### **FastAPI (Python)**
```python
from fastapi import FastAPI
from pydantic import BaseModel

class ChatRequest(BaseModel):
    text: str = ""
    image: str = None
    audio: str = None

@app.post("/api/chat")
async def chat(request: ChatRequest):
    response = process_multimodal_input(request.text, request.image, request.audio)
    return {
        "message": response,
        "audioUrl": None,
        "imageUrl": None
    }
```

## 🚨 **Error Handling**

The current implementation includes comprehensive error handling:

```javascript
try {
  const botResponseData = await apiCall(API_CONFIG.ENDPOINTS.CHAT, apiData);
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  // Show user-friendly error message
  const errorResponse = {
    content: 'Sorry, I encountered an error. Please try again.',
    // ... other fields
  };
}
```

## 🔄 **Testing Your Integration**

1. **Start your backend server**
2. **Update the API_CONFIG in `src/config/api.js`**
3. **Test with different input types:**
   - Text only
   - Image only
   - Audio only
   - Text + Image
   - Text + Audio
   - All three together

## 📝 **Data Flow**

```
User Input → InputArea → ChatInterface → Your API → Bot Response → Message Display
     ↓              ↓           ↓           ↓           ↓              ↓
   Text/Image/   Message    API Call    Process    Response      Show to
    Audio        Data       with        Input      Data          User
                 Object     Headers
```

## 🎯 **Next Steps**

1. **Choose your backend technology** (Flask, Express, FastAPI, etc.)
2. **Set up your API endpoint** to handle multimodal input
3. **Update the API_CONFIG** with your endpoint URL
4. **Test the integration** with different input types
5. **Add authentication** if needed
6. **Deploy and enjoy!** 🚀

## 📚 **Additional Resources**

- Check `src/examples/api-integration-examples.js` for more detailed examples
- The current implementation in `ChatInterface.js` is ready to use
- All error handling and loading states are already implemented

