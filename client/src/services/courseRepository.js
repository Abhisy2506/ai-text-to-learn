import api from './api';

const courseRepository = {
  // Generate a new course syllabus
  async generateCourse(topic, token, signal) {
    const res = await api.post(
      '/courses/generate',
      { topic },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal,
      }
    );
    return res.data?.data || res.data;
  },

  // Fetch single course
  async getCourse(courseId) {
    const res = await api.get(`/courses/${courseId}`);
    return res.data?.data || res.data;
  },

  // Fetch single lesson
  async getLesson(lessonId) {
    const res = await api.get(`/lessons/${lessonId}`);
    return res.data?.data || res.data;
  },

  // Enrich lesson
  async enrichLesson(lessonId, token) {
    const res = await api.post(
      `/lessons/${lessonId}/enrich`,
      {},
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
    return res.data?.data || res.data;
  },

  // Mark all un-enriched lessons in a course as stopped (batch stop)
  async stopCourseLessons(courseId, token) {
    const res = await api.patch(
      `/lessons/course/${courseId}/stop`,
      {},
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
    return res.data?.data || res.data;
  },

  // Delete course
  async deleteCourse(courseId, token) {
    const res = await api.delete(
      `/courses/${courseId}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
    return res.data?.data || res.data;
  },

  // Milestone 10: Generate or fetch cached Hinglish explanation and audio
  async getLessonHinglishAudio(lessonId, token, voiceName = 'Puck') {
    const res = await api.post(
      `/lessons/${lessonId}/hinglish-audio`,
      {},
      {
        params: { voiceName },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return res.data?.data || res.data;
  },
};

export default courseRepository;