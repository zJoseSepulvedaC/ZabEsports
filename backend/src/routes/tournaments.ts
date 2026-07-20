import { Router, Response, Request } from 'express';
import { query } from '../db/pool';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/authMiddleware';
import { registerTournament, generateTournamentCodes } from '../services/riotTournamentService';

const router = Router();

// ============================================================
// Helpers
// ============================================================

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .substring(0, 60);
}

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}


// ============================================================
// GET /api/tournaments — Lista de torneos
// ============================================================
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.query.page || req.query.limit) {
      const page  = parseInt(req.query.page  as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const totalResult = await query('SELECT COUNT(*)::int AS count FROM tournaments');
      const total       = totalResult.rows[0].count;

      const result = await query(`
        SELECT
          t.id, t.name, t.description, t.game, t.slug, t.start_date, t.start_time,
          t.header_banner_url, t.max_teams, t.status, t.is_approved, t.prize_pool,
          t.game_region, t.game_map, t.game_format, t.tournament_format,
          t.bracket_type, t.is_published, t.visibility, t.join_code,
          t.rules, t.prizes, t.schedule, t.contact_method, t.contact_details,
          t.riot_tournament_id, t.created_at,
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

      res.json({ data: result.rows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } });
    } else {
      const allResult = await query(`
        SELECT
          t.id, t.name, t.description, t.game, t.slug, t.start_date, t.start_time,
          t.header_banner_url, t.max_teams, t.status, t.is_approved, t.prize_pool,
          t.game_region, t.game_map, t.game_format, t.tournament_format,
          t.bracket_type, t.is_published, t.visibility, t.join_code,
          t.rules, t.prizes, t.schedule, t.contact_method, t.contact_details,
          t.riot_tournament_id, t.created_at,
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

// ============================================================
// GET /api/tournaments/slug/:slug — Buscar por slug
// ============================================================
router.get('/slug/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT
        t.*, u.username AS organizer_username, c.name AS community_name,
        COUNT(tr.id)::int AS registered_teams
      FROM tournaments t
      JOIN users u ON u.id = t.organizer_id
      LEFT JOIN communities c ON c.id = t.community_id
      LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
      WHERE t.slug = $1
      GROUP BY t.id, u.username, c.name
    `, [req.params.slug]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Torneo no encontrado.' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener torneo por slug:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ============================================================
// GET /api/tournaments/:id — Detalle de un torneo
// ============================================================
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT
        t.*, u.username AS organizer_username, c.name AS community_name,
        COUNT(tr.id)::int AS registered_teams
      FROM tournaments t
      JOIN users u ON u.id = t.organizer_id
      LEFT JOIN communities c ON c.id = t.community_id
      LEFT JOIN tournament_registrations tr ON tr.tournament_id = t.id
      WHERE t.id = $1
      GROUP BY t.id, u.username, c.name
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

// ============================================================
// POST /api/tournaments — Crear torneo (Wizard completo)
// ============================================================
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    name, description, game, start_date, start_time, max_teams, community_id,
    prize_pool, header_banner_url,
    // Info
    contact_method, contact_details, critical_rules, rules, prizes, schedule,
    // Settings
    game_region, game_map, game_format, tournament_format,
    min_players_per_team, check_in_enabled, check_in_start_time,
    match_score_reporting, require_screenshots, max_team_size, registration_limit,
    // Brackets & Publish
    bracket_type, is_published, visibility
  } = req.body;

  if (!name || !start_date) {
    res.status(400).json({ error: 'Nombre y fecha de inicio son requeridos.' });
    return;
  }

  try {
    // Generate unique slug
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await query('SELECT id FROM tournaments WHERE slug = $1', [slug]);
      if (existing.rows.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    // Generate join code for private tournaments
    const joinCode = visibility === 'private' ? generateJoinCode() : null;

    const result = await query(`
      INSERT INTO tournaments (
        name, description, game, slug, start_date, start_time, max_teams, community_id,
        organizer_id, prize_pool, header_banner_url,
        contact_method, contact_details, critical_rules, rules, prizes, schedule,
        game_region, game_map, game_format, tournament_format,
        min_players_per_team, check_in_enabled, check_in_start_time,
        match_score_reporting, require_screenshots, max_team_size, registration_limit,
        bracket_type, is_published, visibility, join_code
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,$17,
        $18,$19,$20,$21,
        $22,$23,$24,$25,$26,$27,$28,
        $29,$30,$31,$32
      )
      RETURNING *
    `, [
      name, description || null, game || 'League of Legends', slug,
      start_date, start_time || null, max_teams || 16, community_id || null,
      req.user!.id, prize_pool || null, header_banner_url || null,
      contact_method || null, contact_details || null, critical_rules || null,
      rules || null, prizes || null, schedule || null,
      game_region || 'Latin America South', game_map || 'Summoners Rift',
      game_format || 'Tournament Draft', tournament_format || 'Pre-Made Teams',
      min_players_per_team || 5, check_in_enabled || false,
      check_in_start_time || 60, match_score_reporting || 'Admins & Players',
      require_screenshots || false, max_team_size || null, registration_limit || null,
      bracket_type || 'elimination', is_published || false,
      visibility || 'public', joinCode
    ]);

    const tourney = result.rows[0];
    const inviteLink = `https://zabesports.com/tournaments/${tourney.slug}`;

    res.status(201).json({
      message: is_published ? 'Torneo publicado exitosamente.' : 'Torneo creado en modo borrador.',
      tournament: tourney,
      invite_link: inviteLink,
      join_code: joinCode
    });
  } catch (err) {
    console.error('Error al crear torneo:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ============================================================
// PATCH /api/tournaments/:id/approve — Aprobar torneo (admin)
// ============================================================
router.patch('/:id/approve', authMiddleware, requireRole('moderador', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await query(
        `UPDATE tournaments SET is_approved = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id, name, is_approved`,
        [req.params.id]
      );
      if (result.rows.length === 0) { res.status(404).json({ error: 'Torneo no encontrado.' }); return; }
      res.json({ message: 'Torneo aprobado.', tournament: result.rows[0] });
    } catch (err) {
      console.error('Error al aprobar torneo:', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
);

// ============================================================
// PATCH /api/tournaments/:id/publish — Publicar/despublicar
// ============================================================
router.patch('/:id/publish', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { is_published, visibility } = req.body;
  try {
    const check = await query('SELECT organizer_id FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) { res.status(404).json({ error: 'Torneo no encontrado.' }); return; }
    if (check.rows[0].organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos.' }); return;
    }
    const result = await query(
      `UPDATE tournaments SET is_published = $1, visibility = COALESCE($2, visibility), updated_at = NOW() WHERE id = $3 RETURNING id, name, is_published, visibility`,
      [is_published, visibility, id]
    );
    res.json({ message: is_published ? 'Torneo publicado.' : 'Torneo en borrador.', tournament: result.rows[0] });
  } catch (err) {
    console.error('Error al publicar torneo:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ============================================================
// POST /api/tournaments/:id/register — Inscribirse
// ============================================================
router.post('/:id/register', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { team_id } = req.body;
  if (!team_id) { res.status(400).json({ error: 'Debes seleccionar una Escuadra.' }); return; }

  try {
    const tournament = await query(
      'SELECT id, max_teams, is_approved, status, min_players_per_team FROM tournaments WHERE id = $1',
      [req.params.id]
    );
    if (tournament.rows.length === 0) { res.status(404).json({ error: 'Torneo no encontrado.' }); return; }

    const t = tournament.rows[0];
    if (!t.is_approved) { res.status(400).json({ error: 'Este torneo aún no ha sido aprobado.' }); return; }
    if (t.status !== 'OPEN') { res.status(400).json({ error: 'Las inscripciones están cerradas.' }); return; }

    // Validate tournament capacity
    const registrations = await query(
      'SELECT COUNT(*)::int AS count FROM tournament_registrations WHERE tournament_id = $1',
      [req.params.id]
    );
    if (registrations.rows[0].count >= t.max_teams) {
      res.status(400).json({ error: 'El torneo ya está lleno.' }); return;
    }

    // Validate team member count
    const requiredPlayers = t.min_players_per_team || 5;
    const memberCount = await query(
      'SELECT COUNT(*)::int AS count FROM team_members WHERE team_id = $1',
      [team_id]
    );
    const actualCount = memberCount.rows[0]?.count || 0;
    if (actualCount < requiredPlayers) {
      res.status(400).json({
        error: `Tu Escuadra necesita al menos ${requiredPlayers} jugadores para inscribirse. Actualmente tiene ${actualCount}.`
      });
      return;
    }

    const result = await query(
      `INSERT INTO tournament_registrations (tournament_id, registered_by, team_id) VALUES ($1, $2, $3) RETURNING id, team_id, registered_at`,
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


// ============================================================
// PUT /api/tournaments/:id — Actualizar torneo
// ============================================================
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, max_teams, prize_pool, start_date, status,
          rules, prizes, schedule, contact_method, contact_details,
          game_region, game_map, game_format, tournament_format, bracket_type } = req.body;
  try {
    const check = await query('SELECT organizer_id FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) { res.status(404).json({ error: 'Torneo no encontrado.' }); return; }
    if (check.rows[0].organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos.' }); return;
    }

    const result = await query(
      `UPDATE tournaments SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        max_teams = COALESCE($3, max_teams),
        prize_pool = COALESCE($4, prize_pool),
        start_date = COALESCE($5, start_date),
        status = COALESCE($6, status),
        rules = COALESCE($7, rules),
        prizes = COALESCE($8, prizes),
        schedule = COALESCE($9, schedule),
        contact_method = COALESCE($10, contact_method),
        contact_details = COALESCE($11, contact_details),
        game_region = COALESCE($12, game_region),
        game_map = COALESCE($13, game_map),
        game_format = COALESCE($14, game_format),
        tournament_format = COALESCE($15, tournament_format),
        bracket_type = COALESCE($16, bracket_type),
        updated_at = NOW()
       WHERE id = $17 RETURNING *`,
      [name, description, max_teams ? parseInt(max_teams) : null, prize_pool,
       start_date ? new Date(start_date) : null, status,
       rules, prizes, schedule, contact_method, contact_details,
       game_region, game_map, game_format, tournament_format, bracket_type, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar torneo:', err);
    res.status(500).json({ error: 'Error al actualizar torneo.' });
  }
});

// ============================================================
// DELETE /api/tournaments/:id — Eliminar torneo
// ============================================================
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await query('SELECT organizer_id FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) { res.status(404).json({ error: 'Torneo no encontrado.' }); return; }
    if (check.rows[0].organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos.' }); return;
    }
    await query('DELETE FROM tournaments WHERE id = $1', [id]);
    res.json({ message: 'Torneo eliminado con éxito.' });
  } catch (err) {
    console.error('Error al eliminar torneo:', err);
    res.status(500).json({ error: 'Error al eliminar torneo.' });
  }
});

// ============================================================
// DELETE /api/tournaments/:id/register — Anular inscripción
// ============================================================
router.delete('/:id/register', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await query('SELECT id FROM tournament_registrations WHERE tournament_id = $1 AND registered_by = $2', [id, req.user!.id]);
    if (check.rows.length === 0) { res.status(404).json({ error: 'No estás inscrito en este torneo.' }); return; }
    await query('DELETE FROM tournament_registrations WHERE tournament_id = $1 AND registered_by = $2', [id, req.user!.id]);
    res.json({ message: 'Inscripción anulada con éxito.' });
  } catch (err) {
    console.error('Error al anular inscripción:', err);
    res.status(500).json({ error: 'Error al anular inscripción.' });
  }
});

// ============================================================
// GET /api/tournaments/:id/teams — Equipos inscritos
// ============================================================
router.get('/:id/teams', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT
        tr.id AS registration_id, t.id AS team_id, t.name AS team_name,
        u.username AS captain_username, u.lol_rank AS captain_rank,
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
        FROM team_members tm JOIN users u ON u.id = tm.user_id WHERE tm.team_id = $1
      `, [row.team_id]);
      teams.push({ ...row, members: members.rows });
    }
    res.json(teams);
  } catch (err) {
    console.error('Error al obtener equipos inscritos:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ============================================================
// GET /api/tournaments/:id/matches — Partidas / Brackets
// ============================================================
router.get('/:id/matches', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT *
      FROM tournament_matches
      WHERE tournament_id = $1
      ORDER BY round_num ASC, match_num ASC
    `, [req.params.id]);
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error al obtener partidas:', err);
    res.status(500).json({ error: 'Error interno del servidor.', details: err.message });
  }
});

// ============================================================
// POST /api/tournaments/:id/generate-brackets — Generar Llaves
// ============================================================
router.post('/:id/generate-brackets', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const tResult = await query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (tResult.rows.length === 0) { res.status(404).json({ error: 'Torneo no encontrado.' }); return; }
    const tourney = tResult.rows[0];

    if (tourney.organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos.' }); return;
    }

    const { generateBracketsForTournament } = await import('../services/bracketService');
    const insertedMatches = await generateBracketsForTournament(id);

    res.status(201).json({
      message: `Brackets generados: ${insertedMatches.length} partidas.`,
      matches: insertedMatches
    });
  } catch (err: any) {
    console.error('Error al generar brackets:', err);
    res.status(err.message.includes('menos 2 equipos') ? 400 : 500).json({ error: err.message || 'Error interno del servidor al generar brackets.' });
  }
});

// ============================================================
// POST /api/tournaments/:id/declare-winner — Declarar ganador
// ============================================================
router.post('/:id/declare-winner', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { match_id, winner_team_name } = req.body;
  try {
    const tResult = await query('SELECT organizer_id FROM tournaments WHERE id = $1', [req.params.id]);
    if (tResult.rows.length === 0) { res.status(404).json({ error: 'Torneo no encontrado.' }); return; }

    if (tResult.rows[0].organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos.' }); return;
    }

    // Actualizar el match con el ganador
    const matchResult = await query(`
      UPDATE tournament_matches
      SET winner_team_name = $1, status = 'COMPLETADO'
      WHERE id = $2 AND tournament_id = $3
      RETURNING *, next_match_id
    `, [winner_team_name, match_id, req.params.id]);

    if (matchResult.rows.length === 0) { res.status(404).json({ error: 'Partida no encontrada.' }); return; }
    const match = matchResult.rows[0];

    // Si hay una partida siguiente, avanzar al ganador
    if (match.next_match_id) {
      const nextMatch = await query('SELECT * FROM tournament_matches WHERE id = $1', [match.next_match_id]);
      if (nextMatch.rows.length > 0) {
        const nm = nextMatch.rows[0];
        const slot = !nm.team1_name ? 'team1_name' : 'team2_name';
        await query(`UPDATE tournament_matches SET ${slot} = $1 WHERE id = $2`, [winner_team_name, match.next_match_id]);
      }
    }

    res.json({ message: 'Ganador declarado.', match: matchResult.rows[0] });
  } catch (err) {
    console.error('Error al declarar ganador:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ============================================================
// POST /api/tournaments/:id/register-riot — Vincular con Riot
// ============================================================
router.post('/:id/register-riot', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await query('SELECT name, organizer_id, riot_tournament_id FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) { res.status(404).json({ error: 'Torneo no encontrado.' }); return; }
    const t = check.rows[0];

    if (t.organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos.' }); return;
    }
    if (t.riot_tournament_id) {
      res.status(400).json({ error: 'Este torneo ya está vinculado a Riot.' }); return;
    }

    const DUMMY_PROVIDER_ID = 1;
    const riotTourneyId = await registerTournament(DUMMY_PROVIDER_ID, t.name);
    await query('UPDATE tournaments SET riot_tournament_id = $1 WHERE id = $2', [riotTourneyId, id]);

    res.json({ message: 'Torneo vinculado con Riot Games.', riot_tournament_id: riotTourneyId });
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Error vinculando torneo:', e.message);
    res.status(500).json({ error: 'Error al vincular el torneo con Riot.' });
  }
});

// ============================================================
// POST /api/tournaments/:id/generate-match — Generar código manual
// ============================================================
router.post('/:id/generate-match', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { team1_name, team2_name } = req.body;

  try {
    const check = await query('SELECT organizer_id, riot_tournament_id FROM tournaments WHERE id = $1', [id]);
    if (check.rows.length === 0) { res.status(404).json({ error: 'Torneo no encontrado.' }); return; }
    const t = check.rows[0];

    if (t.organizer_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos.' }); return;
    }
    if (!t.riot_tournament_id) {
      res.status(400).json({ error: 'Primero debes vincular el torneo con Riot.' }); return;
    }

    const codes = await generateTournamentCodes({
      tournamentId: t.riot_tournament_id,
      teamSize: 5,
      mapType: 'SUMMONERS_RIFT',
      pickType: 'TOURNAMENT_DRAFT',
      spectatorType: 'ALL'
    });

    if (!codes || codes.length === 0) throw new Error('Riot no devolvió códigos.');

    const result = await query(`
      INSERT INTO tournament_matches (tournament_id, team1_name, team2_name, tournament_code)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [id, team1_name, team2_name, codes[0]]);

    res.status(201).json({ message: 'Partida y código generados.', match: result.rows[0] });
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Error generando match:', e.message);
    res.status(500).json({ error: 'Error al generar código en Riot.' });
  }
});

// ============================================================
// POST /api/tournaments/:t_id/matches/:m_id/checkin — Check In
// ============================================================
router.post('/:t_id/matches/:m_id/checkin', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { t_id, m_id } = req.params;
  try {
    const matchRes = await query('SELECT * FROM tournament_matches WHERE id = $1 AND tournament_id = $2', [m_id, t_id]);
    if (matchRes.rows.length === 0) { res.status(404).json({ error: 'Partida no encontrada.' }); return; }
    const match = matchRes.rows[0];

    // Check if user is in team1 or team2
    const userTeams = await query(`
      SELECT team_id FROM team_members WHERE user_id = $1 AND team_id IN ($2, $3)
    `, [req.user!.id, match.team1_id, match.team2_id]);

    if (userTeams.rows.length === 0) {
      res.status(403).json({ error: 'No perteneces a ninguno de los equipos de esta partida.' }); return;
    }

    const userTeamId = userTeams.rows[0].team_id;
    const isTeam1 = userTeamId === match.team1_id;

    if (isTeam1) {
      await query('UPDATE tournament_matches SET team1_checkin = TRUE WHERE id = $1', [m_id]);
      match.team1_checkin = true;
    } else {
      await query('UPDATE tournament_matches SET team2_checkin = TRUE WHERE id = $1', [m_id]);
      match.team2_checkin = true;
    }

    // Si ambos hicieron check-in y aún no hay código de torneo, generarlo
    let newCode = match.tournament_code;
    if (match.team1_checkin && match.team2_checkin && !match.tournament_code) {
      const tRes = await query('SELECT riot_tournament_id, min_players_per_team FROM tournaments WHERE id = $1', [t_id]);
      const tourney = tRes.rows[0];
      if (tourney && tourney.riot_tournament_id) {
        try {
          const { generateTournamentCodes } = await import('../services/riotTournamentService');
          const codes = await generateTournamentCodes({
            tournamentId: tourney.riot_tournament_id,
            teamSize: tourney.min_players_per_team || 5,
            mapType: 'SUMMONERS_RIFT',
            pickType: 'TOURNAMENT_DRAFT',
            spectatorType: 'ALL'
          }, 1);
          if (codes && codes.length > 0) {
            newCode = codes[0];
            await query('UPDATE tournament_matches SET tournament_code = $1 WHERE id = $2', [newCode, m_id]);
          }
        } catch (e) {
          console.error('Error generando código de Riot tras check-in completo:', e);
        }
      }
    }

    res.json({ message: 'Check-in exitoso.', tournament_code: newCode });
  } catch (err) {
    console.error('Error en check-in:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ============================================================
// GET /api/tournaments/:t_id/matches/:m_id/chat — Get Match Chat
// ============================================================
router.get('/:t_id/matches/:m_id/chat', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { m_id } = req.params;
  try {
    const messages = await query(`
      SELECT mc.id, mc.message, mc.created_at, u.username, u.id AS user_id
      FROM match_chats mc
      JOIN users u ON u.id = mc.user_id
      WHERE mc.match_id = $1
      ORDER BY mc.created_at ASC
    `, [m_id]);
    res.json(messages.rows);
  } catch (err) {
    console.error('Error obteniendo chat:', err);
    res.status(500).json({ error: 'Error interno.' });
  }
});

// ============================================================
// POST /api/tournaments/:t_id/matches/:m_id/chat — Post Match Chat
// ============================================================
router.post('/:t_id/matches/:m_id/chat', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { m_id } = req.params;
  const { message } = req.body;
  if (!message || message.trim() === '') { res.status(400).json({ error: 'Mensaje vacío.' }); return; }

  try {
    const inserted = await query(`
      INSERT INTO match_chats (match_id, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, message, created_at
    `, [m_id, req.user!.id, message]);
    
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    console.error('Error enviando mensaje de chat:', err);
    res.status(500).json({ error: 'Error interno.' });
  }
});

// ============================================================
// POST /api/tournaments/debug/seed-test
// ============================================================
router.post('/debug/seed-test', async (req: Request, res: Response): Promise<void> => {
  try {
    // Buscar al usuario que solicita como organizador
    const userRes = await query(`SELECT id FROM users WHERE username = 'Zabat' LIMIT 1`);
    if (userRes.rows.length === 0) { res.status(404).json({ error: 'Zabat no encontrado' }); return; }
    const organizerId = userRes.rows[0].id;

    const tRes = await query(`
      INSERT INTO tournaments (name, game, game_format, tournament_format, game_region, max_teams, start_date, organizer_id, slug)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, ['Test Riot API Brackets ' + Date.now(), 'League of Legends', 'Pre-Made Teams', 'elimination', 'Latin America South', 16, new Date(), organizerId, 'test-riot-' + Date.now()]);
    const tId = tRes.rows[0].id;

    for (let i = 1; i <= 8; i++) {
      const uRes = await query(`
        INSERT INTO users (username, email, password_hash, role)
        VALUES ($1, $2, $3, 'usuario')
        ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
        RETURNING id
      `, [`TestCapitan${i}`, `testcap${i}@test.com`, 'hash']);
      const cId = uRes.rows[0].id;

      const teamRes = await query(`
        INSERT INTO teams (name, captain_id)
        VALUES ($1, $2)
        RETURNING id
      `, [`Test Team ${i} - ${Date.now()}`, cId]);
      const teamId = teamRes.rows[0].id;

      await query(`INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [teamId, cId]);

      for (let j = 1; j <= 4; j++) {
        const pRes = await query(`
          INSERT INTO users (username, email, password_hash, role)
          VALUES ($1, $2, $3, 'usuario')
          ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
          RETURNING id
        `, [`TestPlayer${j}_T${i}`, `t${i}p${j}@test.com`, 'hash']);
        const pId = pRes.rows[0].id;
        await query(`INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [teamId, pId]);
      }

      await query(`INSERT INTO tournament_registrations (tournament_id, team_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [tId, teamId]);
    }
    res.json({ success: true, tournamentId: tId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
