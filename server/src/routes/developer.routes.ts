import { Router } from 'express';
import { DeveloperController } from '../controllers/developer.controller.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all developer endpoints with requireAuth
router.use(requireAuth);

router.get('/:username', DeveloperController.getProfile);
router.get('/:username/repos', DeveloperController.getRepos);

export default router;
