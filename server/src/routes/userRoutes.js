import express from 'express';
import { syncUser, getUserProfile, getCurrentUser } from '../controllers/userController.js';
import { checkJwt, attachUser } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/sync', syncUser);

router.get('/me', checkJwt, attachUser, getCurrentUser);

router.get('/:auth0Id', getUserProfile);

export default router;