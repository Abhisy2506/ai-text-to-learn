import { useState } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import './promptbar.css';

export default function ChatInput({ onSendPrompt, isLoading, placeholder, generationStatus }) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;
    onSendPrompt(topic.trim());
    setTopic('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-input-container">
      {generationStatus && (
        <div className={`queue-status-bar ${generationStatus.isComplete ? 'completed' : ''}`}>
          {!generationStatus.isComplete && <div className="queue-spinner"></div>}
          <span>{generationStatus.text}</span>
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-text-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="chat-submit-btn"
          disabled={!topic.trim() || isLoading}
        >
          {isLoading ? <Loader2 size={18} className="spinner" /> : <ArrowUp size={18} />}
        </button>
      </form>
    </div>
  );
}