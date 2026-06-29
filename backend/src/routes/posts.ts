import { Router, Response } from 'express';
import { query } from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/posts — Feed público de posts
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT
        p.id, p.title, p.content, p.likes, p.is_visible, p.created_at,
        u.username AS author_username,
        c.name AS community_name
      FROM posts p
      JOIN users u ON u.id = p.author_id
      LEFT JOIN communities c ON c.id = p.community_id
      WHERE p.is_visible = TRUE
      ORDER BY p.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener posts:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/posts — Crear post (requiere auth)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, community_id } = req.body;

  if (!title || !content) {
    res.status(400).json({ error: 'Título y contenido son requeridos.' });
    return;
  }

  try {
    const result = await query(`
      INSERT INTO posts (title, content, author_id, community_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, content, likes, created_at
    `, [title, content, req.user!.id, community_id || null]);

    res.status(201).json({ message: 'Post creado.', post: result.rows[0] });
  } catch (err) {
    console.error('Error al crear post:', err);
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
    res.status(500).json({ error: 'Error interno del servidor.' });
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

export default router;
