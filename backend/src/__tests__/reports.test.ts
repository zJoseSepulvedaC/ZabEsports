/**
 * Tests de Reportes y Moderación — ZabEsports REST API
 * Módulo: Sistema de moderación de contenido (RBAC)
 * Framework: Jest + Supertest + ts-jest
 */

jest.mock('../db/pool');

import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import * as poolModule from '../db/pool';

const mockQuery = poolModule.query as jest.MockedFunction<typeof poolModule.query>;
const JWT_SECRET = process.env.JWT_SECRET || 'zabesports_dev_secret';

const makeToken = (role: string) =>
  jwt.sign({ id: 'test-uuid', username: 'testuser', email: 'test@test.com', role }, JWT_SECRET, { expiresIn: '1h' });

afterAll((done) => { server.close(done); });
beforeEach(() => { jest.clearAllMocks(); });

// ============================================================
// GET /api/reports — Solo moderador/admin
// ============================================================
describe('GET /api/reports', () => {
  it('debe retornar 401 si no se proporciona token', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(401);
  });

  it('debe retornar 403 si el rol es usuario estándar (acceso denegado)', async () => {
    const token = makeToken('usuario');
    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('debe retornar lista de reportes (200) si el rol es moderador', async () => {
    const token = makeToken('moderador');

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'report-uuid-1',
          reason: 'Contenido ofensivo',
          status: 'PENDIENTE',
          created_at: new Date(),
          reporter_username: 'knghtfyre',
          reported_post_title: 'Post problemático'
        }
      ],
      command: 'SELECT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('status');
    expect(res.body[0].status).toBe('PENDIENTE');
  });

  it('debe retornar lista de reportes (200) si el rol es admin', async () => {
    const token = makeToken('admin');

    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'report-uuid-2', reason: 'Spam', status: 'REVISADO', reporter_username: 'user1' }
      ],
      command: 'SELECT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ============================================================
// POST /api/reports — Crear reporte
// ============================================================
describe('POST /api/reports', () => {
  it('debe retornar 401 si no hay token', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({ reported_post_id: 'post-uuid-1', reason: 'Spam' });

    expect(res.status).toBe(401);
  });

  it('debe retornar 400 si falta el motivo (reason)', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ reported_post_id: 'post-uuid-1' }); // Sin reason

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/requerido/i);
  });

  it('debe retornar 400 si no se especifica qué se está reportando', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Contenido inapropiado' }); // Sin post/community/tournament id

    expect(res.status).toBe(400);
  });

  it('debe crear el reporte exitosamente (201)', async () => {
    const token = makeToken('usuario');

    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'new-report-uuid',
        reason: 'Lenguaje ofensivo',
        status: 'PENDIENTE',
        created_at: new Date()
      }],
      command: 'INSERT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ reported_post_id: 'post-uuid-1', reason: 'Lenguaje ofensivo' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('report');
    expect(res.body.report.status).toBe('PENDIENTE');
  });
});

// ============================================================
// PATCH /api/reports/:id — Actualizar estado (solo mod/admin)
// ============================================================
describe('PATCH /api/reports/:id', () => {
  it('debe retornar 403 si el rol es usuario estándar', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .patch('/api/reports/report-uuid-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'REVISADO' });

    expect(res.status).toBe(403);
  });

  it('debe retornar 400 si el estado es inválido', async () => {
    const token = makeToken('moderador');

    const res = await request(app)
      .patch('/api/reports/report-uuid-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ESTADO_INVALIDO' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/inválido/i);
  });

  it('debe actualizar el estado del reporte a REVISADO (200) con rol moderador', async () => {
    const token = makeToken('moderador');

    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'report-uuid-1', status: 'REVISADO' }],
      command: 'UPDATE', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .patch('/api/reports/report-uuid-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'REVISADO' });

    expect(res.status).toBe(200);
    expect(res.body.report.status).toBe('REVISADO');
  });

  it('debe retornar 404 si el reporte no existe', async () => {
    const token = makeToken('admin');

    mockQuery.mockResolvedValueOnce({
      rows: [], command: 'UPDATE', rowCount: 0, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .patch('/api/reports/reporte-inexistente')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'IGNORADO' });

    expect(res.status).toBe(404);
  });
});
