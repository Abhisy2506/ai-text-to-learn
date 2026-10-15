import { Plus } from 'lucide-react';

export default function NewCourseBtn({ onClick }) {
  return (
    <button className="new-course-btn" onClick={onClick}>
      <Plus size={18} />
      <span>New Course</span>
    </button>
  );
}