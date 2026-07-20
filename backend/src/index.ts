import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/pool';

// Importar routers
import authRouter        from './routes/auth';
import communitiesRouter from './routes/communities';
import tournamentsRouter from './routes/tournaments';
import postsRouter       from './routes/posts';
import playersRouter     from './routes/players';
import teamsRouter       from './routes/teams';
import usersRouter       from './routes/users';
import reportsRouter     from './routes/reports';
import './services/cronService'; // Start cron jobs

dotenv.config();

// ============================================================
// MIGRACIONES AUTOMÁTICAS — Cada una corre de forma independiente
// ============================================================
const runMigration = (sql: string, label: string) =>
  pool.query(sql)
    .then(() => console.log(`✅ Migración OK: ${label}`))
    .catch((e) => console.warn(`⚠️ Migración omitida (${label}): ${e.message}`));

const migrations = [
  // -- BASICS columns
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS riot_tournament_id INT`, 'riot_tournament_id'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS game VARCHAR(100)`, 'game'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS slug VARCHAR(200)`, 'slug'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS header_banner_url TEXT`, 'header_banner_url'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS start_time VARCHAR(20)`, 'start_time'),
  // -- INFO columns
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS contact_method VARCHAR(100)`, 'contact_method'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS contact_details TEXT`, 'contact_details'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS critical_rules TEXT`, 'critical_rules'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS rules TEXT`, 'rules'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS prizes TEXT`, 'prizes'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS schedule TEXT`, 'schedule'),
  // -- SETTINGS columns
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS game_region VARCHAR(100) DEFAULT 'Latin America South'`, 'game_region'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS game_map VARCHAR(100) DEFAULT 'Summoners Rift'`, 'game_map'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS game_format VARCHAR(100) DEFAULT 'Tournament Draft'`, 'game_format'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS tournament_format VARCHAR(100) DEFAULT 'Pre-Made Teams'`, 'tournament_format'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS min_players_per_team INT DEFAULT 5`, 'min_players_per_team'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS check_in_enabled BOOLEAN DEFAULT FALSE`, 'check_in_enabled'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS check_in_start_time INT DEFAULT 60`, 'check_in_start_time'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS match_score_reporting VARCHAR(50) DEFAULT 'Admins & Players'`, 'match_score_reporting'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS require_screenshots BOOLEAN DEFAULT FALSE`, 'require_screenshots'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS max_team_size INT`, 'max_team_size'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS registration_limit INT`, 'registration_limit'),
  // -- BRACKETS & PUBLISH columns
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS bracket_type VARCHAR(50) DEFAULT 'elimination'`, 'bracket_type'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE`, 'is_published'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS visibility VARCHAR(20) DEFAULT 'public'`, 'visibility'),
  () => runMigration(`ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS join_code VARCHAR(20)`, 'join_code'),
  // -- Unique index on slug
  () => runMigration(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tournaments_slug ON tournaments(slug) WHERE slug IS NOT NULL`, 'slug_unique_index'),
  // -- tournament_matches table
  () => runMigration(`
    CREATE TABLE IF NOT EXISTS tournament_matches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      team1_name VARCHAR(100),
      team2_name VARCHAR(100),
      tournament_code VARCHAR(255),
      status VARCHAR(20) DEFAULT 'PENDIENTE',
      round_num INT DEFAULT 1,
      match_num INT DEFAULT 1,
      next_match_id UUID REFERENCES tournament_matches(id) ON DELETE SET NULL,
      winner_team_name VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `, 'tournament_matches table'),
  () => runMigration(`CREATE INDEX IF NOT EXISTS idx_matches_tournament ON tournament_matches(tournament_id)`, 'idx_matches_tournament'),
  () => runMigration(`CREATE INDEX IF NOT EXISTS idx_matches_round ON tournament_matches(tournament_id, round_num)`, 'idx_matches_round'),
  // -- tournament_matches table improvements
  () => runMigration(`ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS round_num INT DEFAULT 1`, 'round_num'),
  () => runMigration(`ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS match_num INT DEFAULT 1`, 'match_num'),
  () => runMigration(`ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS team1_id UUID REFERENCES teams(id) ON DELETE CASCADE`, 'team1_id'),
  () => runMigration(`ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS team2_id UUID REFERENCES teams(id) ON DELETE CASCADE`, 'team2_id'),
  () => runMigration(`ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS team1_checkin BOOLEAN DEFAULT FALSE`, 'team1_checkin'),
  () => runMigration(`ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS team2_checkin BOOLEAN DEFAULT FALSE`, 'team2_checkin'),
  () => runMigration(`ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS checkin_deadline TIMESTAMP WITH TIME ZONE`, 'checkin_deadline'),
  () => runMigration(`ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS winner_team_id UUID REFERENCES teams(id) ON DELETE SET NULL`, 'winner_team_id'),
  () => runMigration(`ALTER TABLE tournament_matches ALTER COLUMN tournament_code DROP NOT NULL`, 'drop_tournament_code_notnull'),
  // -- Unique registration
  () => runMigration(`ALTER TABLE tournament_registrations ADD CONSTRAINT uq_tournament_team UNIQUE (tournament_id, team_id)`, 'uq_tournament_team').catch(() => console.log('uq_tournament_team ya existe o ignorado')),
  // -- Match Chats
  () => runMigration(`
    CREATE TABLE IF NOT EXISTS match_chats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      match_id UUID NOT NULL REFERENCES tournament_matches(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `, 'match_chats table'),
];

(async () => {
  for (const migration of migrations) {
    await migration();
  }
  console.log('✅ Todas las migraciones completadas.');
})();


const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// Middlewares globales
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// Rutas
// ============================================================
app.use('/api/auth',        authRouter);
app.use('/api/communities', communitiesRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/posts',       postsRouter);
app.use('/api/players',     playersRouter);
app.use('/api/teams',       teamsRouter);
app.use('/api/users',       usersRouter);
app.use('/api/reports',     reportsRouter);

// Endpoint de salud — verifica también la conexión a la DB
app.get('/api/health', async (req: Request, res: Response) => {
  let dbStatus = 'DOWN';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'UP';
  } catch {
    dbStatus = 'DOWN';
  }

  res.json({
    status: dbStatus === 'UP' ? 'UP' : 'DEGRADED',
    timestamp: new Date(),
    service: 'ZabEsports REST API v2',
    database: dbStatus,
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'GET  /api/communities',
      'POST /api/communities',
      'PATCH /api/communities/:id/approve',
      'GET  /api/tournaments',
      'POST /api/tournaments',
      'PATCH /api/tournaments/:id/approve',
      'POST /api/tournaments/:id/register',
      'GET  /api/posts',
      'POST /api/posts',
      'POST /api/posts/:id/like',
      'GET  /api/players',
    ]
  });
});

// ============================================================
// Iniciar servidor
// ============================================================
const server = app.listen(PORT, () => {
  console.log(`⚡️ ZabEsports API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

export { app, server };
export default app;
