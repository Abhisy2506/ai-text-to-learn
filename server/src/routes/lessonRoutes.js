import express from 'express';
import { createLesson, getLessonById } from '../controllers/lessonController.js';

const router = express.Router();

router.post('/', createLesson);
router.get('/:id', getLessonById);

export default router;  