import { Router, Response, Request } from 'express';
import { query } from '../db/pool';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/tournaments — Lista de torneos
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const totalResult = await query('SELECT COUNT(*)::int AS count FROM tournaments');
      const total = totalResult.rows[0].count;
      const totalPages = Math.ceil(total / limit);

      const result = await query(`
        SELECT
          t.id, t.name, t.description, t.game, t.start_date,
          t.max_teams, t.status, t.is_approved, t.prize_pool, t.created_at,
          u.username AS organizer_username,
          c.name AS community_name,
          COUNT(tr.id)::int AS registered_teams
        FROM tournaments t
        JOIN users u ON u.id = t.organizer_id
        LEFT JOIN communities c ON c.id = t.community_id
        LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
        GROUP BY t.id, u.username, c.name
        ORDER BY t.start_date ASC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);

      res.json({
        data: result.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages
        }
      });
    } else {
      const allResult = await query(`
        SELECT
          t.id, t.name, t.description, t.game, t.start_date,
          t.max_teams, t.status, t.is_approved, t.prize_pool, t.created_at,
          u.username AS organizer_username,
          c.name AS community_name,
          COUNT(tr.id)::int AS registered_teams
        FROM tournaments t
        JOIN users u ON u.id = t.organizer_id
        LEFT JOIN communities c ON c.id = t.community_id
        LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
        GROUP BY t.id, u.username, c.name
        ORDER BY t.start_date ASC
      `);
      res.json(allResult.rows);
    }
  } catch (err) {
    console.error('Error al obtener torneos:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// GET /api/tournaments/:id — Detalle de un torneo
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT
        t.id, t.name, t.description, t.game, t.start_date,
        t.max_teams, t.status, t.is_approved, t.prize_pool, t.created_at,
        u.username AS organizer_username,
        COUNT(tr.id)::int AS registered_teams
      FROM tournaments t
      JOIN users u ON u.id = t.organizer_id
      LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
      WHERE t.id = $1
      GROUP BY t.id, u.username
    `, [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Torneo no encontrado.' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener torneo:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/tournaments — Crear torneo (requiere auth)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, game, start_date, max_teams, community_id, prize_pool } = req.body;

  if (!name || !start_date) {
    res.status(400).json({ error: 'Nombre y fecha de inicio son requeridos.' });
    return;
  }

  try {
    const result = await query(`
      INSERT INTO tournaments (name, description, game, start_date, max_teams, community_id, organizer_id, prize_pool)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, name, description, game, start_date, max_teams, status, is_approved, created_at
    `, [name, description, game, start_date, max_teams || 16, community_id || null, req.user!.id, prize_pool || null]);

    res.status(201).json({
      message: 'Torneo creado. Pendiente de aprobación.',
      tournament: result.rows[0]
    });
  } catch (err) {
    console.error('Error al crear torneo:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// PATCH /api/tournaments/:id/approve — Aprobar torneo (solo admin)
router.patch(
  '/:id/approve',
  authMiddleware,
  requireRole('moderador', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await query(
        `UPDATE tournaments SET is_approved = TRUE, updated_at = NOW()
         WHERE id = $1 RETURNING id, name, is_approved`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Torneo no encontrado.' });
        return;
      }

      res.json({ message: 'Torneo aprobado.', tournament: result.rows[0] });
    } catch (err) {
      console.error('Error al aprobar torneo:', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
);

// POST /api/tournaments/:id/register — Inscribirse a un torneo
router.post('/:id/register', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { team_id } = req.body;

  if (!team_id) {
    res.status(400).json({ error: 'Debes seleccionar una Escuadra para inscribirte.' });
    return;
  }

  try {
    // Verificar que el torneo exista y esté aprobado
    const tournament = await query(
      'SELECT id, max_teams, is_approved, status FROM tournaments WHERE id = $1',
      [req.params.id]
    );

    if (tournament.rows.length === 0) {
      res.status(404).json({ error: 'Torneo no encontrado.' });
      return;
    }

    const t = tournament.rows[0];
    if (!t.is_approved) {
      res.status(400).json({ error: 'Este torneo aún no ha sido aprobado.' });
      return;
    }
    if (t.status !== 'OPEN') {
      res.status(400).json({ error: 'Las inscripciones para este torneo están cerradas.' });
      return;
    }

    // Verificar cupos disponibles
    const registrations = await query(
      'SELECT COUNT(*)::int AS count FROM tournament_registrations WHERE tournament_id = $1',
      [req.params.id]
    );

    if (registrations.rows[0].count >= t.max_teams) {
      res.status(400).json({ error: 'El torneo ya está lleno.' });
      return;
    }

    const result = await query(
      `INSERT INTO tournament_registrations (tournament_id, registered_by, team_id)
       VALUES ($1, $2, $3) RETURNING id, team_id, registered_at`,
      [req.params.id, req.user!.id, team_id]
    );

    res.status(201).json({ message: 'Inscripción exitosa.', registration: result.rows[0] });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === '23505') {
      res.status(409).json({ error: 'Ya estás inscrito en este torneo.' });
    } else {
      console.error('Error en inscripción:', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
});

// PUT /api/tournaments/:id — Actualizar torneo (solo organizador o admin)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, max_teams, prize_pool, start_date, status } = req.body;
  try {
    const check = await query('SELECT organizer_id FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Torneo no encontrado.' });
      return;
    }
    if (check.rows[0].organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos para editar este torneo.' });
      return;
    }

    const result = await query(
      `UPDATE tournaments SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        max_teams = COALESCE($3, max_teams),
        prize_pool = COALESCE($4, prize_pool),
        start_date = COALESCE($5, start_date),
        status = COALESCE($6, status),
        updated_at = NOW()
       WHERE id = $7 RETURNING id, name, description, status`,
      [name, description, max_teams ? parseInt(max_teams) : null, prize_pool, start_date ? new Date(start_date) : null, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar torneo:', err);
    res.status(500).json({ error: 'Error al actualizar torneo.' });
  }
});

// DELETE /api/tournaments/:id — Eliminar torneo (solo organizador o admin)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await query('SELECT organizer_id FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Torneo no encontrado.' });
      return;
    }
    if (check.rows[0].organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos para eliminar este torneo.' });
      return;
    }

    await query('DELETE FROM tournaments WHERE id = $1', [id]);
    res.json({ message: 'Torneo eliminado con éxito.' });
  } catch (err) {
    console.error('Error al eliminar torneo:', err);
    res.status(500).json({ error: 'Error al eliminar torneo.' });
  }
});

// DELETE /api/tournaments/:id/register — Anular inscripción / salir de un torneo
router.delete('/:id/register', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await query('SELECT id FROM tournament_registrations WHERE tournament_id = $1 AND registered_by = $2', [id, req.user!.id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'No estás inscrito en este torneo.' });
      return;
    }
    await query('DELETE FROM tournament_registrations WHERE tournament_id = $1 AND registered_by = $2', [id, req.user!.id]);
    res.json({ message: 'Inscripción anulada con éxito.' });
  } catch (err) {
    console.error('Error al anular inscripción:', err);
    res.status(500).json({ error: 'Error al anular inscripción.' });
  }
});

// GET /api/tournaments/:id/teams — Obtener escuadras inscritas e integrantes (estilo Battlefy)
router.get('/:id/teams', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT 
        tr.id AS registration_id,
        t.id AS team_id,
        t.name AS team_name,
        u.username AS captain_username,
        u.lol_rank AS captain_rank,
        u.lol_summoner_level AS captain_level
      FROM tournament_registrations tr
      JOIN teams t ON t.id = tr.team_id
      LEFT JOIN users u ON u.id = t.captain_id
      WHERE tr.tournament_id = $1
    `, [req.params.id]);

    const teams = [];
    for (const row of result.rows) {
      const members = await query(`
        SELECT u.id, u.username, u.lol_rank, u.lol_summoner_level, u.riot_game_name, u.riot_tag_line
        FROM team_members tm
        JOIN users u ON u.id = tm.user_id
        WHERE tm.team_id = $1
      `, [row.team_id]);

      teams.push({
        ...row,
        members: members.rows
      });
    }

    res.json(teams);
  } catch (err) {
    console.error('Error al obtener escuadras inscritas:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

import { registerTournament, generateTournamentCodes } from '../services/riotTournamentService';

// GET /api/tournaments/:id/matches — Obtener partidas con código de torneo
router.get('/:id/matches', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT id, team1_name, team2_name, tournament_code, status, created_at
      FROM tournament_matches
      WHERE tournament_id = $1
      ORDER BY created_at DESC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener partidas:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/tournaments/:id/register-riot — Vincular torneo con Riot
router.post('/:id/register-riot', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await query('SELECT name, organizer_id, riot_tournament_id FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Torneo no encontrado.' });
      return;
    }
    const t = check.rows[0];
    
    if (t.organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos.' });
      return;
    }

    if (t.riot_tournament_id) {
      res.status(400).json({ error: 'Este torneo ya está vinculado a Riot.' });
      return;
    }

    // Para efectos de desarrollo, asumimos un providerId fijo (por ej. 1) si no lo tenemos en DB.
    // En producción deberíamos llamar a registerProvider() una vez y guardarlo en una tabla config.
    const DUMMY_PROVIDER_ID = 1; 
    
    // Llamada a la API de Riot
    const riotTourneyId = await registerTournament(DUMMY_PROVIDER_ID, t.name);

    // Guardamos en la base de datos local
    await query('UPDATE tournaments SET riot_tournament_id = $1 WHERE id = $2', [riotTourneyId, id]);

    res.json({ message: 'Torneo vinculado exitosamente con Riot', riot_tournament_id: riotTourneyId });
  } catch (err: any) {
    console.error('Error vinculando torneo:', err.message);
    res.status(500).json({ error: 'Error al vincular el torneo con Riot.' });
  }
});

// POST /api/tournaments/:id/generate-match — Generar partida y código
router.post('/:id/generate-match', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { team1_name, team2_name } = req.body;

  try {
    const check = await query('SELECT organizer_id, riot_tournament_id FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Torneo no encontrado.' });
      return;
    }
    const t = check.rows[0];
    
    if (t.organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos.' });
      return;
    }

    if (!t.riot_tournament_id) {
      res.status(400).json({ error: 'Primero debes vincular el torneo con Riot.' });
      return;
    }

    // Llamada a la API de Riot para pedir 1 código
    const codes = await generateTournamentCodes({
      tournamentId: t.riot_tournament_id,
      teamSize: 5,
      mapType: 'SUMMONERS_RIFT',
      pickType: 'TOURNAMENT_DRAFT',
      spectatorType: 'ALL'
    });

    if (!codes || codes.length === 0) {
      throw new Error('Riot no devolvió códigos.');
    }

    const tournamentCode = codes[0];

    // Guardar en la DB
    const result = await query(`
      INSERT INTO tournament_matches (tournament_id, team1_name, team2_name, tournament_code)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [id, team1_name, team2_name, tournamentCode]);

    res.status(201).json({ message: 'Partida y código generados', match: result.rows[0] });
  } catch (err: any) {
    console.error('Error generando match:', err.message);
    res.status(500).json({ error: 'Error al generar código en Riot.' });
  }
});

export default router;
