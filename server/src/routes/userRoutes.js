import express from 'express';
import { syncUser, getUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.post('/sync', syncUser);
router.get('/:auth0Id', getUserProfile);

export default router;