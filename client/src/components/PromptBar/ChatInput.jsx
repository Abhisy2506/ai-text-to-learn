import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp, Loader2 } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import './promptbar.css';

export default function ChatInput() {
  const [topic, setTopic] = useState('');
  const location = useLocation();

  const {
    onGenerateCourse,
    isGenerating,
    generationStatus,
    activeCourse,
    onStopGeneration,
  } = useCourse();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    onGenerateCourse(topic.trim());
    setTopic('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const computedPlaceholder =
    location.pathname !== '/' && activeCourse
      ? 'Ask a question or enter a new course topic...'
      : 'Enter a topic (e.g., "Full-Stack GraphQL with Node.js")...';

  return (
    <div className="chat-input-container">
      {generationStatus && (
        <div className={`queue-status-bar ${generationStatus.isComplete ? 'completed' : ''}`}>
          {!generationStatus.isComplete && <div className="queue-spinner"></div>}
          <span className="queue-status-text">{generationStatus.text}</span>
          {!generationStatus.isComplete && onStopGeneration && (
            <button
              type="button"
              className="queue-stop-btn"
              onClick={onStopGeneration}
              title="Stop generating remaining lessons"
            >
              Stop
            </button>
          )}
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-text-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={computedPlaceholder}
          disabled={isGenerating}
        />
        <button
          type="submit"
          className="chat-submit-btn"
          disabled={!topic.trim() || isGenerating}
        >
          {isGenerating ? <Loader2 size={18} className="spinner" /> : <ArrowUp size={18} />}
        </button>
      </form>
      <p className='ai-warning'>Eudemus is AI and can make mistakes.</p>
    </div>
  );
}