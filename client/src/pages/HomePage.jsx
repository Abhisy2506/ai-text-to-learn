import { useCourse } from '../context/CourseContext';
import EmptyState from '../components/Stage/EmptyState';
import CourseGridRecommendation from './CourseGridRecommendation';
import './pages.css';

export default function HomePage() {
  const {
    courses = [],
    isGenerating,
    isLoading,
  } = useCourse();

  if (isGenerating || (isLoading && courses.length === 0)) {
    return (
      <div className="home-page-container centered">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="home-page-container">
      <EmptyState />
      <CourseGridRecommendation />
    </div>
  );
}