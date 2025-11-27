import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
    validateRegister,
    validateLogin,
    handleValidationErrors,
} from '../utils/validators.js';

const router = Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.get('/me', authenticate, getMe);

export default router;
