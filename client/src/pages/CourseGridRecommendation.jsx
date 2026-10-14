import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Layers } from 'lucide-react';
import { useCourse } from '../context/CourseContext';
import { getId, sortCoursesByDate } from '../utils/courseUtils';

export default function CourseGridRecommendation() {
  const { courses = [], isOnline = true } = useCourse();
  const navigate = useNavigate();

  const sortedCourses = sortCoursesByDate(courses).slice(0, 3);

  return (
    <section className="home-courses-section">
      <div className="section-header">
        <div className="section-title-wrap">
          <BookOpen size={20} className="section-icon" />
          <h2>Recent Created Course</h2>
        </div>
        <span className="course-count-badge">
          Total {courses.length} {courses.length === 1 ? 'Course' : 'Courses'} {!isOnline && '(Offline Available)'}
        </span>
      </div>

      {sortedCourses.length === 0 ? (
        <div className="empty-courses-card">
          <Layers size={36} className="empty-icon" />
          <h3>No courses generated yet</h3>
          <p>Enter any topic in the prompt bar at the bottom to draft your first learning path.</p>
        </div>
      ) : (
        <div className="courses-grid">
          {sortedCourses.map((course) => {
            const courseId = getId(course);
            const moduleCount = course.modules?.length || 0;

            return (
              <div
                key={courseId}
                className="course-card"
                onClick={() => navigate(`/courses/${courseId}`)}
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
  );
}