import { Router } from 'express';
import { queries } from '../config/database';
import { settingsSchema } from '../middleware/validation';
import { DEFAULT_SETTINGS } from '../types';

const router = Router();

// GET /api/settings
router.get('/', (req, res) => {
  try {
    const user = req.user;
    const settings = user.settings_json
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(user.settings_json) }
      : DEFAULT_SETTINGS;

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings
router.put('/', (req, res) => {
  try {
    const validation = settingsSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid settings',
        details: validation.error.issues
      });
    }

    const user = req.user;
    const currentSettings = user.settings_json
      ? JSON.parse(user.settings_json)
      : {};

    const updatedSettings = {
      ...DEFAULT_SETTINGS,
      ...currentSettings,
      ...validation.data
    };

    queries.updateUserSettings.run(
      JSON.stringify(updatedSettings),
      user.id
    );

    res.json({ settings: updatedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
