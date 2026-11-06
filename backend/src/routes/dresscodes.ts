import { Router } from 'express';
import { queries } from '../config/database';

const router = Router();

// GET /api/dresscodes - Get all 7 dresscode seeds
router.get('/', (req, res) => {
  try {
    const dresscodes = queries.getAllDresscodes.all();

    const formatted = dresscodes.map((dc: any) => ({
      id: dc.id,
      day_index: dc.day_index,
      day: dc.day,
      fullName: dc.full_name,
      title: dc.title,
      score: `${dc.score_pct}%`,
      desc: dc.description,
      rule: dc.rule,
      crime: dc.crime,
      swatches: JSON.parse(dc.swatches_json),
      items: dc.items,
      status: dc.status
    }));

    res.json({ dresscodes: formatted });
  } catch (error) {
    console.error('Error fetching dresscodes:', error);
    res.status(500).json({ error: 'Failed to fetch dresscodes' });
  }
});

export default router;
