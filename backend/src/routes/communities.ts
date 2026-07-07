import { Router, Response } from 'express';
import { query } from '../db/pool';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/communities — Lista pública de comunidades aprobadas
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const totalResult = await query('SELECT COUNT(*)::int AS count FROM communities');
      const total = totalResult.rows[0].count;
      const totalPages = Math.ceil(total / limit);

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
      // Retorno completo sin paginar si no se especifican parámetros
      const allResult = await query(`
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
      res.json(allResult.rows);
    }
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

// PUT /api/communities/:id — Actualizar comunidad (solo dueño o admin)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, game } = req.body;
  try {
    const check = await query('SELECT owner_id FROM communities WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Comunidad no encontrada.' });
      return;
    }
    if (check.rows[0].owner_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos para editar esta comunidad.' });
      return;
    }

    const result = await query(
      `UPDATE communities SET name = COALESCE($1, name), description = COALESCE($2, description), game = COALESCE($3, game), updated_at = NOW()
       WHERE id = $4 RETURNING id, name, description, game, owner_id`,
      [name, description, game, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar comunidad:', err);
    res.status(500).json({ error: 'Error al actualizar comunidad.' });
  }
});

// DELETE /api/communities/:id — Eliminar comunidad (solo dueño o admin)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await query('SELECT owner_id FROM communities WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Comunidad no encontrada.' });
      return;
    }
    if (check.rows[0].owner_id !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'No tienes permisos para eliminar esta comunidad.' });
      return;
    }

    await query('DELETE FROM communities WHERE id = $1', [id]);
    res.json({ message: 'Comunidad eliminada con éxito.' });
  } catch (err) {
    console.error('Error al eliminar comunidad:', err);
    res.status(500).json({ error: 'Error al eliminar comunidad.' });
  }
});

// POST /api/communities/:id/join — Unirse a comunidad
router.post('/:id/join', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const check = await query('SELECT is_approved FROM communities WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Comunidad no encontrada.' });
      return;
    }
    await query(
      'INSERT INTO community_members (community_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [id, req.user!.id]
    );
    res.json({ message: 'Te has unido a la comunidad.' });
  } catch (err) {
    console.error('Error al unirse a comunidad:', err);
    res.status(500).json({ error: 'Error al unirse a la comunidad.' });
  }
});

// DELETE /api/communities/:id/leave — Salir de la comunidad
router.delete('/:id/leave', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await query(
      'DELETE FROM community_members WHERE community_id = $1 AND user_id = $2',
      [id, req.user!.id]
    );
    res.json({ message: 'Has salido de la comunidad.' });
  } catch (err) {
    console.error('Error al salir de la comunidad:', err);
    res.status(500).json({ error: 'Error al salir de la comunidad.' });
  }
});

export default router;
