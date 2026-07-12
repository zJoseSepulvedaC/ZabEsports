/**
 * Tests de Posts — ZabEsports REST API
 * Módulo: Feed social (creación, likes, comentarios, reportes, CRUD)
 * Framework: Jest + Supertest + ts-jest
 */

jest.mock('../db/pool');

import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app, server } from '../index';
import * as poolModule from '../db/pool';

const mockQuery = poolModule.query as jest.MockedFunction<typeof poolModule.query>;
const JWT_SECRET = process.env.JWT_SECRET || 'zabesports_dev_secret';

const makeToken = (role: string, id = 'test-user-uuid') =>
  jwt.sign({ id, username: 'testuser', email: 'test@test.com', role }, JWT_SECRET, { expiresIn: '1h' });

afterAll((done) => { server.close(done); });
beforeEach(() => { jest.clearAllMocks(); });

// ============================================================
// GET /api/posts — Feed público
// ============================================================
describe('GET /api/posts', () => {
  it('debe retornar lista de posts con status 200', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'post-uuid-1',
          title: 'Primer post de prueba',
          content: 'Contenido del post',
          likes: 5,
          created_at: new Date(),
          author_username: 'JoseSepulveda',
          community_name: 'LoL Chile',
          tournament_name: null
        }
      ],
      command: 'SELECT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app).get('/api/posts');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('author_username');
  });

  it('debe retornar objeto con paginación cuando se envían page y limit', async () => {
    // Mock para COUNT
    mockQuery.mockResolvedValueOnce({
      rows: [{ count: 25 }],
      command: 'SELECT', rowCount: 1, oid: 0, fields: []
    } as any);
    // Mock para los datos paginados
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'p1', title: 'Post A', content: 'Contenido A', likes: 0, author_username: 'user1' },
        { id: 'p2', title: 'Post B', content: 'Contenido B', likes: 2, author_username: 'user2' }
      ],
      command: 'SELECT', rowCount: 2, oid: 0, fields: []
    } as any);

    const res = await request(app).get('/api/posts?page=1&limit=2');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('total');
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(2);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ============================================================
// POST /api/posts — Crear post
// ============================================================
describe('POST /api/posts', () => {
  it('debe retornar 401 si no se proporciona token', async () => {
    const res = await request(app)
      .post('/api/posts')
      .send({ title: 'Test', content: 'Contenido de prueba' });

    expect(res.status).toBe(401);
  });

  it('debe retornar 400 si falta el título', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Contenido sin título' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('debe retornar 400 si falta el contenido', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Título sin contenido' });

    expect(res.status).toBe(400);
  });

  it('debe crear un post exitosamente con token válido (201)', async () => {
    const token = makeToken('usuario');

    mockQuery.mockResolvedValueOnce({
      rows: [{
        id: 'new-post-uuid',
        title: 'Nuevo Post de Test',
        content: 'Contenido de prueba completo',
        likes: 0,
        created_at: new Date(),
        community_id: null,
        tournament_id: null
      }],
      command: 'INSERT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nuevo Post de Test', content: 'Contenido de prueba completo' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('post');
    expect(res.body.post.title).toBe('Nuevo Post de Test');
    expect(res.body.post.likes).toBe(0);
  });
});

// ============================================================
// POST /api/posts/:id/like — Dar like
// ============================================================
describe('POST /api/posts/:id/like', () => {
  it('debe retornar 401 si no hay token', async () => {
    const res = await request(app).post('/api/posts/post-uuid-1/like');
    expect(res.status).toBe(401);
  });

  it('debe registrar like correctamente (200)', async () => {
    const token = makeToken('usuario');

    // Mock INSERT en interactions (upsert)
    mockQuery.mockResolvedValueOnce({
      rows: [], command: 'INSERT', rowCount: 0, oid: 0, fields: []
    } as any);
    // Mock UPDATE contador de likes
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'post-uuid-1', likes: 6 }],
      command: 'UPDATE', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/posts/post-uuid-1/like')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.post.likes).toBe(6);
  });
});

// ============================================================
// POST /api/posts/:id/comment — Comentar
// ============================================================
describe('POST /api/posts/:id/comment', () => {
  it('debe retornar 400 si falta el contenido del comentario', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .post('/api/posts/post-uuid-1/comment')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('debe agregar comentario exitosamente (201)', async () => {
    const token = makeToken('usuario');

    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'comment-uuid', content: 'Gran post!', created_at: new Date() }],
      command: 'INSERT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/posts/post-uuid-1/comment')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Gran post!' });

    expect(res.status).toBe(201);
    expect(res.body.comment.content).toBe('Gran post!');
  });
});

// ============================================================
// POST /api/posts/:id/report — Reportar post
// ============================================================
describe('POST /api/posts/:id/report', () => {
  it('debe retornar 400 si no se especifica un motivo', async () => {
    const token = makeToken('usuario');

    const res = await request(app)
      .post('/api/posts/post-uuid-1/report')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('debe registrar el reporte correctamente (201)', async () => {
    const token = makeToken('usuario');

    mockQuery.mockResolvedValueOnce({
      rows: [], command: 'INSERT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/posts/post-uuid-1/report')
      .set('Authorization', `Bearer ${token}`)
      .send({ reason: 'Contenido ofensivo' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
  });
});

// ============================================================
// DELETE /api/posts/:id — Eliminar post ajeno
// ============================================================
describe('DELETE /api/posts/:id', () => {
  it('debe retornar 403 al intentar eliminar un post que no es del usuario', async () => {
    const token = makeToken('usuario', 'otro-user-uuid');

    // Mock: no encuentra la fila porque el author_id no coincide
    mockQuery.mockResolvedValueOnce({
      rows: [], command: 'DELETE', rowCount: 0, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .delete('/api/posts/post-uuid-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
