import React from 'react';
import { Play, Pause, Volume2, Image as ImageIcon, VolumeX, Copy, Check } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
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
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Parse content with LaTeX and HTML
  const parseContent = (content) => {
    if (!content) return null;

    // Split by display math ($$...$$) first
    const displayMathRegex = /\$\$(.*?)\$\$/gs;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = displayMathRegex.exec(content)) !== null) {
      // Add text before the display math
      if (match.index > lastIndex) {
        const textBefore = content.substring(lastIndex, match.index);
        parts.push({ type: 'text', content: textBefore });
      }
      
      // Add display math
      parts.push({ type: 'displayMath', content: match[1] });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({ type: 'text', content: content.substring(lastIndex) });
    }

    // Now process text parts for inline math and HTML
    const finalParts = [];
    parts.forEach((part) => {
      if (part.type === 'displayMath') {
        finalParts.push(part);
      } else {
        // Process inline math ($...$) in text
        const inlineMathRegex = /\$(.+?)\$/g;
        const textParts = [];
        let textLastIndex = 0;
        let textMatch;

        while ((textMatch = inlineMathRegex.exec(part.content)) !== null) {
          // Add text before inline math
          if (textMatch.index > textLastIndex) {
            textParts.push({
              type: 'html',
              content: part.content.substring(textLastIndex, textMatch.index)
            });
          }
          
          // Add inline math
          textParts.push({ type: 'inlineMath', content: textMatch[1] });
          textLastIndex = textMatch.index + textMatch[0].length;
        }

        // Add remaining text
        if (textLastIndex < part.content.length) {
          textParts.push({
            type: 'html',
            content: part.content.substring(textLastIndex)
          });
        }

        finalParts.push(...textParts);
      }
    });

    // Render the parts
    return finalParts.map((part, index) => {
      if (part.type === 'displayMath') {
        return (
          <div key={index} className="display-math-container">
            <BlockMath math={part.content} />
          </div>
        );
      } else if (part.type === 'inlineMath') {
        return <InlineMath key={index} math={part.content} />;
      } else if (part.type === 'html') {
        // Convert newlines to <br/> and render HTML
        const htmlContent = part.content
          .split('\n')
          .map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              <span dangerouslySetInnerHTML={{ __html: line }} />
            </React.Fragment>
          ));
        return <React.Fragment key={index}>{htmlContent}</React.Fragment>;
      }
      return null;
    });
  };

  // Get plain text content for TTS (strip LaTeX and HTML)
  const getPlainTextContent = (content) => {
    if (!content) return '';
    
    // Remove LaTeX delimiters and math content
    let plainText = content
      .replace(/\$\$.*?\$\$/gs, ' [equation] ')
      .replace(/\$(.+?)\$/g, ' $1 ')
      .replace(/<strong>(.*?)<\/strong>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .trim();
    
    return plainText;
  };

  // Text-to-Speech functionality
  const toggleTextToSpeech = () => {
    if (!message.content) return;

    if (isSpeaking) {
      if (speechSynthesis) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } else {
      if ('speechSynthesis' in window) {
        const plainText = getPlainTextContent(message.content);
        const utterance = new SpeechSynthesisUtterance(plainText);
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
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
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
            <div className="text-content">
              {message.hasLatex || message.content.includes('$') || message.content.includes('<strong>')
                ? parseContent(message.content)
                : message.content}
            </div>
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