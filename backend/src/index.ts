import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Endpoint de salud
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'UP',
    timestamp: new Date(),
    service: 'ZabEsports REST API'
  });
});

// Endpoint temporal para simular comunidades
app.get('/api/communities', (req: Request, res: Response) => {
  res.json([
    { id: '1', name: 'Comunidad League of Legends Chile', description: 'Grupo para organizar torneos locales', is_approved: true },
    { id: '2', name: 'Valorant VAV', description: 'Reclutamiento de equipos de Valorant', is_approved: false }
  ]);
});

// Endpoint temporal para simular torneos
app.get('/api/tournaments', (req: Request, res: Response) => {
  res.json([
    { id: '1', name: 'Torneo Apertura ZabEsports', description: 'Premio de 500 USD en skins', start_date: '2026-07-01', max_teams: 16, status: 'OPEN', is_approved: true }
  ]);
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
