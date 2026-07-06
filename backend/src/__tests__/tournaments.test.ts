/**
 * Tests de Torneos — ZabEsports REST API
 * Framework: Jest + Supertest + ts-jest
 */

jest.mock('../db/pool');

import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import * as poolModule from '../db/pool';

const mockQuery = poolModule.query as jest.MockedFunction<typeof poolModule.query>;

const JWT_SECRET = process.env.JWT_SECRET || 'zabesports_dev_secret';

// Helper: generar token de prueba
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
});

// ============================================================
// GET /api/tournaments
// ============================================================
describe('GET /api/tournaments', () => {
  it('debe retornar lista de torneos con status 200', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 't1',
          name: 'Copa Gaming 2026',
          game: 'League of Legends',
          start_date: new Date(),
          max_teams: 16,
          status: 'OPEN',
          is_approved: true,
          organizer_username: 'Jose'
        }
      ],
      command: 'SELECT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app).get('/api/tournaments');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].name).toBe('Copa Gaming 2026');
  });
});

// ============================================================
// POST /api/tournaments (Crear)
// ============================================================
describe('POST /api/tournaments', () => {
  it('debe retornar 401 si el usuario no tiene token', async () => {
    const res = await request(app)
      .post('/api/tournaments')
      .send({ name: 'Nuevo Torneo', game: 'League of Legends' });

    expect(res.status).toBe(401);
  });

  it('debe crear un torneo correctamente estando autenticado', async () => {
    const token = makeToken('usuario');

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 't-new-uuid',
          name: 'Torneo Pro LoL',
          game: 'League of Legends',
          is_approved: false
        }
      ],
      command: 'INSERT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/tournaments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Torneo Pro LoL',
        description: 'Mejor torneo',
        game: 'League of Legends',
        start_date: '2026-08-16T00:00:00.000Z',
        max_teams: 16,
        prize_pool: '500 USD'
      });

    expect(res.status).toBe(201);
    expect(res.body.tournament.name).toBe('Torneo Pro LoL');
    expect(res.body.tournament.is_approved).toBe(false);
  });
});

// ============================================================
// PATCH /api/tournaments/:id/approve (Aprobar)
// ============================================================
describe('PATCH /api/tournaments/:id/approve', () => {
  it('debe denegar acceso (403) si el rol es usuario estándar', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .patch('/api/tournaments/t1/approve')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('debe permitir aprobar el torneo (200) si el rol es moderador o admin', async () => {
    const token = makeToken('moderador');

    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 't1', name: 'Torneo Aprobado', is_approved: true }],
      command: 'UPDATE', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .patch('/api/tournaments/t1/approve')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tournament.is_approved).toBe(true);
  });
});
