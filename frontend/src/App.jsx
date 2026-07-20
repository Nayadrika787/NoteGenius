import React, { useState, useEffect } from 'react';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || "";

function App() {
  const [url, setUrl] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval;
    if (taskId && status?.completed !== true && !status?.error) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/status/${taskId}`);
          const data = await res.json();
          setStatus(data);
          if (data.error) {
            setError(data.message);
          }
        } catch (e) {
          console.error(e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [taskId, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus({ message: "Starting process..." });
    try {
      const res = await fetch(`${API_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      setTaskId(data.task_id);
    } catch (e) {
      setError("Failed to connect to the server.");
    }
  };

  const handleDownload = () => {
    window.location.href = `${API_URL}/api/download/${taskId}`;
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>NoteGenius</h1>
        <p>AI-Powered YouTube Video Summaries</p>
      </header>

      <form onSubmit={handleSubmit} className="input-group">
        <input 
          type="url" 
          placeholder="Paste YouTube URL here..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" className="btn-primary" disabled={!!(taskId && !status?.completed && !error)}>
          Generate Notes
        </button>
      </form>

      {error && (
        <div className="status-panel" style={{ color: '#ef4444' }}>
          <h3>❌ {error}</h3>
        </div>
      )}

      {taskId && !status?.completed && !error && (
        <div className="status-panel">
          <div className="spinner"></div>
          <h3>{status?.message || "Working..."}</h3>
        </div>
      )}

      {status?.completed && (
        <div className="result-panel">
          <h3>✅ Notes Generated Successfully!</h3>
          <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>
            Your notes are ready to be downloaded as a nicely formatted Word Document.
          </p>
          <button onClick={handleDownload} className="btn-primary" style={{ marginTop: '1rem' }}>
            Download DOCX
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
