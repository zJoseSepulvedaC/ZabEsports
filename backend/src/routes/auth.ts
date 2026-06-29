import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email y password son requeridos.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    return;
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const result = await query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, 'usuario')
       RETURNING id, username, email, role, created_at`,
      [username, email, password_hash]
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user: result.rows[0]
    });
  } catch (err: unknown) {
    const e = err as { code?: string };
    if (e.code === '23505') {
      res.status(409).json({ error: 'El email o username ya está registrado.' });
    } else {
      console.error('Error en registro:', err);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email y password son requeridos.' });
    return;
  }

  try {
    const result = await query(
      'SELECT id, username, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      res.status(401).json({ error: 'Credenciales inválidas.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'zabesports_dev_secret';
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso.',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// GET /api/auth/me (ruta protegida para obtener info del usuario actual)
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      'SELECT id, username, email, role, avatar_url, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en /me:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;
