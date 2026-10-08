import { AlertCircle, Sparkles } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import './stage.css';

export default function EmptyState({ isLoading, isGenerating, isGenerationStopped }) {
  const { user } = useAuth0();
  const firstName = user?.given_name || user?.name?.split(' ')[0] || 'Learner';

  //if the genration get stopped by user
  if (isGenerationStopped) {
    return (
      <div className="empty-stage">
        <div className="stopped-response-banner">
          <AlertCircle size={28} className="stopped-icon" />
          <h3 className="stopped-title">You stopped the response</h3>
          <p className="stopped-subtitle">
            Course and lesson generation was halted because the page was refreshed or left.
          </p>
        </div>
      </div>
    );
  }

  // if ai coruse is genrating
  if (isGenerating) {
    return (
      <div className="empty-stage">
        <h2 className="hero-title">Drafting Course Syllabus...</h2>
        <p className="hero-description">Eudemus AI is analyzing your topic and building a structured learning path.</p>
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  // 3. Data Fetcing Spinner
  if (isLoading) {
    return (
      <div className="empty-stage">
        <div className="queue-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}></div>
      </div>
    );
  }

  // 4. Default Landing View case
  return (
    <div className="empty-stage">
      <div className="hero-icon-bubble">
        <Sparkles size={28} />
      </div>
      
      <h2 className="hero-title" style={{ fontFamily: "Caveat, cursive", fontSize: "35px", fontWeight: "700" }}>
        Welcome, {firstName}!
      </h2>
      <p className="hero-description">
        What would you like to learn today? Enter any topic below, and our <strong>Eudemus AI</strong> will generate a complete, structured course for you in seconds.
      </p>
    </div>
  );
}