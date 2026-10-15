/**
 * Utility functions for courses and lessons across the client.
 */

/**
 * Normalizes MongoDB ObjectId representation.
 */
export function getId(item) {
  if (!item) return null;
  if (typeof item === 'object') {
    return item._id?.$oid || item._id || item.id || null;
  }
  return item;
}

/**
 * Sorts courses by creation date in descending order (newest first).
 */
export function sortCoursesByDate(courses = []) {
  if (!Array.isArray(courses)) return [];
  return [...courses].sort((a, b) => {
    const dateA = new Date(a?.createdAt?.$date || a?.createdAt || 0);
    const dateB = new Date(b?.createdAt?.$date || b?.createdAt || 0);
    return dateB - dateA;
  });
}

/**
 * Checks if a lesson generation was stopped or failed.
 */
export function isLessonStopped(lesson) {
  if (!lesson || typeof lesson !== 'object') return false;
  return Boolean(
    lesson.isGenerationStopped ||
    lesson.status === 'stopped' ||
    lesson.status === 'failed' ||
    lesson.isEnriched === 'failed'
  );
}

/**
 * Checks if a lesson has been enriched and is ready to read.
 */
export function isLessonReady(lesson) {
  if (!lesson || typeof lesson !== 'object') return false;
  return lesson.isEnriched === true && lesson.status !== 'failed';
}

