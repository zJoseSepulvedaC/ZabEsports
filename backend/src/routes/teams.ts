import { Router, Request, Response } from 'express';
import { query } from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/teams — Crear una nueva escuadra (Equipo)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: 'El nombre del equipo es requerido.' });
    return;
  }

  try {
    // Iniciar transacción
    await query('BEGIN');

    // Insertar el equipo
    const teamResult = await query(`
      INSERT INTO teams (name, captain_id)
      VALUES ($1, $2)
      RETURNING id, name, captain_id, created_at
    `, [name, req.user!.id]);
    
    const newTeam = teamResult.rows[0];

    // Insertar al capitán como miembro del equipo
    await query(`
      INSERT INTO team_members (team_id, user_id)
      VALUES ($1, $2)
    `, [newTeam.id, req.user!.id]);

    await query('COMMIT');

    res.status(201).json({
      message: 'Escuadra creada exitosamente.',
      team: newTeam
    });
  } catch (err: any) {
    await query('ROLLBACK');
    console.error('Error al crear equipo:', err);
    if (err.code === '23505') { // Código PostgreSQL para violación de UNIQUE
      res.status(409).json({ error: 'Ya existe un equipo con ese nombre.' });
    } else {
      res.status(500).json({ error: 'Error interno al crear el equipo.' });
    }
  }
});

// GET /api/teams/mine — Obtener todos los equipos a los que pertenezco (o soy capitán)
router.get('/mine', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT t.id, t.name, t.captain_id, t.created_at,
             (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as member_count,
             (
                SELECT json_agg(u.username)
                FROM team_members tm2
                JOIN users u ON u.id = tm2.user_id
                WHERE tm2.team_id = t.id
             ) as members
      FROM teams t
      JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = $1
      ORDER BY t.created_at DESC
    `, [req.user!.id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener mis equipos:', err);
    res.status(500).json({ error: 'Error interno al obtener los equipos.' });
  }
});

// GET /api/teams/:id — Obtener detalle de un equipo y sus miembros
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const teamResult = await query('SELECT * FROM teams WHERE id = $1', [id]);
    
    if (teamResult.rows.length === 0) {
      res.status(404).json({ error: 'Equipo no encontrado.' });
      return;
    }

    const team = teamResult.rows[0];

    const membersResult = await query(`
      SELECT u.id, u.username, u.riot_game_name, u.lol_rank, tm.joined_at
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = $1
      ORDER BY tm.joined_at ASC
    `, [id]);

    res.json({
      ...team,
      members: membersResult.rows
    });
  } catch (err) {
    console.error('Error al obtener detalles del equipo:', err);
    res.status(500).json({ error: 'Error interno al obtener detalles.' });
  }
});

// DELETE /api/teams/:id — Eliminar equipo (solo el capitán)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await query('SELECT captain_id FROM teams WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Equipo no encontrado.' });
      return;
    }
    if (check.rows[0].captain_id !== req.user!.id) {
      res.status(403).json({ error: 'Solo el capitán puede eliminar la escuadra.' });
      return;
    }
    await query('DELETE FROM teams WHERE id = $1', [id]);
    res.json({ message: 'Escuadra eliminada con éxito.' });
  } catch (err) {
    console.error('Error al eliminar equipo:', err);
    res.status(500).json({ error: 'Error interno al eliminar el equipo.' });
  }
});

export default router;
