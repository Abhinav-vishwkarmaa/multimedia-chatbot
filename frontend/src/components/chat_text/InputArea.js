import React, { useState, useRef } from 'react';
import { Send, Image, Mic, MicOff, X } from 'lucide-react';
import AudioRecorder from './AudioRecorder.js';
import './InputArea.css';

const InputArea = ({ onSendMessage }) => {
  const [text, setText] = useState('');
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const fileInputRef = useRef(null);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (text.trim() || selectedImagePreview || audioBlob) {
      const messageData = {
        content: text.trim(),
        imageFile: selectedImageFile || null,
        imagePreviewUrl: selectedImagePreview || null,
        audioBlob: audioBlob || null
      };
      onSendMessage(messageData);
      setText('');
      setSelectedImagePreview(null);
      setSelectedImageFile(null);
      setAudioBlob(null);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImagePreview(e.target.result);
        setSelectedImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImagePreview(null);
    setSelectedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAudioRecorded = (blob) => {
    setAudioBlob(blob);
    setIsRecording(false);
  };

  const removeAudio = () => {
    setAudioBlob(null);
  };

  return (
    <div className="input-area">
      <form onSubmit={handleTextSubmit} className="input-form">
        <div className="input-container">
          {selectedImagePreview && (
            <div className="preview-image">
              <img src={selectedImagePreview} alt="Preview" />
              <button
                type="button"
                className="remove-button"
                onClick={removeImage}
                title="Remove image"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          {audioBlob && (
            <div className="preview-audio">
              <audio controls src={URL.createObjectURL(audioBlob)} />
              <button
                type="button"
                className="remove-button"
                onClick={removeAudio}
                title="Remove audio"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="input-row">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="text-input"
            />
            
            <div className="input-buttons">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              
              {/* <button
                type="button"
                className="input-button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload image"
              >
                <Image size={20} />
              </button>

              {!isRecording && !audioBlob && (
                <button
                  type="button"
                  className="input-button"
                  onClick={() => setIsRecording(true)}
                  title="Record audio"
                >
                  <Mic size={20} />
                </button>
              )}

              {isRecording && (
                <AudioRecorder
                  onRecordingComplete={handleAudioRecorded}
                  onCancel={() => setIsRecording(false)}
                />
              )} */}

              <button
                type="submit"
                className="send-button"
                disabled={!text.trim() && !selectedImagePreview && !audioBlob}
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InputArea;
