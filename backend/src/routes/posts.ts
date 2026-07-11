import { Router, Response, Request } from 'express';
import { query } from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/posts — Feed público de posts
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.query.page || req.query.limit) {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const totalResult = await query('SELECT COUNT(*)::int AS count FROM posts');
      const total = totalResult.rows[0].count;
      const totalPages = Math.ceil(total / limit);

      const result = await query(`
        SELECT
          p.id, p.title, p.content, p.likes, p.created_at, p.community_id, p.tournament_id,
          u.username AS author_username,
          c.name AS community_name,
          t.name AS tournament_name
        FROM posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN communities c ON c.id = p.community_id
        LEFT JOIN tournaments t ON t.id = p.tournament_id
        ORDER BY p.created_at DESC
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
      // Comportamiento histórico: devolver últimos 50 directamente en array
      const defaultResult = await query(`
        SELECT
          p.id, p.title, p.content, p.likes, p.created_at, p.community_id, p.tournament_id,
          u.username AS author_username,
          c.name AS community_name,
          t.name AS tournament_name
        FROM posts p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN communities c ON c.id = p.community_id
        LEFT JOIN tournaments t ON t.id = p.tournament_id
        ORDER BY p.created_at DESC
        LIMIT 50
      `);
      res.json(defaultResult.rows);
    }
  } catch (err) {
    console.error('Error al obtener posts:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/posts — Crear post (requiere auth)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, community_id, tournament_id } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Título y contenido son requeridos.' });
    return;
  }

  try {
    const result = await query(`
      INSERT INTO posts (title, content, author_id, community_id, tournament_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, content, likes, created_at, community_id, tournament_id
    `, [title, content, req.user!.id, community_id || null, tournament_id || null]);

    res.status(201).json({ message: 'Post creado.', post: result.rows[0] });
  } catch (err) {
    console.error('Error al crear post:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/posts/:id/comment — Agregar un comentario a un post (requiere auth)
router.post('/:id/comment', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'El contenido del comentario es requerido.' });
    return;
  }
  try {
    const result = await query(`
      INSERT INTO interactions (post_id, user_id, type, content)
      VALUES ($1, $2, 'comment', $3)
      RETURNING id, content, created_at
    `, [req.params.id, req.user!.id, content]);

    res.status(201).json({ message: 'Comentario agregado.', comment: result.rows[0] });
  } catch (err) {
    console.error('Error al agregar comentario:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// GET /api/posts/:id/comments — Obtener comentarios de un post
router.get('/:id/comments', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT i.id, i.content, i.created_at, u.username AS author_username
      FROM interactions i
      JOIN users u ON u.id = i.user_id
      WHERE i.post_id = $1 AND i.type = 'comment'
      ORDER BY i.created_at ASC
    `, [req.params.id]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener comentarios:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/posts/:id/like — Dar like a un post (requiere auth)
router.post('/:id/like', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Insertar interacción (si ya existe, hace upsert)
    await query(`
      INSERT INTO interactions (post_id, user_id, type)
      VALUES ($1, $2, 'like')
      ON CONFLICT (post_id, user_id, type) DO NOTHING
    `, [req.params.id, req.user!.id]);

    // Actualizar contador de likes
    const result = await query(`
      UPDATE posts
      SET likes = (SELECT COUNT(*) FROM interactions WHERE post_id = $1 AND type = 'like'),
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, likes
    `, [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Post no encontrado.' });
      return;
    }

    res.json({ message: 'Like registrado.', post: result.rows[0] });
  } catch (err) {
    console.error('Error al dar like:', err);
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/posts/:id/report — Reportar un post
router.post('/:id/report', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { reason } = req.body;

  if (!reason) {
    res.status(400).json({ error: 'El motivo del reporte es requerido.' });
    return;
  }

  try {
    await query(`
      INSERT INTO reports (reporter_id, target_type, target_id, reason)
      VALUES ($1, 'post', $2, $3)
    `, [req.user!.id, req.params.id, reason]);

    res.status(201).json({ message: 'Reporte enviado. El equipo de moderación lo revisará.' });
  } catch (err) {
    console.error('Error al reportar post:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// PUT /api/posts/:id — Editar un post (requiere auth y ser autor)
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Título y contenido son requeridos.' });
    return;
  }
  try {
    const result = await query(
      `UPDATE posts SET title = $1, content = $2, updated_at = NOW()
       WHERE id = $3 AND author_id = $4 RETURNING id, title, content`,
      [title, content, req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) {
      res.status(403).json({ error: 'Post no encontrado o no tienes permisos para editarlo.' });
      return;
    }
    res.json({ message: 'Post actualizado con éxito.', post: result.rows[0] });
  } catch (err) {
    console.error('Error al actualizar post:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// DELETE /api/posts/:id — Eliminar un post (requiere auth y ser autor)
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING id`,
      [req.params.id, req.user!.id]
    );
    if (result.rows.length === 0) {
      res.status(403).json({ error: 'Post no encontrado o no tienes permisos para eliminarlo.' });
      return;
    }
    res.json({ message: 'Post eliminado correctamente.' });
  } catch (err) {
    console.error('Error al eliminar post:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;
