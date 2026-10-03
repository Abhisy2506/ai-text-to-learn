import express from 'express';
import { createModule, getModuleById } from '../controllers/moduleController.js';

const router = express.Router();

router.post('/', createModule);
router.get('/:id', getModuleById);

export default router;