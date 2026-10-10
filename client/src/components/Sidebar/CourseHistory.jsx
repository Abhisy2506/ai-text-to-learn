import { Book, MoreVertical } from 'lucide-react';

export default function CourseHistory({
  courses = [],
  activeCourseId,
  dropdownId,
  onSelectCourse,
  onToggleMenu,
}) {
  if (!courses || courses.length === 0) {
    return <div className="no-history-text">No courses generated yet.</div>;
  }

  // Sort newest created courses at the top
  const sortedCourses = [...courses].sort((a, b) => {
    const dateA = new Date(a.createdAt?.$date || a.createdAt || 0);
    const dateB = new Date(b.createdAt?.$date || b.createdAt || 0);
    return dateB - dateA;
  });

  return (
    <ul className="course-list">
      {sortedCourses.map((course) => {
        const id = course._id?.$oid || course._id;
        const activeId = activeCourseId?.$oid || activeCourseId;
        const isActive = activeId === id;
        const isDropdownOpen = dropdownId === id;

        return (
          <li key={id} className="course-item-wrapper">
            <button
              className={`course-item-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCourse(id)}
            >
              <Book size={16} style={{ flexShrink: 0 }} />
              <span className="course-item-title">{course.title}</span>

              <div className={`course-item-actions ${isDropdownOpen ? 'force-show' : ''}`}>
                <div
                  className="course-options-btn"
                  onClick={(e) => onToggleMenu(e, id)}
                >
                  <MoreVertical size={16} />
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}