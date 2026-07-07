import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db/pool';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// GET /api/users - Obtener todos los usuarios (solo admin)
router.get('/', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id, username, email, role, riot_game_name, riot_tag_line, lol_rank, lol_summoner_level, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// POST /api/users - Crear usuario (solo admin)
router.post('/', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email y password son requeridos.' });
    return;
  }
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
      [username, email, password_hash, role || 'usuario']
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'El email o username ya existe.' });
    } else {
      console.error('Error al crear usuario:', err);
      res.status(500).json({ error: 'Error al crear usuario.' });
    }
  }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { username, email, role, password } = req.body;
  
  if (req.user!.role !== 'admin' && req.user!.id !== id) {
    res.status(403).json({ error: 'No tienes permisos para actualizar este usuario.' });
    return;
  }

  try {
    let updateFields = [];
    let params = [];
    let index = 1;

    if (username) {
      updateFields.push(`username = $${index++}`);
      params.push(username);
    }
    if (email) {
      updateFields.push(`email = $${index++}`);
      params.push(email);
    }
    if (role && req.user!.role === 'admin') {
      updateFields.push(`role = $${index++}`);
      params.push(role);
    }
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      updateFields.push(`password_hash = $${index++}`);
      params.push(password_hash);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'No hay campos para actualizar.' });
      return;
    }

    params.push(id);
    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${index} RETURNING id, username, email, role`,
      params
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario.' });
  }
});

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id, username', [id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }
    res.json({ message: 'Usuario eliminado.', user: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});

export default router;
