import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import CourseHistory from './CourseHistory';
import DeleteCourse from './DeleteCourse';
import NewCourseBtn from './NewCourseBtn';
import { useCourse } from '../../context/CourseContext';
import { getId } from '../../utils/courseUtils';
import './sidebar.css';

export default function Sidebar({ isOpen }) {
  const [dropdown, setDropdown] = useState({ id: null, top: 0, left: 0 });
  const [courseToDelete, setCourseToDelete] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    courses,
    activeCourse,
    onSelectCourse,
    onNewCourse,
    onDeleteCourse,
  } = useCourse();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdown({ id: null, top: 0, left: 0 });
      }
    };

    if (dropdown.id) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdown.id]);

  const handleToggleMenu = (e, courseId) => {
    e.stopPropagation();
    if (dropdown.id === courseId) {
      setDropdown({ id: null, top: 0, left: 0 });
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setDropdown({ id: courseId, top: rect.top, left: rect.right + 8 });
    }
  };

  const handleDeleteClick = (e, courseId) => {
    e.stopPropagation();
    setDropdown({ id: null, top: 0, left: 0 });
    setCourseToDelete(courseId);
  };

  const handleConfirmDelete = () => {
    if (courseToDelete) {
      onDeleteCourse(courseToDelete);
      setCourseToDelete(null);
    }
  };

  const handleCourseSelection = (courseId) => {
    if (onSelectCourse) {
      onSelectCourse(courseId);
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  const handleCreateNewCourse = () => {
    if (onNewCourse) {
      onNewCourse();
    } else {
      navigate('/');
    }
  };

  return (
    <>
      <aside className={`sidebar-drawer ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div
            className="brand-logo"
            onClick={handleCreateNewCourse}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/assets/text-ai-course-logo.svg"
              alt="Eudemus AI Logo"
              width="24"
              height="24"
              className="brand-icon"
            />
            <span
              style={{
                fontFamily: 'Caveat, cursive',
                fontSize: '25px',
                fontWeight: '700',
              }}
            >
              Eudemus Ai
            </span>
          </div>
        </div>

        <div className="sidebar-action">
          <NewCourseBtn onClick={handleCreateNewCourse} />
        </div>

        <div className="sidebar-content">
          <h4 className="sidebar-section-title">Your Courses</h4>

          <CourseHistory
            courses={courses}
            activeCourseId={getId(activeCourse)}
            dropdownId={dropdown.id}
            onSelectCourse={handleCourseSelection}
            onToggleMenu={handleToggleMenu}
          />

          {dropdown.id &&
            createPortal(
              <div
                className="course-dropdown-menu"
                ref={dropdownRef}
                style={{ top: `${dropdown.top}px`, left: `${dropdown.left}px` }}
              >
                <div
                  className="dropdown-action danger"
                  onClick={(e) => handleDeleteClick(e, dropdown.id)}
                >
                  <Trash2 size={14} /> Delete Course
                </div>
              </div>,
              document.body
            )}
        </div>

        <div className="sidebar-footer">
          <p> © Built and Managed by</p>
          <a href='https://github.com/Abhisy2506/ai-text-to-learn'>
            Abhay Singh Yadav
          </a>
          </div>
      </aside>

      <DeleteCourse
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}