import express from 'express';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all chats for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.userId }).sort({ lastModified: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

// Create new chat
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, messages = [] } = req.body;
    const chat = new Chat({
      name,
      user: req.user.userId,
      messages
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update chat (save messages, rename)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, messages } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { name, messages },
      { new: true }
    );
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete chat
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;