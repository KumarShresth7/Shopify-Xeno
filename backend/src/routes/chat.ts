import { Router } from 'express';
import { chatWithAnalyst } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

router.post('/', chatWithAnalyst);

export default router;