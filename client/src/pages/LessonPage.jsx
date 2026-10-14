import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import courseRepository from '../services/courseRepository';
import LessonRenderer from '../components/Lesson/LessonRenderer';
import LessonPDFExporter from '../components/Lesson/LessonPDFExporter';
import { useCourse } from '../context/CourseContext';
import { getId } from '../utils/courseUtils';
import './pages.css';

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { activeCourse, activeLesson, setActiveLesson } = useCourse();

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep in sync with background enrichment updates from CourseContext
  const currentLesson =
    activeLesson && getId(activeLesson) === lessonId
      ? activeLesson
      : lesson;

  useEffect(() => {
    let isMounted = true;

    const loadLessonDetails = async () => {
      try {
        setLoading(true);
        const lessonData = await courseRepository.getLesson(lessonId);

        if (isMounted) {
          setLesson(lessonData);
          setActiveLesson(lessonData);

          const parentCourseId = lessonData?.courseId || lessonData?.course || getId(activeCourse);
          if (parentCourseId) {
            const courseData =
              getId(activeCourse) === parentCourseId
                ? activeCourse
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
  }, [lessonId, activeCourse, setActiveLesson]);

  const targetCourseId = getId(course) || getId(activeCourse);

  if (loading) {
    return (
      <div className="page-loader-container">
        <Loader2 className="spinner" size={32} />
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
  if (course?.modules) {
    for (const mod of course.modules) {
      for (const les of mod.lessons || []) {
        flatLessons.push(typeof les === 'object' ? les : { _id: les });
      }
    }
  }

  const currentIndex = flatLessons.findIndex((l) => getId(l) === lessonId);
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
          <LessonPDFExporter lesson={currentLesson} />
        </div>
      </div>

      <main className="lesson-content-viewport">
        <LessonRenderer lesson={currentLesson} />
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