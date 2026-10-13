import express from 'express';
import { 
  getCourses, 
  getCourseById, 
  deleteCourse,
  generateCourse
} from '../controllers/courseController.js';

import { checkJwt, attachUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/generate', checkJwt, attachUser, generateCourse);

router.get('/', getCourses);
router.get('/:id', getCourseById);
router.delete('/:id', checkJwt, attachUser, deleteCourse);
export default router;