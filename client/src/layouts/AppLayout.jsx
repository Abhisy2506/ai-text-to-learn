import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import ChatInput from '../components/PromptBar/ChatInput';
import OfflineBanner from '../components/ui/OfflineBanner';
import { useCourse } from '../context/CourseContext';
import { getId } from '../utils/courseUtils';
import './layout.css';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const { 
    isLoading, 
    isGenerating, 
    isOnline,
    generatingCourseId,
    activeCourse,
    generationStatus 
  } = useCourse();

  // 1. Are we on the Home Page?
  const isHomePage = location.pathname === '/';

  // 2. Is this specific course currently running background generation?
  const isActivelyEnriching = Boolean(
    generatingCourseId && 
    generatingCourseId === getId(activeCourse)
  );

  // 3. Hide ChatInput
  const hideChatInput = !isHomePage && (!isActivelyEnriching || generationStatus?.isComplete);

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <Sidebar isOpen={isSidebarOpen} />

      <div className="main-viewport">
        <OfflineBanner isOnline={isOnline} />

        {/* Global Loading Bar - removed isGenerationStopped check */}
        {isLoading && !isGenerating && (
          <div className="global-loading-bar" />
        )}

        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="content-stage">
          <Outlet />
        </main>

        {/* ChatInput appears on Home Page OR during active course enrichment */}
        {!hideChatInput && (
          <div className="prompt-bar-wrapper">
            <ChatInput />
          </div>
        )}
      </div>
    </div>
  );
}