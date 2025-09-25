import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageSquare, Image, Mic, FileText, Scissors, Search, BookOpen,
  QrCode, Link, ClipboardList, Code, SpellCheck, Braces, Regex,
  Banknote, CreditCard, Wallet, PiggyBank, DollarSign, TrendingUp 
} from "lucide-react";
import './CategoryPage.css';

const toolsByCategory = {
  chat: [
    { name: "Text Chat", icon: <MessageSquare size={24} />, desc: "AI-powered chat responses" },
    { name: "Image Analysis", icon: <Image size={24} />, desc: "Upload images for insights" },
    { name: "Voice Messages", icon: <Mic size={24} />, desc: "Record & listen to AI" }
  ],

  finance: [
    { name: "Expense Tracker", icon: <Wallet size={24} />, desc: "Track daily expenses" },
    { name: "Budget Planner", icon: <PiggyBank size={24} />, desc: "Plan and manage budgets" },
    { name: "Invoice Generator", icon: <CreditCard size={24} />, desc: "Create invoices easily" },
    { name: "Currency Converter", icon: <DollarSign size={24} />, desc: "Convert between currencies" },
    { name: "Stock Insights", icon: <TrendingUp size={24} />, desc: "Track market trends" },
    { name: "Investment Tracker", icon: <Banknote size={24} />, desc: "Manage investments" }
  ],

  docs: [
    { name: "Image → PDF", icon: <FileText size={24} />, desc: "Convert images into PDFs" },
    { name: "PDF Split & Merge", icon: <Scissors size={24} />, desc: "Split or merge PDFs" },
    { name: "OCR (Image → Text)", icon: <Search size={24} />, desc: "Extract text from images" },
    { name: "Resume Builder", icon: <BookOpen size={24} />, desc: "Generate resumes in PDF" }
  ],

  ai: [
    { name: "Text Summarizer", icon: <FileText size={24} />, desc: "Summarize long text" },
    { name: "Grammar Checker", icon: <SpellCheck size={24} />, desc: "Fix grammar & spelling" },
    { name: "JSON Formatter", icon: <Braces size={24} />, desc: "Pretty-print JSON" },
    { name: "Regex Tester", icon: <Regex size={24} />, desc: "Test regex patterns" }
  ],

  utility: [
    { name: "QR Code Generator", icon: <QrCode size={24} />, desc: "Generate QR codes" },
    { name: "URL Shortener", icon: <Link size={24} />, desc: "Shorten long links" },
    { name: "Task Manager", icon: <ClipboardList size={24} />, desc: "Manage to-do tasks" }
  ],

  dev: [
    { name: "API Tester", icon: <Code size={24} />, desc: "Test API requests" },
    { name: "Code Formatter", icon: <Code size={24} />, desc: "Beautify your code" },
    { name: "Markdown → PDF", icon: <FileText size={24} />, desc: "Convert Markdown to PDF" }
  ]
};

const CategoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tools = toolsByCategory[id] || [];

  const getCategoryTitle = (categoryId) => {
    switch(categoryId) {
      case 'chat': return "💬 Chat Features";
      case 'finance': return "💰 Finance Tools";
      case 'docs': return "📂 File & Document Tools";
      case 'ai': return "🤖 AI & Content Tools";
      case 'utility': return "📊 Utility & Productivity Tools";
      case 'dev': return "⚙️ Developer Tools";
      default: return "Tools";
    }
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <h2>{getCategoryTitle(id)}</h2>
        <button onClick={() => navigate(-1)}>⬅ Back</button>
      </div>

      <div className="tools-grid">
        {tools.map((tool, index) => (
          <div 
            key={index} 
            className="tool-card"
            onClick={() => alert(`You clicked ${tool.name}. Implement tool page navigation here.`)}
          >
            {tool.icon && <div className="tool-icon">{tool.icon}</div>}
            <h4>{tool.name}</h4>
            <p>{tool.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
