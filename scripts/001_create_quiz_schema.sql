-- Quiz Live App Schema
-- Tables for rooms, questions, players, and answers

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(4) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Current question state (for real-time updates)
CREATE TABLE IF NOT EXISTS current_question (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  timer_start TIMESTAMPTZ,
  timer_duration INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  pseudo VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  selected_option VARCHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, question_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_questions_room_id ON questions(room_id);
CREATE INDEX IF NOT EXISTS idx_players_room_id ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_answers_player_id ON answers(player_id);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_current_question_room_id ON current_question(room_id);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE current_question ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Public policies (no auth required for this app)
CREATE POLICY "rooms_public_read" ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_public_insert" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "rooms_public_update" ON rooms FOR UPDATE USING (true);
CREATE POLICY "rooms_public_delete" ON rooms FOR DELETE USING (true);

CREATE POLICY "questions_public_read" ON questions FOR SELECT USING (true);
CREATE POLICY "questions_public_insert" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "questions_public_update" ON questions FOR UPDATE USING (true);
CREATE POLICY "questions_public_delete" ON questions FOR DELETE USING (true);

CREATE POLICY "current_question_public_read" ON current_question FOR SELECT USING (true);
CREATE POLICY "current_question_public_insert" ON current_question FOR INSERT WITH CHECK (true);
CREATE POLICY "current_question_public_update" ON current_question FOR UPDATE USING (true);
CREATE POLICY "current_question_public_delete" ON current_question FOR DELETE USING (true);

CREATE POLICY "players_public_read" ON players FOR SELECT USING (true);
CREATE POLICY "players_public_insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_public_update" ON players FOR UPDATE USING (true);
CREATE POLICY "players_public_delete" ON players FOR DELETE USING (true);

CREATE POLICY "answers_public_read" ON answers FOR SELECT USING (true);
CREATE POLICY "answers_public_insert" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "answers_public_update" ON answers FOR UPDATE USING (true);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
ALTER PUBLICATION supabase_realtime ADD TABLE current_question;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
