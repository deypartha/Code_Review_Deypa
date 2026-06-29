import { useState, useEffect } from 'react'
import './App.css'
import "prismjs/themes/prism-tomorrow.css"
import prism from "prismjs"
import Editor from "react-simple-code-editor"
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/github-dark.css'

const PRESETS = {
  js_bug: {
    name: "JavaScript (Bug Risk)",
    code: `async function fetchUserData(userIds) {
  let results = [];
  for (var i = 0; i < userIds.length; i++) {
    setTimeout(function() {
      console.log("Fetching user " + userIds[i]);
      results.push({ id: userIds[i], data: "user_data" });
    }, 100);
  }
  return results;
}`
  },
  python_perf: {
    name: "Python (Performance & Style)",
    code: `def process_orders(orders):
    valid_orders = []
    for i in range(len(orders)):
        if orders[i]['status'] == 'completed':
            if orders[i]['total'] > 100:
                valid_orders.append(orders[i])
    
    # Calculate sum manually
    total_revenue = 0
    for order in valid_orders:
        total_revenue = total_revenue + order['total']
        
    return valid_orders, total_revenue`
  },
  react_leak: {
    name: "React (Memory Leak & Hooks)",
    code: `import React, { useState, useEffect } from 'react';

export function TimerComponent({ timerId }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setInterval(() => {
      setSeconds(seconds + 1);
    }, 1000);
  }, []);

  return <div>Timer {timerId}: {seconds}s</div>;
}`
  }
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [code, setCode] = useState(PRESETS.js_bug.code);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReview, setCopiedReview] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, [code]);

  async function reviewCode() {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setReview('');

    try {
      const response = await axios.post(`${API_BASE_URL}/ai/getReview`, { code });
      setReview(response.data);
    } catch (err) {
      console.error("Review Error:", err);
      setError(err.response?.data?.error || err.message || "Failed to connect to AI Review Server.");
    } finally {
      setLoading(false);
    }
  }

  const handlePresetChange = (e) => {
    const key = e.target.value;
    if (PRESETS[key]) {
      setCode(PRESETS[key].code);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyReview = () => {
    navigator.clipboard.writeText(review);
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 2000);
  };

  return (
    <div className="app-container">
      {/* Header Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m18 16 4-4-4-4"/>
              <path d="m6 8-4 4 4 4"/>
              <path d="m14.5 4-5 16"/>
            </svg>
          </div>
          <span className="brand-title">CodeLens AI</span>
          <span className="brand-badge">Powered by OpenRender</span>
        </div>

        <div className="nav-actions">


          <button 
            onClick={reviewCode} 
            className="btn-review"
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></div>
                Analyzing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Review Code
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Split */}
      <main className="workspace">
        {/* Left Panel: Editor */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              Source Code Editor
            </div>
            <div className="panel-actions">
              <button className="btn-icon" onClick={handleCopyCode} title="Copy Code">
                {copiedCode ? '✓ Copied' : '📋 Copy'}
              </button>
              <button className="btn-icon" onClick={() => setCode('')} title="Clear Editor">
                🗑️ Clear
              </button>
            </div>
          </div>

          <div className="editor-container">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => prism.highlight(code, prism.languages.javascript || prism.languages.clike, 'javascript')}
              padding={16}
              style={{
                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                fontSize: 14,
                minHeight: '100%',
                backgroundColor: 'transparent',
                color: '#f8fafc'
              }}
            />
          </div>
        </div>

        {/* Right Panel: AI Review Feedback */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Code Review & Insights
            </div>
            {review && (
              <div className="panel-actions">
                <button className="btn-icon" onClick={handleCopyReview} title="Copy Review">
                  {copiedReview ? '✓ Copied' : '📋 Copy Feedback'}
                </button>
              </div>
            )}
          </div>

          <div className="review-container">
            {error && (
              <div className="error-banner">
                <strong>⚠️ Review Failed:</strong> {error}
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Analyzing code architecture, security, and performance...</p>
              </div>
            ) : review ? (
              <div className="markdown-body">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]} 
                  rehypePlugins={[rehypeHighlight]}
                >
                  {review}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="placeholder-state">
                <div className="placeholder-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </div>
                <h3>Ready for Review</h3>
                <p>Enter your code snippet in the editor and click <strong>Review Code</strong> to receive detailed AI feedback and refactoring recommendations.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
