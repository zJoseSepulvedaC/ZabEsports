/**
 * Tests de Escuadras (Teams) — ZabEsports REST API
 * Framework: Jest + Supertest + ts-jest
 */

jest.mock('../db/pool');

import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import * as poolModule from '../db/pool';

const mockQuery = poolModule.query as jest.MockedFunction<typeof poolModule.query>;

const JWT_SECRET = process.env.JWT_SECRET || 'zabesports_dev_secret';

const makeToken = (role: string) => jwt.sign(
  { id: 'test-uuid', username: 'testuser', email: 'test@test.com', role },
  JWT_SECRET,
  { expiresIn: '1h' }
);

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  jest.clearAllMocks();
  // Ignorar y resolver transacciones de base de datos automáticamente
  mockQuery.mockImplementation((sql: string, params?: any[]) => {
    if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK')) {
      return Promise.resolve({ rows: [], command: 'TX', rowCount: 0, oid: 0, fields: [] } as any);
    }
    // Fallback básico para cualquier otra consulta no mockeada explícitamente
    return Promise.resolve({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] } as any);
  });
});

// ============================================================
// POST /api/teams (Crear Escuadra)
// ============================================================
describe('POST /api/teams', () => {
  it('debe retornar 401 si no hay token', async () => {
    const res = await request(app)
      .post('/api/teams')
      .send({ name: 'Team SoloMid' });

    expect(res.status).toBe(401);
  });

  it('debe crear un equipo y añadir al capitán como miembro', async () => {
    const token = makeToken('usuario');

    // Mockear condicionalmente por tipo de SQL para evitar desfases de transacción
    mockQuery.mockImplementation((sql: string, params?: any[]) => {
      if (sql.includes('BEGIN') || sql.includes('COMMIT') || sql.includes('ROLLBACK')) {
        return Promise.resolve({ rows: [], command: 'TX', rowCount: 0, oid: 0, fields: [] } as any);
      }
      if (sql.includes('INSERT INTO teams')) {
        return Promise.resolve({
          rows: [{ id: 'team-uuid-1', name: 'Nonstop', captain_id: 'test-uuid', created_at: new Date() }],
          command: 'INSERT', rowCount: 1, oid: 0, fields: []
        } as any);
      }
      if (sql.includes('INSERT INTO team_members')) {
        return Promise.resolve({
          rows: [], command: 'INSERT', rowCount: 1, oid: 0, fields: []
        } as any);
      }
      return Promise.resolve({ rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] } as any);
    });

    const res = await request(app)
      .post('/api/teams')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nonstop' });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/creada exitosamente/i);
    expect(res.body.team.name).toBe('Nonstop');
  });
});

// ============================================================
// GET /api/teams/mine (Mis Escuadras)
// ============================================================
describe('GET /api/teams/mine', () => {
  it('debe retornar las escuadras en las que participa el usuario', async () => {
    const token = makeToken('usuario');

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'team-uuid-1',
          name: 'Nonstop',
          captain_id: 'test-uuid',
          member_count: 2,
          members: ['testuser', 'eNero']
        }
      ],
      command: 'SELECT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .get('/api/teams/mine')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Nonstop');
    expect(res.body[0].member_count).toBe(2);
  });
});
