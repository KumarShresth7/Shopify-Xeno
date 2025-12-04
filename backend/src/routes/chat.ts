import { Router } from 'express';
import { chatWithAnalyst } from '../controllers/chatController.js';

const router = Router();
router.post('/', chatWithAnalyst);

export default router;