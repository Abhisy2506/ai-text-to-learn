import express from 'express';
import { 
  createLesson, 
  getLessonById, 
  getLessonsByModule,
  enrichLesson
} from '../controllers/lessonController.js';

const router = express.Router();

router.post('/', createLesson);
router.post('/:id/enrich', enrichLesson);
router.get('/:id', getLessonById);
router.get('/module/:moduleId', getLessonsByModule);

export default router;