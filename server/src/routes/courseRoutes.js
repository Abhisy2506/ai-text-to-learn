import express from 'express';
import { 
  createCourse, 
  getCourses, 
  getCourseById, 
  deleteCourse 
} from '../controllers/courseController.js';

const router = express.Router();

router.post('/', createCourse);
router.get('/', getCourses);
router.get('/:id', getCourseById);
router.delete('/:id', deleteCourse);

export default router;