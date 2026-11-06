import { Router } from 'express';
import { queries } from '../config/database';

const router = Router();

// GET /api/judges - List all judges
router.get('/', (req, res) => {
  try {
    const judges = queries.getAllJudges.all();

    const formatted = judges.map((judge: any) => ({
      slug: judge.slug,
      channel_no: judge.channel_no,
      name: judge.name,
      severity: judge.severity
    }));

    res.json({ judges: formatted });
  } catch (error) {
    console.error('Error fetching judges:', error);
    res.status(500).json({ error: 'Failed to fetch judges' });
  }
});

export default router;
