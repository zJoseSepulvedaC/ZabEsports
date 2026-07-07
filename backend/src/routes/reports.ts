import { Router, Response } from 'express';
import { query } from '../db/pool';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/reports - Obtener todos los reportes (solo moderador/admin)
router.get('/', authMiddleware, requireRole('moderador', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(`
      SELECT 
        r.id, r.reason, r.status, r.created_at,
        u.username AS reporter_username,
        p.title AS reported_post_title,
        c.name AS reported_community_name,
        t.name AS reported_tournament_name
      FROM reports r
      LEFT JOIN users u ON u.id = r.reporter_id
      LEFT JOIN posts p ON p.id = r.reported_post_id
      LEFT JOIN communities c ON c.id = r.reported_community_id
      LEFT JOIN tournaments t ON t.id = r.reported_tournament_id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener reportes:', err);
    res.status(500).json({ error: 'Error al obtener reportes.' });
  }
});

// POST /api/reports - Crear un reporte (cualquier usuario logueado)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { reported_post_id, reported_community_id, reported_tournament_id, reason } = req.body;

  if (!reason) {
    res.status(400).json({ error: 'El motivo del reporte (reason) es requerido.' });
    return;
  }

  if (!reported_post_id && !reported_community_id && !reported_tournament_id) {
    res.status(400).json({ error: 'Debe reportar un post, una comunidad o un torneo.' });
    return;
  }

  try {
    const result = await query(
      `INSERT INTO reports (reporter_id, reported_post_id, reported_community_id, reported_tournament_id, reason)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, reason, status, created_at`,
      [req.user!.id, reported_post_id || null, reported_community_id || null, reported_tournament_id || null, reason]
    );
    res.status(201).json({ message: 'Reporte enviado con éxito.', report: result.rows[0] });
  } catch (err) {
    console.error('Error al crear reporte:', err);
    res.status(500).json({ error: 'Error al procesar el reporte.' });
  }
});

// PATCH /api/reports/:id - Actualizar estado del reporte (solo moderador/admin)
router.patch('/:id', authMiddleware, requireRole('moderador', 'admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body; // 'REVISADO' o 'IGNORADO'

  if (!status || !['PENDIENTE', 'REVISADO', 'IGNORADO'].includes(status)) {
    res.status(400).json({ error: 'Estado del reporte inválido.' });
    return;
  }

  try {
    const result = await query(
      'UPDATE reports SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Reporte no encontrado.' });
      return;
    }

    res.json({ message: 'Estado del reporte actualizado.', report: result.rows[0] });
  } catch (err) {
    console.error('Error al actualizar reporte:', err);
    res.status(500).json({ error: 'Error al actualizar el reporte.' });
  }
});

export default router;
