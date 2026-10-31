import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertCircle, Loader2, Languages } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import courseRepository from '../services/courseRepository';
import LessonRenderer from '../components/Lesson/LessonRenderer';
import LessonPDFExporter from '../components/Lesson/LessonPDFExporter';
import LessonAudioPlayer from '../components/Lesson/LessonAudioPlayer';
import { useCourse } from '../context/CourseContext';
import { getId, isLessonStopped } from '../utils/courseUtils';
import './pages.css';

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { activeCourse, activeLesson, setActiveLesson, isOnline } = useCourse();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('english'); // 'english' or 'hinglish'
  const [translating, setTranslating] = useState(false);

  const activeCourseRef = useRef(activeCourse);
  activeCourseRef.current = activeCourse;

  const currentLesson =
    activeLesson && getId(activeLesson) === lessonId
      ? activeLesson
      : lesson;

  useEffect(() => {
    let isMounted = true;
    setViewMode('english'); // reset view mode when changing lessons

    const loadLessonDetails = async () => {
      try {
        setLoading(true);
        const lessonData = await courseRepository.getLesson(lessonId);

        if (isMounted) {
          setLesson(lessonData);
          setActiveLesson(lessonData);

          const currentActiveCourse = activeCourseRef.current;
          const parentCourseId =
            lessonData?.courseId ||
            lessonData?.course ||
            getId(currentActiveCourse);

          if (parentCourseId) {
            const courseData =
              getId(currentActiveCourse) === parentCourseId
                ? currentActiveCourse
                : await courseRepository.getCourse(parentCourseId);
            setCourse(courseData);
          }
        }
      } catch (err) {
        console.error('Failed to load lesson page data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (lessonId) {
      loadLessonDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [lessonId, setActiveLesson]);

  const handleToggleHinglish = async () => {
    if (viewMode === 'hinglish') {
      setViewMode('english');
      return;
    }

    // If we already have the Hinglish text cached, just switch view
    if (currentLesson?.hinglishContent) {
      setViewMode('hinglish');
      return;
    }

    if (!isOnline) {
      alert('You are offline. Connect to the internet to get Hinglish translation.');
      return;
    }

    // Otherwise, fetch/generate it via the existing backend endpoint
    try {
      setTranslating(true);
      const token = isAuthenticated ? await getAccessTokenSilently() : null;
      const data = await courseRepository.getLessonHinglishAudio(currentLesson._id, token);

      if (data?.hinglishText) {
        setActiveLesson((prev) => ({
          ...prev,
          hinglishContent: data.hinglishText,
          audioData: data.audioBase64 || prev?.audioData,
        }));
        setViewMode('hinglish');
      }
    } catch (err) {
      console.error('Error translating to Hinglish:', err);
      alert('Could not translate lesson to Hinglish. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const displayCourse =
    activeCourse && (getId(activeCourse) === getId(course) || !course)
      ? activeCourse
      : course || activeCourse;

  const targetCourseId = getId(displayCourse);

  if (loading) {
    return (
      <div className="page-loader-container">
        <Loader2 className="spinner" size={32} style={{ color: 'var(--accent-color)' }} />
        <p>Loading lesson content...</p>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="page-error-container">
        <AlertCircle size={36} className="text-red" />
        <h2>Lesson Unavailable</h2>
        <p>Could not retrieve this lesson material.</p>
        <button
          className="back-btn"
          onClick={() => navigate(targetCourseId ? `/courses/${targetCourseId}` : '/')}
        >
          <ArrowLeft size={16} /> Return to Course
        </button>
      </div>
    );
  }

  const flatLessons = [];
  if (displayCourse?.modules) {
    for (const mod of displayCourse.modules) {
      for (const les of mod.lessons || []) {
        flatLessons.push(typeof les === 'object' ? les : { _id: les });
      }
    }
  }

  const currentIndex = flatLessons.findIndex((l) => getId(l) === lessonId);
  const lessonInCourse = currentIndex !== -1 ? flatLessons[currentIndex] : null;
  const isStoppedInCourse = lessonInCourse ? isLessonStopped(lessonInCourse) : false;

  const effectiveLesson = currentLesson
    ? {
        ...currentLesson,
        ...(isStoppedInCourse ? { isGenerationStopped: true, status: 'stopped', isEnriched: 'failed' } : {}),
      }
    : null;

  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex !== -1 && currentIndex < flatLessons.length - 1
      ? flatLessons[currentIndex + 1]
      : null;

  return (
    <div className="lesson-page-container">
      <div className="lesson-top-bar">
        <button
          className="back-to-course-btn"
          onClick={() => navigate(targetCourseId ? `/courses/${targetCourseId}` : '/')}
        >
          <ArrowLeft size={16} />
          <span>Course Syllabus</span>
        </button>

        <div className="top-actions-right">
          {/* Hinglish Text Switcher Button */}
          <button
            type="button"
            onClick={handleToggleHinglish}
            disabled={translating}
            className={`language-toggle-btn ${viewMode === 'hinglish' ? 'active' : ''}`}
            title="Toggle between English and Hinglish explanation"
          >
            {translating ? (
              <Loader2 size={16} className="audio-btn-spinner" />
            ) : (
              <Languages size={16} />
            )}
            <span>{viewMode === 'hinglish' ? 'Show English' : 'Read Hinglish'}</span>
          </button>

          <LessonAudioPlayer />
          <LessonPDFExporter lesson={effectiveLesson} />
        </div>
      </div>

      <main className="lesson-content-viewport">
        <LessonRenderer lesson={effectiveLesson} viewMode={viewMode} />
      </main>

      <footer className="lesson-bottom-nav">
        {prevLesson ? (
          <button
            className="seq-nav-btn prev"
            onClick={() => navigate(`/lessons/${getId(prevLesson)}`)}
          >
            <ArrowLeft size={16} />
            <div className="nav-btn-text">
              <span className="btn-direction">Previous Lesson</span>
              <span className="btn-title">{prevLesson.title || 'Previous'}</span>
            </div>
          </button>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <button
            className="seq-nav-btn next"
            onClick={() => navigate(`/lessons/${getId(nextLesson)}`)}
          >
            <div className="nav-btn-text">
              <span className="btn-direction">Next Lesson</span>
              <span className="btn-title">{nextLesson.title || 'Next'}</span>
            </div>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="seq-nav-btn complete"
            onClick={() => navigate(targetCourseId ? `/courses/${targetCourseId}` : '/')}
          >
            <span>Finish Course</span>
          </button>
        )}
      </footer>
    </div>
  );
}