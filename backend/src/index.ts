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

// TEMPORAL: Endpoint para aplicar migraciones en producción
app.get('/api/migrate-now-secret', async (req: Request, res: Response) => {
  try {
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_feed ON posts(created_at DESC)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_posts_author_date ON posts(author_id, created_at DESC)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_interactions_post_type ON interactions(post_id, type)');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_interactions_upsert ON interactions(post_id, user_id, type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC)');
    res.json({ success: true, message: 'Migraciones (índices) aplicadas con éxito' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

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
