import { Sparkles } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useCourse } from '../../context/CourseContext';
import './stage.css';

export default function EmptyState() {
  const { user } = useAuth0();
  const { isLoading, isGenerating } = useCourse();

  const firstName =
    user?.given_name ||
    user?.name?.split(' ')[0] ||
    user?.nickname ||
    'Learner';

  // 1. Initial syllabus outline is drafting
  if (isGenerating) {
    return (
      <div className="empty-stage">
        <h2 className="hero-title">Drafting Course Syllabus...</h2>
        <p className="hero-description">
          Eudemus AI is analyzing your topic and building a structured learning path.
        </p>
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  // 2. Course list fetching
  if (isLoading) {
    return (
      <div className="empty-stage">
        <div
          className="queue-spinner"
          style={{ width: '32px', height: '32px', borderWidth: '3px' }}
        />
      </div>
    );
  }

  // 3. Welcome / zero-course landing
  return (
    <div className="empty-stage">
      <div className="hero-icon-bubble">
        <Sparkles size={28} />
      </div>

      <h2 className="hero-title cursive">
        Welcome, {firstName}!
      </h2>
      <p className="hero-description">
        What would you like to learn today? Enter any topic below, and our{' '}
        <strong>Eudemus AI</strong> will generate a complete, structured course for you in seconds.
      </p>
    </div>
  );
}