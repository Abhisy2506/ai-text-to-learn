import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import AppLayout from './layouts/AppLayout';
import HomePage from './pages/HomePage';
import CourseOverviewPage from './pages/CourseOverviewPage';
import LessonPage from './pages/LessonPage';

// Context & Global Hooks
import { CourseProvider } from './context/CourseContext';
import useNetworkStatus from './hooks/useNetworkStatus';

export default function App() {
  const { isLoading: isAuthLoading } = useAuth0();
  const { isOnline } = useNetworkStatus();

  if (isAuthLoading && isOnline) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-primary, #0e1117)',
          color: 'var(--text-secondary, #8b949e)',
          fontFamily: 'var(--font-family, sans-serif)',
        }}
      >
        Authenticating session...
      </div>
    );
  }

  return (
    <CourseProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="courses/:courseId" element={<CourseOverviewPage />} />
          <Route path="lessons/:lessonId" element={<LessonPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </CourseProvider>
  );
}