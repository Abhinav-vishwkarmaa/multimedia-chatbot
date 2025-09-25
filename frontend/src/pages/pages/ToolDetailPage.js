// import React from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   MessageSquare, Image, Mic, FileText, Scissors, Search, BookOpen,
//   QrCode, Link, ClipboardList, Code, SpellCheck, Braces, Regex,
//   Banknote, CreditCard, Wallet, PiggyBank, DollarSign, TrendingUp
// } from 'lucide-react';
// import './ToolDetailPage.css';

// const toolsByCategory = {
//   chat: [
//     { name: "Text Chat", icon: <MessageSquare size={40} />, desc: "AI-powered chat responses" },
//     { name: "Image Analysis", icon: <Image size={40} />, desc: "Upload images for insights" },
//     { name: "Voice Messages", icon: <Mic size={40} />, desc: "Record & listen to AI" }
//   ],
//   docs: [
//     { name: "Image → PDF", icon: <FileText size={40} />, desc: "Convert images into PDFs" },
//     { name: "PDF Split & Merge", icon: <Scissors size={40} />, desc: "Split or merge PDFs" },
//     { name: "OCR (Image → Text)", icon: <Search size={40} />, desc: "Extract text from images" },
//     { name: "Resume Builder", icon: <BookOpen size={40} />, desc: "Generate resumes in PDF" }
//   ],
//   ai: [
//     { name: "Text Summarizer", icon: <FileText size={40} />, desc: "Summarize long text" },
//     { name: "Grammar Checker", icon: <SpellCheck size={40} />, desc: "Fix grammar & spelling" },
//     { name: "JSON Formatter", icon: <Braces size={40} />, desc: "Pretty-print JSON" },
//     { name: "Regex Tester", icon: <Regex size={40} />, desc: "Test regex patterns" }
//   ],
//   finance: [
//     { name: "Expense Tracker", icon: <Wallet size={40} />, desc: "Track daily expenses" },
//     { name: "Budget Planner", icon: <PiggyBank size={40} />, desc: "Plan and manage budgets" },
//     { name: "Invoice Generator", icon: <CreditCard size={40} />, desc: "Create invoices easily" },
//     { name: "Currency Converter", icon: <DollarSign size={40} />, desc: "Convert between currencies" },
//     { name: "Stock Insights", icon: <TrendingUp size={40} />, desc: "Track market trends" }
//   ],
//   utility: [
//     { name: "QR Code Generator", icon: <QrCode size={40} />, desc: "Generate QR codes" },
//     { name: "URL Shortener", icon: <Link size={40} />, desc: "Shorten long links" },
//     { name: "Task Manager", icon: <ClipboardList size={40} />, desc: "Manage tasks" }
//   ],
//   dev: [
//     { name: "API Tester", icon: <Code size={40} />, desc: "Test API requests" },
//     { name: "Code Formatter", icon: <Code size={40} />, desc: "Beautify code" },
//     { name: "Markdown → PDF", icon: <FileText size={40} />, desc: "Convert Markdown to PDF" }
//   ]
// };

// const ToolDetailPage = () => {
//   const { categoryId, toolId } = useParams();
//   const navigate = useNavigate();

//   const tool = (toolsByCategory[categoryId] || []).find(
//     t => t.name.toLowerCase().replace(/ /g, '-').replace(/→/g, '') === toolId
//   );

//   if (!tool) {
//     return (
//       <div className="welcome-page">
//         <div className="welcome-container">
//           <h2>Tool not found</h2>
//           <button className="new-chat-button" onClick={() => navigate(-1)}>⬅ Back</button>
//         </div>
//       </div>
//     );
//   }

//   // Related tools in same category
//   const relatedTools = (toolsByCategory[categoryId] || []).filter(t => t.name !== tool.name);

//   return (
//     <div className="welcome-page">
//       <div className="welcome-container">
//         <div className="welcome-header">
//           <div className="feature-icon">{tool.icon}</div>
//           <h1>{tool.name}</h1>
//         </div>
//         <p className="welcome-subtitle">{tool.desc}</p>
//         <button className="new-chat-button" onClick={() => navigate(-1)}>⬅ Back</button>

//         {relatedTools.length > 0 && (
//           <div className="features-grid" style={{ marginTop: '48px' }}>
//             {relatedTools.map((t, idx) => (
//               <div key={idx} className="feature-card"
//                 onClick={() => navigate(`/tool/${categoryId}/${t.name.toLowerCase().replace(/ /g, '-').replace(/→/g, '')}`)}
//               >
//                 <div className="welcome-header">
//                   <span className="sparkle-icon">{tool.icon}</span>
//                   <h1>{tool.name}</h1>
//                 </div>
//                 <p>{t.desc}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ToolDetailPage;
