import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { BookOpen, ArrowRight, AlertTriangle, Layers } from 'lucide-react';
import './pages.css';

export default function HomePage() {
  const {
    courses = [],
    isGenerationStopped,
    isOnline
  } = useOutletContext();

  const { user } = useAuth0();
  const navigate = useNavigate();

  const username = 
  user?.given_name || 
  (user?.name ? user.name.trim().split(' ')[0] : null) || 
  user?.nickname || 
  (user?.email ? user.email.split('@')[0] : 'Learner');

  return (
    <div className="home-page-container">
      {/* Clean Weclome Banner */}
      <section className="home-hero">
        <h1 className="hero-title" style={{ fontFamily: "Caveat, cursive", marginTop: "8px", fontSize: "3rem", color: "var(--text-primary)" }}>Welcome, {username}! What's on your mind today? </h1>
        

        {isGenerationStopped && (
          <div className="home-alert warning">
            <AlertTriangle size={18} />
            <span>A previous course generation was interrupted. Select it below to inspect pending lessons.</span>
          </div>
        )}
      </section>

      {/* Courses Grid */}
      <section className="home-courses-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <BookOpen size={20} className="section-icon" />
            <h2>Your Courses</h2>
          </div>
          <span className="course-count-badge">
            {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} {!isOnline && '(Offline Available)'}
          </span>
        </div>

        {courses.length === 0 ? (
          <div className="empty-courses-card">
            <Layers size={36} className="empty-icon" />
            <h3>No courses generated yet</h3>
            <p>Enter any topic in the prompt bar at the bottom to draft your first learning path.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => {
              const moduleCount = course.modules?.length || 0;
              return (
                <div
                  key={course._id}
                  className="course-card"
                  onClick={() => navigate(`/courses/${course._id}`)}
                >
                  <div className="course-card-top">
                    <span className="module-badge">{moduleCount} Modules</span>
                    {course.tags?.[0] && (
                      <span className="course-tag-pill">{course.tags[0]}</span>
                    )}
                  </div>

                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-desc">
                    {course.description || 'Comprehensive syllabus designed with structured AI learning blocks.'}
                  </p>

                  <div className="course-card-footer">
                    <span className="view-link">
                      View Syllabus <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}