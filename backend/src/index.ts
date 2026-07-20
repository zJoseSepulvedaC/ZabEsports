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

dotenv.config();

// Las migraciones de base de datos se ejecutan en el despliegue inicial y se remueven de aquí para evitar bloqueos por concurrencia en Azure.
pool.query(`
    ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS riot_tournament_id INT;
    CREATE TABLE IF NOT EXISTS tournament_matches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
        team1_name VARCHAR(100) NOT NULL,
        team2_name VARCHAR(100) NOT NULL,
        tournament_code VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDIENTE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_matches_tournament ON tournament_matches(tournament_id);
`).then(() => console.log('Migración automática de Riot completada en Azure.'))
  .catch((e) => console.error('Error en migración automática:', e));

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
