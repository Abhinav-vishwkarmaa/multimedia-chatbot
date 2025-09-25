import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome.js';
import Login from './pages/Login.js';
import Register from './pages/Register.js';
import Chat from './pages/Chat.js';
import CategoryPage from './pages/pages/CategoryDetail.js';
// import ToolDetailPage from './pages/pages/ToolDetailPage.js';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Welcome />} />

          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Chat page */}
          <Route path="/chat" element={<Chat />} />

          {/* Category pages */}
          <Route path="/category/:id" element={<CategoryPage />} />

          {/* Tool detail pages */}
          {/* <Route path="/tools/:categoryId/:toolId" element={<ToolDetailPage />} /> */}

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace={false} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
