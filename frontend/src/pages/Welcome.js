import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Image, Mic, FileText, QrCode, Code ,Wand2, icons,  Banknote,   CreditCard,  Wallet,   PiggyBank,  DollarSign,   IndianRupee,  Euro,  PoundSterling,  Yen,   Coins,   Receipt,   ChartPie, ChartBar,   BarChart3,   TrendingUp, TrendingDown} from 'lucide-react';
import './Welcome.css';

// const categories = [
//   { id: 'chat', name: '💬 Chat Features', icon: <MessageSquare size={24} /> },
//   { id: 'docs', name: '📂 File & Document Tools', icon: <FileText size={24} /> },
//   { id: 'ai', name: '🤖 AI & Content Tools', icon: <Code size={24} /> },
//   { id: 'utility', name: '📊 Utility & Productivity Tools', icon: <QrCode size={24} /> },
//   { id: 'dev', name: '⚙️ Developer Tools', icon: <Code size={24} /> }
// ];
const categories = [
  { id: "chat", title: "💬 Chat Features", description: "Text, image, and voice-based conversations", icon: <MessageSquare size={24} /> },
  { id: "docs", title: "📂 File & Document Tools", description: "Convert, split, and analyze documents", icon: <FileText size={24} /> },
  { id: "ai", title: "🤖 AI & Content Tools", description: "AI-powered text and content tools", icon: <Wand2 size={24} /> },
  { id: "utility", title: "📊 Utility & Productivity Tools", description: "Everyday tools for productivity", icon: <QrCode size={24} /> },
  { id: "dev", title: "⚙️ Developer Tools", description: "Tools for developers & debugging", icon: <Code size={24} /> },
  { id: "finance", title: "💰 Finance Tools",description:"Know more about finance",icon :<Banknote size={24} /> },

];

const Welcome = () => {
  const navigate = useNavigate();
  return (
    <div className="welcome-page">
      <div className="welcome-container">
        <div className="welcome-header">
          <h1>Welcome to AI Tools Hub</h1>
          <p>Select a category to explore tools</p>
        </div>

        <div className="features-grid">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="feature-card"
              onClick={() => navigate(`/category/${cat.id}`)}
            >
              <div className="feature-icon">{cat.icon}</div>
              <h3>{cat.title}</h3>
              <p>{cat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
