import React from 'react';
import { Play, Pause, Volume2, Image as ImageIcon, VolumeX, Copy, Check } from 'lucide-react';
import './Message.css';

const Message = ({ message }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioElement, setAudioElement] = React.useState(null);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [speechSynthesis, setSpeechSynthesis] = React.useState(null);

  const toggleAudio = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play();
        setIsPlaying(true);
      }
    }
  };

  React.useEffect(() => {
    if (message.audioUrl) {
      const audio = new Audio(message.audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      setAudioElement(audio);
    }
  }, [message.audioUrl]);

  // Cleanup speech synthesis on unmount
  React.useEffect(() => {
    return () => {
      if (speechSynthesis && isSpeaking) {
        speechSynthesis.cancel();
      }
    };
  }, [speechSynthesis, isSpeaking]);

  const formatTime = (timestamp) => {
    // Handle both Date objects and date strings
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Text-to-Speech functionality
  const toggleTextToSpeech = () => {
    if (!message.content) return;

    if (isSpeaking) {
      // Stop speaking
      if (speechSynthesis) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } else {
      // Start speaking
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        setSpeechSynthesis(window.speechSynthesis);
        window.speechSynthesis.speak(utterance);
      } else {
        alert('Text-to-speech is not supported in this browser.');
      }
    }
  };

  // Copy to clipboard functionality
  const copyToClipboard = async () => {
    if (!message.content) return;

    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className={`message ${message.type}`}>
      <div className="message-content">
        {message.imageUrl && (
          <div className="message-image">
            <img src={message.imageUrl} alt="User uploaded" />
            <div className="image-indicator">
              <ImageIcon size={16} />
              <span>Image</span>
            </div>
          </div>
        )}
        
        {message.content && (
          <div className="message-text">
            <div className="text-content">{message.content}</div>
            <div className="message-actions">
              <button
                className={`action-button tts-button ${isSpeaking ? 'speaking' : ''}`}
                onClick={toggleTextToSpeech}
                title={isSpeaking ? "Stop speaking" : "Read aloud"}
              >
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button
                className={`action-button copy-button ${isCopied ? 'copied' : ''}`}
                onClick={copyToClipboard}
                title="Copy message"
              >
                {isCopied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        {message.audioUrl && (
          <div className="message-audio">
            <button 
              className="audio-play-button"
              onClick={toggleAudio}
              title={isPlaying ? "Pause audio" : "Play audio"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div className="audio-indicator">
              <Volume2 size={16} />
              <span>Audio message</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="message-meta">
        <span className="timestamp">{formatTime(message.timestamp)}</span>
        <span className="message-type">
          {message.type === 'user' ? 'You' : 'Bot'}
        </span>
      </div>
    </div>
  );
};

export default Message;
