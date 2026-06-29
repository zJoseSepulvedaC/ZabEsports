/**
 * Tests de Autenticación — ZabEsports REST API
 * Framework: Jest + Supertest + ts-jest
 */

// Mockear el módulo de pool ANTES de importar app
jest.mock('../db/pool');

import request from 'supertest';
import { app, server } from '../index';
import * as poolModule from '../db/pool';

const mockQuery = poolModule.query as jest.MockedFunction<typeof poolModule.query>;

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================
// POST /api/auth/register
// ============================================================
describe('POST /api/auth/register', () => {
  it('debe retornar 400 si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser' }); // Sin email ni password

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('debe retornar 400 si la contraseña tiene menos de 6 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'test', email: 'test@test.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/6 caracteres/);
  });

  it('debe registrar un usuario exitosamente y no exponer el hash de contraseña', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'a1111111-test-0000-0000-000000000001',
        username: 'nuevouser',
        email: 'nuevo@test.com',
        role: 'usuario',
        created_at: new Date().toISOString()
      }],
      command: 'INSERT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'nuevouser', email: 'nuevo@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.username).toBe('nuevouser');
    // Crítico: el hash nunca debe ser enviado al cliente
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('debe retornar 409 si el email ya está registrado (violación unique constraint)', async () => {
    const duplicateError = Object.assign(new Error('duplicate key'), { code: '23505' });
    mockQuery.mockRejectedValueOnce(duplicateError);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'repetido', email: 'existente@test.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/ya está registrado/);
  });
});

// ============================================================
// POST /api/auth/login
// ============================================================
describe('POST /api/auth/login', () => {
  it('debe retornar 400 si faltan credenciales', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com' }); // Sin password

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('debe retornar 401 si el email no existe en la base de datos', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: 'password123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciales inválidas.');
  });

  it('debe devolver un token JWT válido con 3 partes al hacer login exitoso', async () => {
    // Hash bcrypt de 'password123' (generado con bcryptjs rounds=10)
    const bcryptHash = '$2b$10$7z9Zt2TFbtcielc6lwp3zeZamUqlv5Rb.mucU4Fn06Dz6ifEeMRYm';

    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'a1111111-0000-0000-0000-000000000001',
        username: 'JoseSepulveda',
        email: 'jose@zabesports.cl',
        password_hash: bcryptHash,
        role: 'admin'
      }],
      command: 'SELECT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jose@zabesports.cl', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.role).toBe('admin');
    // JWT tiene exactamente 3 partes separadas por puntos
    expect(res.body.token.split('.').length).toBe(3);
  });
});

// ============================================================
// GET /api/health
// ============================================================
describe('GET /api/health', () => {
  it('debe retornar información del servicio con timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('service');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('endpoints');
  });
});
