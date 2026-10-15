import { createContext, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

import courseRepository from '../services/courseRepository';
import { getId } from '../utils/courseUtils';

import LoginModal from '../components/ui/LoginModal';
import UnsavedChangesModal from '../components/ui/UnsavedChangesModal';

// Hooks
import useNetworkStatus from '../hooks/useNetworkStatus';
import useSessionState from '../hooks/useSessionState';
import useUserSync from '../hooks/useUserSync';
import usePreventUnload from '../hooks/usePreventUnload';
import useCourseEnrichment from '../hooks/useCourseEnrichment';

const CourseContext = createContext(null);

export function CourseProvider({ children }) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  const abortControllerRef = useRef(null);

  const navigate = useNavigate();
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  // 1. Network Status Hook
  const { isOnline } = useNetworkStatus();

  // 2. Session Storage Hooks
  const [activeCourse, setActiveCourse] = useSessionState('learnai_active_course', null);
  const [activeLesson, setActiveLesson] = useSessionState('learnai_active_lesson', null);

  // 3. User Sync Hook
  useUserSync({ user, isAuthenticated, isOnline, setCourses });

  // 4. Background Enrichment Hook
  const {
    generatingCourseId,
    setGeneratingCourseId,
    generationStatus,
    stopEnrichment,
  } = useCourseEnrichment({
    activeCourse,
    setActiveCourse,
    setActiveLesson,
    isOnline,
    isAuthenticated,
    getAccessTokenSilently,
  });

  // 5. Tab Protection Hook
  const isWorkInProgress = isGenerating || Boolean(generatingCourseId);
  usePreventUnload(isWorkInProgress, abortControllerRef, getId(activeCourse));

  // Execution helpers
  const executeSelectCourse = async (courseId) => {
    try {
      setIsLoading(true);
      const courseData = await courseRepository.getCourse(courseId);
      setActiveCourse(courseData);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const executeNewCourse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveCourse(null);
    setActiveLesson(null);
    setGeneratingCourseId(null);
    navigate('/');
  };

  // Handlers
  const handleSelectCourse = async (courseId) => {
    if (getId(activeCourse) === courseId) return;

    if (isWorkInProgress) {
      setPendingAction(() => () => executeSelectCourse(courseId));
      setShowUnsavedModal(true);
      return;
    }

    executeSelectCourse(courseId);
  };

  const handleGenerateCourse = async (topic) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!isOnline) {
      alert('You are currently offline. Connect to the internet to generate new courses.');
      return;
    }

    abortControllerRef.current = new AbortController();

    try {
      setIsGenerating(true);
      const token = await getAccessTokenSilently();

      const newCourse = await courseRepository.generateCourse(
        topic,
        token,
        abortControllerRef.current.signal
      );

      const newCourseId = getId(newCourse);
      setCourses((prev) => [newCourse, ...prev]);
      setActiveCourse(newCourse);
      setGeneratingCourseId(newCourseId);

      navigate(`/courses/${newCourseId}`);
    } catch (err) {
      if (!axios.isCancel(err) && err.name !== 'CanceledError') {
        console.error('Failed to generate course:', err);

        const isAuthError =
          err.error === 'login_required' ||
          err.message?.includes('Missing Refresh Token') ||
          err.message?.includes('login required') ||
          err.response?.status === 401;

        if (isAuthError) {
          setShowLoginModal(true);
        } else {
          alert('Error generating course: ' + (err.response?.data?.message || err.message));
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewCourse = () => {
    if (isWorkInProgress) {
      setPendingAction(() => () => executeNewCourse());
      setShowUnsavedModal(true);
      return;
    }

    executeNewCourse();
  };

  const handleConfirmLeave = () => {
    setShowUnsavedModal(false);
    if (isWorkInProgress) {
      stopEnrichment(getId(activeCourse));
    }
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancelLeave = () => {
    setShowUnsavedModal(false);
    setPendingAction(null);
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      setIsLoading(true);
      const token = isOnline ? await getAccessTokenSilently() : null;
      await courseRepository.deleteCourse(courseId, token);

      setCourses((prevCourses) => prevCourses.filter((c) => getId(c) !== courseId));
      if (getId(activeCourse) === courseId) {
        handleNewCourse();
      }
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert('Error deleting course.');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    courses,
    activeCourse,
    setActiveCourse,
    activeLesson,
    setActiveLesson,
    isLoading,
    isGenerating,
    generatingCourseId,
    setGeneratingCourseId,
    generationStatus,
    isOnline,
    showUnsavedModal,
    onConfirmLeave: handleConfirmLeave,
    onCancelLeave: handleCancelLeave,
    onStopGeneration: stopEnrichment,
    openLoginModal: () => setShowLoginModal(true),
    onSelectCourse: handleSelectCourse,
    onNewCourse: handleNewCourse,
    onGenerateCourse: handleGenerateCourse,
    onDeleteCourse: handleDeleteCourse,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      <UnsavedChangesModal />
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
}