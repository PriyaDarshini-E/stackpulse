import { Router } from 'express';
import { PinsController } from '../controllers/pins.controller.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all pin endpoints with requireAuth
router.use(requireAuth);

router.get('/', PinsController.getPins);
router.post('/', PinsController.createPin);
router.patch('/:id', PinsController.updatePin);
router.delete('/:id', PinsController.deletePin);

export default router;
