import { createContext, useContext, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

import courseRepository from '../services/courseRepository';
import { getId } from '../utils/courseUtils';

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

  // Handlers
  const handleSelectCourse = async (courseId) => {
    try {
      setIsLoading(true);
      const courseData = await courseRepository.getCourse(courseId);
      setActiveCourse(courseData);
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCourse = async (topic) => {
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
        alert('Error generating course: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewCourse = () => {
    setActiveCourse(null);
    setActiveLesson(null);
    setGeneratingCourseId(null);
    navigate('/');
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
    onSelectCourse: handleSelectCourse,
    onNewCourse: handleNewCourse,
    onGenerateCourse: handleGenerateCourse,
    onDeleteCourse: handleDeleteCourse,
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
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