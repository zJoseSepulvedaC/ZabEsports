import { Router, Response } from 'express';
import { query } from '../db/pool';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/communities — Lista pública de comunidades aprobadas
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT
        c.id,
        c.name,
        c.description,
        c.game,
        c.is_approved,
        c.created_at,
        u.username AS owner_username,
        COUNT(cm.user_id)::int AS member_count
      FROM communities c
      JOIN users u ON u.id = c.owner_id
      LEFT JOIN community_members cm ON cm.community_id = c.id
      GROUP BY c.id, u.username
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener comunidades:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// GET /api/communities/:id — Detalle de una comunidad
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT
        c.id, c.name, c.description, c.game, c.is_approved, c.created_at,
        u.username AS owner_username,
        COUNT(cm.user_id)::int AS member_count
      FROM communities c
      JOIN users u ON u.id = c.owner_id
      LEFT JOIN community_members cm ON cm.community_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, u.username
    `, [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Comunidad no encontrada.' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener comunidad:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/communities — Crear una comunidad (requiere auth)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, game } = req.body;

  if (!name) {
    res.status(400).json({ error: 'El nombre de la comunidad es requerido.' });
    return;
  }

  try {
    const result = await query(`
      INSERT INTO communities (name, description, game, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, game, is_approved, created_at
    `, [name, description, game, req.user!.id]);

    res.status(201).json({
      message: 'Comunidad creada. Pendiente de aprobación.',
      community: result.rows[0]
    });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === '23505') {
      res.status(409).json({ error: 'Ya existe una comunidad con ese nombre.' });
    } else {
      console.error('Error al crear comunidad:', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
});

// PATCH /api/communities/:id/approve — Aprobar comunidad (solo moderador/admin)
router.patch(
  '/:id/approve',
  authMiddleware,
  requireRole('moderador', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await query(
        `UPDATE communities SET is_approved = TRUE, updated_at = NOW()
         WHERE id = $1 RETURNING id, name, is_approved`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Comunidad no encontrada.' });
        return;
      }

      res.json({ message: 'Comunidad aprobada.', community: result.rows[0] });
    } catch (err) {
      console.error('Error al aprobar comunidad:', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
);

// PATCH /api/communities/:id/reject — Rechazar/deshabilitar comunidad
router.patch(
  '/:id/reject',
  authMiddleware,
  requireRole('moderador', 'admin'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await query(
        `UPDATE communities SET is_approved = FALSE, updated_at = NOW()
         WHERE id = $1 RETURNING id, name, is_approved`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Comunidad no encontrada.' });
        return;
      }

      res.json({ message: 'Comunidad rechazada.', community: result.rows[0] });
    } catch (err) {
      console.error('Error al rechazar comunidad:', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
);

export default router;
