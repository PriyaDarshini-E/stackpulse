import { Router } from 'express';
import { ComparisonController } from '../controllers/comparison.controller.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all comparison endpoints with requireAuth
router.use(requireAuth);

router.get('/', ComparisonController.getComparisons);
router.post('/', ComparisonController.createComparison);
router.get('/:id', ComparisonController.getComparisonById);
router.patch('/:id', ComparisonController.updateComparison);
router.delete('/:id', ComparisonController.deleteComparison);

export default router;
