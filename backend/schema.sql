-- ====================================================================
-- OUTFIT COURT - SUPABASE / POSTGRESQL PRODUCTION SCHEMA
-- Full Row Level Security (RLS), Triggers, & Indexes
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- Links to supabase auth.users
    email TEXT UNIQUE,
    handle TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    streak_count INT DEFAULT 0,
    best_streak INT DEFAULT 0,
    guilty_count INT DEFAULT 0,
    not_guilty_count INT DEFAULT 0,
    current_persona_id TEXT DEFAULT 'genz_judge',
    sound_enabled BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CASES TABLE (Outfit Submissions & Verdicts)
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number TEXT UNIQUE NOT NULL,
    defendant_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    defendant_name TEXT NOT NULL,
    submission_type TEXT NOT NULL CHECK (submission_type IN ('quick', 'photo')),
    photo_url TEXT,
    quick_details JSONB, -- { top: string, bottoms: string, shoes: string, extras: string[], mood: string }
    judge_persona TEXT NOT NULL CHECK (judge_persona IN ('strict_auntie', 'genz_judge', 'news_anchor', 'sarcastic_stylist', 'mama_judge')),
    verdict TEXT NOT NULL CHECK (verdict IN ('GUILTY', 'NOT_GUILTY')),
    fit_score NUMERIC(3, 1) NOT NULL CHECK (fit_score >= 0 AND fit_score <= 10),
    charges JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of 3 strings (charges or compliments)
    sentence TEXT NOT NULL, -- Judge's final dramatic sentence or ruling
    category_scores JSONB NOT NULL, -- { colour_match: int, fit: int, originality: int, confidence: int, weather_appropriateness: int }
    fix_tips JSONB DEFAULT '[]'::jsonb, -- Wardrobe Lawyer actionable recommendations
    is_appealed BOOLEAN DEFAULT FALSE,
    appeal_verdict JSONB, -- Full secondary verdict if appealed
    guilty_votes INT DEFAULT 0,
    not_guilty_votes INT DEFAULT 0,
    is_public BOOLEAN DEFAULT TRUE,
    daily_trial_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JURY VOTES TABLE
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    voter_session_id TEXT NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('GUILTY', 'NOT_GUILTY')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_vote_per_case UNIQUE (case_id, voter_session_id)
);

-- 4. ACHIEVEMENTS CATALOG
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER ACHIEVEMENTS (Unlocked Badges)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- 6. DAILY TRIALS (Daily Outfit Themes)
CREATE TABLE IF NOT EXISTS public.daily_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trial_date DATE UNIQUE NOT NULL,
    theme_title TEXT NOT NULL,
    description TEXT NOT NULL,
    rule_constraints JSONB DEFAULT '{}'::jsonb,
    total_submissions INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DUELS TABLE (Outfit vs Outfit Friend Showdowns)
CREATE TABLE IF NOT EXISTS public.duels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenger_case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    opponent_case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
    judge_persona TEXT NOT NULL,
    winner_case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
    verdict_reasoning TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'declined')),
    share_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ABUSE & CONTENT REPORTS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- SEED INITIAL ACHIEVEMENTS
-- ====================================================================
INSERT INTO public.achievements (id, title, description, badge_icon, tier) VALUES
('first_offence', 'First Offence', 'Submitted your very first outfit for trial', '⚖️', 'bronze'),
('repeat_offender', 'Repeat Offender', 'Put 5 or more fits in front of the judge', '🚨', 'silver'),
('fashion_icon', 'Fashion Icon', 'Secured 5 NOT GUILTY verdicts in a row', '👑', 'gold'),
('appeal_master', 'Appeal Master', 'Successfully overturned a GUILTY verdict on appeal', '🔄', 'gold'),
('social_butterfly', 'Social Butterfly', 'Shared a case card to social media or friends', '🦋', 'bronze'),
('jury_duty', 'Jury Duty Done', 'Cast 10 jury votes on other defenders outfits', '🗳️', 'silver'),
('duel_champion', 'Duel Champion', 'Won an outfit face-off against a friend', '⚔️', 'platinum')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Public read user profiles" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can delete own account" ON public.users FOR DELETE USING (auth.uid() = auth_id);

-- CASES POLICIES
CREATE POLICY "Public read public cases" ON public.cases FOR SELECT USING (is_public = true OR auth.uid() = (SELECT auth_id FROM public.users WHERE id = defendant_id));
CREATE POLICY "Anyone can create a case" ON public.cases FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can update own case (appeal)" ON public.cases FOR UPDATE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = defendant_id) OR defendant_id IS NULL);
CREATE POLICY "Owner can delete own case" ON public.cases FOR DELETE USING (auth.uid() = (SELECT auth_id FROM public.users WHERE id = defendant_id));

-- VOTES POLICIES
CREATE POLICY "Public read votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Anyone can cast vote once" ON public.votes FOR INSERT WITH CHECK (true);

-- ACHIEVEMENTS POLICIES
CREATE POLICY "Public read achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Public read user achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);

-- DAILY TRIALS POLICIES
CREATE POLICY "Public read daily trials" ON public.daily_trials FOR SELECT USING (true);

-- DUELS POLICIES
CREATE POLICY "Public read duels" ON public.duels FOR SELECT USING (true);
CREATE POLICY "Anyone can create duel" ON public.duels FOR INSERT WITH CHECK (true);
CREATE POLICY "Duel participants can update" ON public.duels FOR UPDATE USING (true);

-- REPORTS POLICIES
CREATE POLICY "Users can submit reports" ON public.reports FOR INSERT WITH CHECK (true);

-- ====================================================================
-- AUTO-INCREMENT VOTE COUNTS TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION update_case_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.vote = 'GUILTY' THEN
        UPDATE public.cases SET guilty_votes = guilty_votes + 1 WHERE id = NEW.case_id;
    ELSIF NEW.vote = 'NOT_GUILTY' THEN
        UPDATE public.cases SET not_guilty_votes = not_guilty_votes + 1 WHERE id = NEW.case_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vote_counts ON public.votes;
CREATE TRIGGER trg_vote_counts
AFTER INSERT ON public.votes
FOR EACH ROW EXECUTE FUNCTION update_case_vote_counts();
