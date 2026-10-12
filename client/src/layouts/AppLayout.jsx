import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import ChatInput from '../components/PromptBar/ChatInput';
import OfflineBanner from '../components/ui/OfflineBanner';
import './layout.css';

export default function AppLayout({
  courses = [],
  activeCourse,
  activeLesson,
  isLoading,
  isGenerating,
  isGenerationStopped,
  generationStatus,
  onSelectCourse,
  onSelectLesson,
  onNewCourse,
  onGenerateCourse,
  onDeleteCourse,
  isOnline
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCourseClick = (courseId) => {
    if (onSelectCourse) {
      onSelectCourse(courseId);
    }
    navigate(`/courses/${courseId}`);
  };

  // Route-aware new course/home reset
  const handleNewCourseClick = () => {
    if (onNewCourse) {
      onNewCourse();
    }
    navigate('/');
  };

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      {/* Persistent Navigation Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        courses={courses}
        activeCourseId={activeCourse?._id}
        onSelectCourse={handleCourseClick}
        onNewCourse={handleNewCourseClick}
        onDeleteCourse={onDeleteCourse}
      />

      <div className="main-viewport">
        {/* Offline indicator banner */}
        <OfflineBanner isOnline={isOnline} />

        {/* Global Loading Bar */}
        {isLoading && !isGenerating && !isGenerationStopped && (
          <div className="global-loading-bar"></div>
        )}

        {/* Persistent Top Navigation Bar */}
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          activeCourseTitle={activeCourse?.title}
        />

        {/* Dynamic Route Viewport */}
        <main className="content-stage">
          <Outlet
            context={{
              courses,
              activeCourse,
              activeLesson,
              isLoading,
              isGenerating,
              isGenerationStopped,
              generationStatus,
              isOnline,
              onSelectLesson,
              onGenerateCourse
            }}
          />
        </main>

        {/* Persistent Topic Prompt Bar */}
        <div className="prompt-bar-wrapper">
          <ChatInput
            onSendPrompt={onGenerateCourse}
            isLoading={isGenerating}
            placeholder={
              location.pathname !== '/' && activeCourse
                ? 'Ask a question or enter a new course topic...'
                : 'Enter a topic (e.g., "Full-Stack GraphQL with Node.js")...'
            }
            generationStatus={generationStatus}
          />
        </div>
      </div>
    </div>
  );
}