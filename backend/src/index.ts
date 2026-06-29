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

dotenv.config();

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
