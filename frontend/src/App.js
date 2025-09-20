import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Chat from './pages/Chat.js';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;