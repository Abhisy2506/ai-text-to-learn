import express from 'express';
import courseRoutes from './courseRoutes.js';
import moduleRoutes from './moduleRoutes.js';
import lessonRoutes from './lessonRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/courses', courseRoutes);
router.use('/modules', moduleRoutes);
router.use('/lessons', lessonRoutes);
router.use('/users', userRoutes);

export default router;