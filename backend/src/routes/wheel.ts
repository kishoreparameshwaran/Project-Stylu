import { Router } from 'express';
import { queries } from '../config/database';
import crypto from 'crypto';

const router = Router();

// Get current week start (Monday)
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Cryptographically random segment selection
function getRandomSegment(): number {
  const randomBytes = crypto.randomBytes(4);
  const randomValue = randomBytes.readUInt32BE(0);
  return randomValue % 7;
}

// GET /api/week-plan or /api/wheel/week-plan
router.get(['/', '/week-plan'], (req, res) => {
  try {
    const weekStart = getWeekStart();
    let plan = queries.getWeekPlan.get(req.user.id, weekStart);

    if (!plan) {
      // Create default plan with shuffled dresscodes
      const dresscodes = queries.getAllDresscodes.all();
      const shuffled = [...dresscodes].sort(() => Math.random() - 0.5);
      const slots = shuffled.map((dc: any) => dc.id);

      plan = queries.createWeekPlan.get(
        req.user.id,
        weekStart,
        JSON.stringify(slots)
      );
    }

    const slots = JSON.parse(plan.slots_json);
    const dresscodes = queries.getAllDresscodes.all();

    const weekPlan = slots.map((dresscodeId: number, dayIndex: number) => {
      const dc: any = dresscodes.find((d: any) => d.id === dresscodeId);
      return {
        day_index: dayIndex,
        dresscode: {
          id: dc.id,
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
        }
      };
    });

    res.json({
      week_start: weekStart,
      plan: weekPlan
    });
  } catch (error) {
    console.error('Error fetching week plan:', error);
    res.status(500).json({ error: 'Failed to fetch week plan' });
  }
});

// PUT /api/week-plan/:day_index - Manual slot override
router.put(['/:day_index', '/week-plan/:day_index'], (req, res) => {
  try {
    const dayIndex = parseInt(req.params.day_index, 10);
    const { dresscode_id } = req.body;

    if (isNaN(dayIndex) || dayIndex < 0 || dayIndex > 6) {
      return res.status(400).json({ error: 'Invalid day_index (0-6)' });
    }

    if (!dresscode_id) {
      return res.status(400).json({ error: 'Missing dresscode_id' });
    }

    const weekStart = getWeekStart();
    let plan = queries.getWeekPlan.get(req.user.id, weekStart);

    if (!plan) {
      const dresscodes = queries.getAllDresscodes.all();
      const slots = dresscodes.map((dc: any) => dc.id);
      plan = queries.createWeekPlan.get(req.user.id, weekStart, JSON.stringify(slots));
    }

    const slots = JSON.parse(plan.slots_json);
    slots[dayIndex] = Number(dresscode_id);

    queries.updateWeekPlan.run(
      JSON.stringify(slots),
      req.user.id,
      weekStart
    );

    const dresscodes = queries.getAllDresscodes.all();
    const updatedDc: any = dresscodes.find((d: any) => d.id === Number(dresscode_id));

    res.json({
      success: true,
      day_index: dayIndex,
      dresscode: updatedDc ? {
        id: updatedDc.id,
        day: updatedDc.day,
        fullName: updatedDc.full_name,
        title: updatedDc.title,
        score: `${updatedDc.score_pct}%`,
        desc: updatedDc.description,
        rule: updatedDc.rule,
        crime: updatedDc.crime,
        swatches: JSON.parse(updatedDc.swatches_json),
        items: updatedDc.items,
        status: updatedDc.status
      } : null
    });
  } catch (error) {
    console.error('Error updating slot:', error);
    res.status(500).json({ error: 'Failed to update slot' });
  }
});

// POST /api/wheel/spin
router.post('/spin', (req, res) => {
  try {
    const { day_index } = req.body;

    if (day_index === undefined || day_index < 0 || day_index > 6) {
      return res.status(400).json({ error: 'Invalid day_index (0-6)' });
    }

    const weekStart = getWeekStart();
    let plan = queries.getWeekPlan.get(req.user.id, weekStart);

    if (!plan) {
      // Create default plan
      const dresscodes = queries.getAllDresscodes.all();
      const shuffled = [...dresscodes].sort(() => Math.random() - 0.5);
      const slots = shuffled.map((dc: any) => dc.id);

      plan = queries.createWeekPlan.get(
        req.user.id,
        weekStart,
        JSON.stringify(slots)
      );
    }

    const slots = JSON.parse(plan.slots_json);
    const segmentIndex = getRandomSegment();
    const dresscodes = queries.getAllDresscodes.all();
    const selectedDresscode: any = dresscodes[segmentIndex];

    // Update the slot
    slots[day_index] = selectedDresscode.id;
    queries.updateWeekPlan.run(
      JSON.stringify(slots),
      req.user.id,
      weekStart
    );

    res.json({
      segment_index: segmentIndex,
      assigned_day_index: day_index,
      dresscode: {
        id: selectedDresscode.id,
        day: selectedDresscode.day,
        fullName: selectedDresscode.full_name,
        title: selectedDresscode.title,
        score: `${selectedDresscode.score_pct}%`,
        desc: selectedDresscode.description,
        rule: selectedDresscode.rule,
        crime: selectedDresscode.crime,
        swatches: JSON.parse(selectedDresscode.swatches_json),
        items: selectedDresscode.items,
        status: selectedDresscode.status
      }
    });
  } catch (error) {
    console.error('Error spinning wheel:', error);
    res.status(500).json({ error: 'Failed to spin wheel' });
  }
});

// POST /api/wheel/auto-week
router.post('/auto-week', (req, res) => {
  try {
    const weekStart = getWeekStart();
    const dresscodes = queries.getAllDresscodes.all();
    const shuffled = [...dresscodes].sort(() => Math.random() - 0.5);
    const slots = shuffled.map((dc: any) => dc.id);

    // Update or create plan
    const existing = queries.getWeekPlan.get(req.user.id, weekStart);

    if (existing) {
      queries.updateWeekPlan.run(
        JSON.stringify(slots),
        req.user.id,
        weekStart
      );
    } else {
      queries.createWeekPlan.get(
        req.user.id,
        weekStart,
        JSON.stringify(slots)
      );
    }

    const weekPlan = slots.map((dresscodeId: number, dayIndex: number) => {
      const dc: any = dresscodes.find((d: any) => d.id === dresscodeId);
      return {
        day_index: dayIndex,
        dresscode: {
          id: dc.id,
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
        }
      };
    });

    res.json({
      week_start: weekStart,
      plan: weekPlan
    });
  } catch (error) {
    console.error('Error generating week plan:', error);
    res.status(500).json({ error: 'Failed to generate week plan' });
  }
});

export default router;
