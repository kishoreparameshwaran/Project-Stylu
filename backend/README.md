# StylU / Outfit Court - Backend API

AI-powered fashion judgment system with retro arcade interface.

## Setup (Windows)

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
ANTHROPIC_API_KEY=your_actual_key_here
MOCK_AI=false  # Set to true to run without API key
```

### 3. Seed Database

```bash
npm run seed
```

This creates:
- 5 AI judges with unique personas
- 7 dresscode themes for the Lucky Wheel
- Database schema (SQLite in `data/stylu.db`)

### 4. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## API Endpoints (Phase 1)

### Judges
- `GET /api/judges` - List all 5 judges

### Dresscodes
- `GET /api/dresscodes` - Get 7 dresscode seeds for the wheel

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Lucky Wheel
- `GET /api/week-plan` - Get current 7-day plan
- `POST /api/wheel/spin` - Spin for a specific day (body: `{ day_index: 0-6 }`)
- `POST /api/wheel/auto-week` - Generate random full week plan

## Authentication

Guest sessions are created automatically via httpOnly cookies. No signup required.
Each guest gets a random handle like `@NeonDrifter247`.

## Testing

```bash
# Health check
curl http://localhost:3000/health

# Get judges
curl http://localhost:3000/api/judges

# Get dresscodes
curl http://localhost:3000/api/dresscodes
```

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Express server
│   ├── config/
│   │   └── database.ts       # SQLite setup & queries
│   ├── middleware/
│   │   ├── auth.ts           # Guest session management
│   │   └── validation.ts     # Zod schemas
│   ├── routes/
│   │   ├── judges.ts
│   │   ├── dresscodes.ts
│   │   ├── settings.ts
│   │   └── wheel.ts
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── seeds/
│       └── seed.ts           # Database seeding
├── data/
│   └── stylu.db             # SQLite database
├── uploads/                  # Image storage
└── package.json
```

## Next Phases

- **Phase 2**: Wheel frontend integration (completed endpoints)
- **Phase 3**: Image upload + MOCK_AI verdicts
- **Phase 4**: Real Claude API integration
- **Phase 5**: Leaderboards, voting, sharing
- **Phase 6**: Daily trials, streaks, duels

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment |
| `ANTHROPIC_API_KEY` | - | Claude API key |
| `AI_MODEL` | claude-sonnet-4-20250514 | Model to use |
| `MOCK_AI` | false | Use fake verdicts |
| `SESSION_SECRET` | (generated) | Cookie signing secret |
| `MAX_FILE_SIZE_MB` | 10 | Max upload size |
| `MAX_IMAGE_DIMENSION` | 1280 | Max image width/height |

## Database Schema

- **users**: Guest accounts with auto-generated handles
- **judges**: 5 AI personalities with unique prompts
- **trials**: Outfit submissions and AI verdicts
- **dresscodes**: 7 themed dress codes for the wheel
- **week_plans**: User's current 7-day assignments
- **trial_votes**: Jury voting system
- **duels**: 1v1 outfit battles
- **streaks**: Daily challenge tracking

## Mock AI Mode

Set `MOCK_AI=true` in `.env` to run without an API key. Returns believable fake verdicts for testing.
