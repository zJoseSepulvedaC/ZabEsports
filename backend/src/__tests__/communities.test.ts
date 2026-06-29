/**
 * Tests de Comunidades — ZabEsports REST API
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

const mockCommunities = [
  { id: 'b2222222-0001', name: 'The Gladiators Clan', description: 'Principal', game: 'LoL', is_approved: true, owner_username: 'JoseSepulveda', member_count: 4 },
  { id: 'b2222222-0002', name: 'FNatic Fan Club',      description: 'Club fans',  game: 'Valorant', is_approved: true, owner_username: 'ZabPlayer', member_count: 2 },
  { id: 'b2222222-0003', name: 'Apex Competitive',     description: 'Apex',       game: 'Apex',    is_approved: false, owner_username: 'GamerGirl99', member_count: 1 }
];

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================
// GET /api/communities
// ============================================================
describe('GET /api/communities', () => {
  it('debe retornar un array de comunidades con status 200', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: mockCommunities, command: 'SELECT', rowCount: 3, oid: 0, fields: []
    } as any);

    const res = await request(app).get('/api/communities');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3);
  });

  it('cada comunidad debe tener los campos id, name, is_approved, owner_username, member_count', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: mockCommunities, command: 'SELECT', rowCount: 3, oid: 0, fields: []
    } as any);

    const res = await request(app).get('/api/communities');
    const c = res.body[0];

    expect(c).toHaveProperty('id');
    expect(c).toHaveProperty('name');
    expect(c).toHaveProperty('is_approved');
    expect(c).toHaveProperty('owner_username');
    expect(c).toHaveProperty('member_count');
  });
});

// ============================================================
// POST /api/communities
// ============================================================
describe('POST /api/communities', () => {
  it('debe retornar 401 si no se proporciona token de autenticación', async () => {
    const res = await request(app)
      .post('/api/communities')
      .send({ name: 'Nueva Comunidad', game: 'CS2' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('debe retornar 400 si el nombre de la comunidad está vacío', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token}`)
      .send({ game: 'CS2' }); // Sin nombre

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/nombre/i);
  });

  it('debe crear comunidad correctamente cuando el usuario está autenticado', async () => {
    const token = makeToken('usuario');

    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'new-uuid', name: 'CS2 Masters', description: 'CS2 competitive', game: 'CS2', is_approved: false, created_at: new Date() }],
      command: 'INSERT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/communities')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'CS2 Masters', description: 'CS2 competitive', game: 'CS2' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('community');
    expect(res.body.community.is_approved).toBe(false); // Pendiente por defecto
  });
});

// ============================================================
// PATCH /api/communities/:id/approve
// ============================================================
describe('PATCH /api/communities/:id/approve', () => {
  const communityId = 'b2222222-0003';

  it('debe retornar 401 sin token de autenticación', async () => {
    const res = await request(app).patch(`/api/communities/${communityId}/approve`);
    expect(res.status).toBe(401);
  });

  it('debe retornar 403 si el usuario tiene rol "usuario" (sin permisos)', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .patch(`/api/communities/${communityId}/approve`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/permisos/i);
  });

  it('debe aprobar comunidad si el usuario tiene rol "admin"', async () => {
    const adminToken = makeToken('admin');

    mockQuery.mockResolvedValueOnce({
      rows: [{ id: communityId, name: 'Apex Competitive', is_approved: true }],
      command: 'UPDATE', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .patch(`/api/communities/${communityId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.community.is_approved).toBe(true);
  });

  it('debe aprobar comunidad si el usuario tiene rol "moderador"', async () => {
    const modToken = makeToken('moderador');

    mockQuery.mockResolvedValueOnce({
      rows: [{ id: communityId, name: 'Apex Competitive', is_approved: true }],
      command: 'UPDATE', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .patch(`/api/communities/${communityId}/approve`)
      .set('Authorization', `Bearer ${modToken}`);

    expect(res.status).toBe(200);
  });
});
