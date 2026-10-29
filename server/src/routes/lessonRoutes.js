import express from 'express';
import { 
  createLesson, 
  getLessonById, 
  getLessonsByModule,
  enrichLesson,
  markLessonStopped,
  stopRemainingLessonsInCourse,
  getHinglishAudioExplanation,
} from '../controllers/lessonController.js';

const router = express.Router();

// Existing routes
router.post('/', createLesson);
router.post('/:id/enrich', enrichLesson);
router.get('/:id', getLessonById);
router.get('/module/:moduleId', getLessonsByModule);

// Routes to mark generation as stopped (supports POST for sendBeacon and PATCH)
router.route('/:id/stop')
  .post(markLessonStopped)
  .patch(markLessonStopped);

router.route('/course/:courseId/stop')
  .post(stopRemainingLessonsInCourse)
  .patch(stopRemainingLessonsInCourse);

//Hinglish text & Gemini TTS audio explanation endpoint
router.post('/:lessonId/hinglish-audio', getHinglishAudioExplanation);

export default router;