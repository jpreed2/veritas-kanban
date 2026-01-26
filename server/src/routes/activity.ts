import { Router, type Router as RouterType } from 'express';
import { activityService } from '../services/activity-service.js';

const router: RouterType = Router();

// GET /api/activity - Get recent activities
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const activities = await activityService.getActivities(limit);
    res.json(activities);
  } catch (error) {
    console.error('Error getting activities:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

// DELETE /api/activity - Clear all activities
router.delete('/', async (_req, res) => {
  try {
    await activityService.clearActivities();
    res.status(204).send();
  } catch (error) {
    console.error('Error clearing activities:', error);
    res.status(500).json({ error: 'Failed to clear activities' });
  }
});

export default router;
