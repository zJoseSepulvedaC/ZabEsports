import { Router, Request, Response } from 'express';
import { query } from '../db/pool';

const router = Router();

// GET /api/players — Lista de jugadores para reclutamiento
// Query params: ?position=TOP&rank=Diamond
router.get('/', async (req: Request, res: Response): Promise<void> => {
  // Por ahora los jugadores son los usuarios con sus atributos de perfil
  // En producción habría una tabla 'player_profiles' con stats de juego
  try {
    let sql = `
      SELECT
        u.id,
        u.username,
        u.role AS platform_role,
        u.created_at
      FROM users u
      ORDER BY u.created_at DESC
    `;

    const result = await query(sql);

    // Enriquecer con stats simuladas por jugador (hasta tener tabla player_profiles)
    const statsMap: Record<string, object> = {
      'knghtfyre': { position: 'TOP',    rank: 'Diamond I',   winrate: '82.5%', kda: '3.7/1.2', availability: 'Tardes/Noches' },
      'ZabPlayer': { position: 'JUNGLE', rank: 'Master',      winrate: '99.7%', kda: '4.3/3.1', availability: 'Fines de semana' },
      'JoseSepulveda': { position: 'MID', rank: 'Challenger', winrate: '85.3%', kda: '5.3/1.4', availability: 'Lunes a Viernes' },
      'GamerGirl99': { position: 'ADC',  rank: 'Diamond II',  winrate: '50.5%', kda: '4.3/2.0', availability: 'Noche' }
    };

    const players = result.rows.map(u => ({
      ...u,
      ...(statsMap[u.username] || { position: 'SUPPORT', rank: 'Gold', winrate: '50%', kda: '2.0/2.0', availability: 'Variable' })
    }));

    // Filtrar por position si se pasa query param
    const { position, rank } = req.query;
    const filtered = players.filter(p => {
      const matchPos  = !position || position === 'ALL' || p.position === position;
      const matchRank = !rank     || rank === 'ALL'     || String(p.rank).includes(String(rank));
      return matchPos && matchRank;
    });

    res.json(filtered);
  } catch (err) {
    console.error('Error al obtener jugadores:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;
