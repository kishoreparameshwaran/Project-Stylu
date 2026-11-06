import { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { queries } from '../config/database';

const SESSION_COOKIE = 'stylu_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_secret_change_in_production';

// Generate anonymous handle like "@NeonDrifter"
function generateHandle(): string {
  const adjectives = [
    'Neon', 'Cosmic', 'Urban', 'Retro', 'Cyber', 'Electric', 'Quantum',
    'Digital', 'Chrome', 'Vapor', 'Pixel', 'Azure', 'Obsidian', 'Crimson'
  ];

  const nouns = [
    'Drifter', 'Runner', 'Rebel', 'Phoenix', 'Shadow', 'Ghost', 'Knight',
    'Rogue', 'Falcon', 'Storm', 'Wolf', 'Viper', 'Tiger', 'Dragon'
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.floor(Math.random() * 999);

  return `@${adj}${noun}${suffix}`;
}

// Sign session data
function signSession(userId: number): string {
  const payload = `${userId}`;
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
  return `${userId}.${signature}`;
}

// Verify and extract user ID from signed session
function verifySession(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [userIdStr, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(userIdStr)
    .digest('hex');

  if (signature !== expectedSignature) return null;

  const userId = parseInt(userIdStr, 10);
  return isNaN(userId) ? null : userId;
}

// Middleware: ensure user session exists (create guest if needed)
export function ensureSession(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.cookies[SESSION_COOKIE];
    let userId: number | null = null;

    // Try to verify existing session
    if (sessionToken) {
      userId = verifySession(sessionToken);
      if (userId) {
        const user = queries.findUserById.get(userId);
        if (user) {
          req.user = user;
          return next();
        }
      }
    }

    // Create new guest user
    let handle = generateHandle();
    let attempts = 0;

    // Ensure unique handle
    while (attempts < 10) {
      try {
        const newUser = queries.createUser.get(handle);
        const signedToken = signSession(newUser.id);

        res.cookie(SESSION_COOKIE, signedToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
        });

        req.user = newUser;
        return next();
      } catch (err: any) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          handle = generateHandle();
          attempts++;
        } else {
          throw err;
        }
      }
    }

    throw new Error('Failed to generate unique handle');
  } catch (error) {
    console.error('Session error:', error);
    return res.status(500).json({ error: 'Session initialization failed' });
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
