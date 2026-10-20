import { Router } from 'express';
import { CompareController } from '../controllers/compare.controller.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protect compare endpoint with authentication
router.use(requireAuth);

router.get('/', CompareController.compareDevelopers);

export default router;
