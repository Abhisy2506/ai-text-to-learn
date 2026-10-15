import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Circle,
  Play, 
  AlertCircle, 
  ArrowLeft,
  ChevronRight,
  Loader2,
  XCircle
} from 'lucide-react';
import courseRepository from '../services/courseRepository';
import { useCourse } from '../context/CourseContext';
import { getId, isLessonReady, isLessonStopped } from '../utils/courseUtils';
import './pages.css';

export default function CourseOverviewPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { activeCourse, setActiveCourse, onNewCourse } = useCourse();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep in sync with background enrichment updates from CourseContext
  const currentCourse =
    activeCourse && getId(activeCourse) === courseId
      ? activeCourse
      : course;

  useEffect(() => {
    let isMounted = true;

    const loadCourse = async () => {
      try {
        if (activeCourse && getId(activeCourse) === courseId) {
          setCourse(activeCourse);
          setLoading(false);
          return;
        }

        setLoading(true);
        const data = await courseRepository.getCourse(courseId);
        if (isMounted) {
          setCourse(data);
          setActiveCourse(data);
        }
      } catch (err) {
        console.error('Failed to load course overview:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }

    return () => { isMounted = false; };
  }, [courseId, setActiveCourse]);

  if (loading && !currentCourse) {
    return (
      <div className="page-loader-container">
        <Loader2 className="spinner" size={32} style={{ color: 'var(--accent-color)' }}/>
        <p>Loading course syllabus...</p>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="page-error-container">
        <AlertCircle size={36} className="text-red" />
        <h2>Course Not Found</h2>
        <p>This course may have been removed or is unavailable in your offline cache.</p>
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Return to Home
        </button>
      </div>
    );
  }

  // Find the first available lesson to offer a "Start Course" CTA
  const firstLessonId = getId(currentCourse.modules?.[0]?.lessons?.[0]);

  return (
    <div className="course-overview-container">
      {/* Navigation Breadcrumb */}
      <div className="page-breadcrumbs">
        <button onClick={onNewCourse} className="crumb-link">Home</button>
        <ChevronRight size={14} />
        <span className="crumb-current">{currentCourse.title}</span>
      </div>

      {/* Course Header Banner */}
      <header className="course-hero-card">
        <div className="course-meta-tags">
          <span className="syllabus-badge">Syllabus</span>
          {currentCourse.tags?.map((t, idx) => (
            <span key={idx} className="course-tag-pill">{t}</span>
          ))}
        </div>
        <h1 className="course-hero-title">{currentCourse.title}</h1>
        <p className="course-hero-description">{currentCourse.description}</p>

        {firstLessonId && (
          <div className="course-hero-actions">
            <button
              className="start-course-btn"
              onClick={() => navigate(`/lessons/${firstLessonId}`)}
            >
              <Play size={16} fill="currentColor" />
              <span>Start Course</span>
            </button>
          </div>
        )}
      </header>

      {/* Modules & Lessons Syllabus Breakdown */}
      <section className="course-modules-section">
        <h2 className="section-title">Course Modules & Breakdown</h2>

        <div className="modules-list">
          {currentCourse.modules?.map((mod, modIdx) => {
            const modTitle = typeof mod === 'object' && mod.title ? mod.title : `Module ${modIdx + 1}`;
            const lessons = typeof mod === 'object' && mod.lessons ? mod.lessons : [];

            return (
              <div key={mod._id?.$oid || mod._id || modIdx} className="module-card">
                <div className="module-card-header">
                  <span className="module-number">Module {modIdx + 1}</span>
                  <h3 className="module-title">{modTitle}</h3>
                </div>

                <div className="lessons-sublist">
                  {lessons.length === 0 ? (
                    <p className="no-lessons-note">No lessons drafted in this module yet.</p>
                  ) : (
                    lessons.map((les, lesIdx) => {
                      const lessonId = getId(les);
                      const lessonTitle = typeof les === 'object' && les?.title ? les.title : `Lesson ${lesIdx + 1}`;
                      const isEnriched = isLessonReady(les);
                      const isStopped = isLessonStopped(les);

                      return (
                        <div
                          key={lessonId || lesIdx}
                          className="lesson-overview-row"
                          onClick={() => navigate(`/lessons/${lessonId}`)}
                        >
                          <div className="lesson-row-left">
                            {isEnriched ? (
                              <CheckCircle2 size={16} className="status-icon completed" />
                            ) : isStopped ? (
                              <XCircle size={16} className="status-icon text-red" />
                            ) : (
                              <Circle size={16} className="status-icon pending" />
                            )}
                            <span className="lesson-row-title">{lessonTitle}</span>
                          </div>

                          <div className="lesson-row-right">
                            {isEnriched ? (
                              <span className="status-badge ready">Ready</span>
                            ) : isStopped ? (
                              <span className="status-badge stopped">Stopped</span>
                            ) : (
                              <span className="status-badge pending">Outline Only</span>
                            )}
                            <ChevronRight size={16} className="arrow-icon" />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}