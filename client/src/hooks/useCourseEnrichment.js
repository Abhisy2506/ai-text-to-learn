import { useState, useEffect } from 'react';
import courseRepository from '../services/courseRepository';
import { getId, isLessonReady } from '../utils/courseUtils';

/**
 * Manages sequential background lesson enrichment and progress status reporting.
 */
export default function useCourseEnrichment({
  activeCourse,
  setActiveCourse,
  setActiveLesson,
  isOnline,
  isAuthenticated,
  getAccessTokenSilently,
}) {
  const [generatingCourseId, setGeneratingCourseId] = useState(null);

  // Calculate real-time generation progress when this course is being enriched
  let generationStatus = null;
  const activeCourseId = getId(activeCourse);

  if (activeCourse?.modules && activeCourseId === generatingCourseId) {
    let totalLessons = 0;
    let completedLessons = 0;
    let currentWorkingModule = null;

    for (let i = 0; i < activeCourse.modules.length; i++) {
      const mod = activeCourse.modules[i];
      const modTitle = typeof mod === 'object' && mod?.title ? mod.title : `Module ${i + 1}`;
      const lessons = typeof mod === 'object' && Array.isArray(mod?.lessons) ? mod.lessons : [];

      for (const les of lessons) {
        totalLessons++;
        const isEnriched = typeof les === 'object' && les !== null ? les.isEnriched : false;

        if (isEnriched === true || isEnriched === 'failed') {
          completedLessons++;
        } else if (!currentWorkingModule) {
          currentWorkingModule = modTitle;
        }
      }
    }

    const isAllDone = totalLessons > 0 && completedLessons >= totalLessons;

    if (totalLessons > 0) {
      generationStatus = {
        isComplete: isAllDone,
        text: isAllDone
          ? 'All course modules successfully generated!'
          : `Generating content for: ${currentWorkingModule || 'lessons'}... (${completedLessons}/${totalLessons} lessons ready)`,
      };
    }
  }

  // Clear generating ID promptly once complete
  useEffect(() => {
    if (generationStatus?.isComplete) {
      const timer = setTimeout(() => {
        setGeneratingCourseId(null);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [generationStatus?.isComplete]);

  // Background Sequential Enrichment Loop
  useEffect(() => {
    let isMounted = true;

    const runAutoEnrichment = async () => {
      if (!isOnline || !activeCourse || !isAuthenticated) return;
      if (generatingCourseId !== activeCourseId) return;

      // Find the first un-enriched lesson in the active course
      let targetLessonId = null;
      for (const mod of activeCourse.modules || []) {
        for (const les of mod.lessons || []) {
          const isEnriched = typeof les === 'object' && les !== null ? les.isEnriched : false;
          if (!isEnriched) {
            targetLessonId = getId(les);
            break;
          }
        }
        if (targetLessonId) break;
      }

      if (!targetLessonId) return;

      try {
        const token = await getAccessTokenSilently();
        const enrichedLesson = await courseRepository.enrichLesson(targetLessonId, token);

        if (!isMounted) return;

        // Immutably update active course lessons in state
        setActiveCourse((prevCourse) => {
          if (!prevCourse || getId(prevCourse) !== activeCourseId) return prevCourse;
          const updatedModules = prevCourse.modules.map((mod) => ({
            ...mod,
            lessons: (mod.lessons || []).map((les) => {
              const currentId = getId(les);
              return currentId === targetLessonId
                ? (typeof les === 'object' && les !== null
                    ? { ...les, isEnriched: true, isGenerationStopped: false }
                    : { _id: currentId, isEnriched: true, isGenerationStopped: false })
                : les;
            }),
          }));

          return { ...prevCourse, modules: updatedModules };
        });

        // Update active lesson if currently open
        setActiveLesson((prevLesson) => {
          if (prevLesson && getId(prevLesson) === targetLessonId) {
            return enrichedLesson;
          }
          return prevLesson;
        });
      } catch (error) {
        console.error('Auto-enrichment failed for lesson:', targetLessonId, error);

        if (isMounted) {
          await stopEnrichment(activeCourseId);
        }
      }
    };

    // 6000ms delay protects against Groq's 8K TPM rate limit
    const timer = setTimeout(() => {
      runAutoEnrichment();
    }, 6000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    activeCourse,
    activeCourseId,
    isAuthenticated,
    generatingCourseId,
    isOnline,
    getAccessTokenSilently,
    setActiveCourse,
    setActiveLesson,
  ]);

  const stopEnrichment = async (courseIdToStop = activeCourseId) => {
    setGeneratingCourseId(null);

    // Immediately mark remaining un-enriched lessons in state as stopped
    setActiveCourse((prevCourse) => {
      if (!prevCourse) return prevCourse;
      const updatedModules = (prevCourse.modules || []).map((mod) => ({
        ...mod,
        lessons: (mod.lessons || []).map((les) => {
          const currentId = getId(les);
          if (isLessonReady(les)) return les;

          return typeof les === 'object' && les !== null
            ? { ...les, isEnriched: 'failed', isGenerationStopped: true, status: 'stopped' }
            : { _id: currentId, isEnriched: 'failed', isGenerationStopped: true, status: 'stopped' };
        }),
      }));
      return { ...prevCourse, modules: updatedModules };
    });

    // Immediately mark activeLesson as stopped if open and not ready
    setActiveLesson((prevLesson) => {
      if (prevLesson && !isLessonReady(prevLesson)) {
        return {
          ...prevLesson,
          isEnriched: 'failed',
          isGenerationStopped: true,
          status: 'stopped',
        };
      }
      return prevLesson;
    });

    // Notify backend in background to persist stopped state
    if (courseIdToStop) {
      try {
        const token = await getAccessTokenSilently().catch(() => null);
        await courseRepository.stopCourseLessons(courseIdToStop, token);
      } catch (err) {
        console.error('Failed to stop course lessons on backend:', err);
      }
    }
  };

  return {
    generatingCourseId,
    setGeneratingCourseId,
    generationStatus,
    stopEnrichment,
  };
}