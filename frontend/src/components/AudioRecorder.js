import React, { useState, useRef, useEffect } from 'react';
import { Square, Mic } from 'lucide-react';
import './AudioRecorder.css';

const AudioRecorder = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isRecording) {
      startRecording();
    }
  }, []);

  return (
    <div className="audio-recorder">
      <div className="recording-indicator">
        <div className="pulse-dot"></div>
        <span>Recording: {formatTime(recordingTime)}</span>
      </div>
      
      <div className="recorder-controls">
        <button
          className="stop-button"
          onClick={stopRecording}
          title="Stop recording"
        >
          <Square size={20} />
        </button>
        
        <button
          className="cancel-button"
          onClick={onCancel}
          title="Cancel recording"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AudioRecorder;
