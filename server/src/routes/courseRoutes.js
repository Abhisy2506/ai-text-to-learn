import express from 'express';
import { 
  createCourse, 
  getCourses, 
  getCourseById, 
  deleteCourse,
  generateCourse // Add this
} from '../controllers/courseController.js';

import { checkJwt, attachUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate', checkJwt, attachUser, generateCourse);
router.post('/', checkJwt, attachUser, createCourse);

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.delete('/:id', checkJwt, attachUser, deleteCourse);
export default router;