import api from './api';

const courseRepository = {
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

  // Delete course
  async deleteCourse(courseId, token) {
    const res = await api.delete(
      `/courses/${courseId}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
    return res.data?.data || res.data;
  }
};

export default courseRepository;