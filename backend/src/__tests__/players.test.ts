/**
 * Tests de Jugadores e Integración con Riot Games — ZabEsports REST API
 * Framework: Jest + Supertest + ts-jest
 */

jest.mock('../db/pool');
jest.mock('https');

import request from 'supertest';
import { app, server } from '../index';
import * as poolModule from '../db/pool';
import https from 'https';
import { EventEmitter } from 'events';

const mockQuery = poolModule.query as jest.MockedFunction<typeof poolModule.query>;

// Helper para simular llamadas HTTP de Riot Games
const mockHttpsGet = (statusCode: number, responseData: any) => {
  const mockResponse = new EventEmitter() as any;
  mockResponse.statusCode = statusCode;

  const mockRequest = new EventEmitter() as any;

  (https.get as jest.Mock).mockImplementationOnce((url: string, options: any, callback: any) => {
    callback(mockResponse);
    
    // Emitir datos en el microtask queue para permitir la suscripción
    process.nextTick(() => {
      mockResponse.emit('data', JSON.stringify(responseData));
      mockResponse.emit('end');
    });

    return mockRequest;
  });
};

afterAll((done) => {
  server.close(done);
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ============================================================
// GET /api/players
// ============================================================
describe('GET /api/players', () => {
  it('debe retornar la lista de jugadores con rango y posición', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'u1',
          username: 'Zabat',
          role: 'usuario',
          lol_rank: 'MASTER I',
          lol_summoner_level: 1077,
          riot_game_name: 'Zabat',
          riot_tag_line: 'sun',
          created_at: new Date(),
          team_name: 'Nonstop'
        }
      ],
      command: 'SELECT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app).get('/api/players');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].username).toBe('Zabat');
    expect(res.body[0].team_name).toBe('Nonstop');
  });
});

// ============================================================
// POST /api/players/riot-link (Paso 1)
// ============================================================
describe('POST /api/players/riot-link', () => {
  it('debe retornar 400 si faltan parámetros', async () => {
    const res = await request(app)
      .post('/api/players/riot-link')
      .send({ gameName: 'Zabat' }); // Faltan tagLine y region

    expect(res.status).toBe(400);
  });

  it('debe iniciar el proceso de vinculación correctamente si la cuenta existe', async () => {
    // Mockear la respuesta de Riot Account-V4
    mockHttpsGet(200, {
      puuid: 'mock-puuid-12345',
      gameName: 'Zabat',
      tagLine: 'sun'
    });

    // Mockear la base de datos para simular que el puuid no está en uso
    mockQuery.mockResolvedValueOnce({
      rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/players/riot-link')
      .send({ gameName: 'Zabat', tagLine: 'sun', region: 'LAS' });

    expect(res.status).toBe(200);
    expect(res.body.puuid).toBe('mock-puuid-12345');
    expect(res.body).toHaveProperty('targetIconId');
  });

  it('debe retornar 400 si el puuid ya está vinculado a otro usuario', async () => {
    mockHttpsGet(200, {
      puuid: 'mock-puuid-12345',
      gameName: 'Zabat',
      tagLine: 'sun'
    });

    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'u2', username: 'OtroUsuario' }],
      command: 'SELECT', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/players/riot-link')
      .send({ gameName: 'Zabat', tagLine: 'sun', region: 'LAS' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('ya está vinculada');
  });
});

// ============================================================
// POST /api/players/riot-verify (Paso 2)
// ============================================================
describe('POST /api/players/riot-verify', () => {
  it('debe verificar y vincular la cuenta si el icono coincide', async () => {
    // 1. Mock de Summoner-V4 (ID del icono 4977 o targetIconId)
    mockHttpsGet(200, {
      profileIconId: 4977,
      summonerLevel: 30
    });

    // 2. Mock de League-V4 (Rango SoloQ)
    mockHttpsGet(200, [
      {
        queueType: 'RANKED_SOLO_5x5',
        tier: 'GOLD',
        rank: 'IV'
      }
    ]);

    // 3. Mock BD para el UPDATE
    mockQuery.mockResolvedValueOnce({
      rows: [], command: 'UPDATE', rowCount: 1, oid: 0, fields: []
    } as any);

    const res = await request(app)
      .post('/api/players/riot-verify')
      .send({
        puuid: 'mock-puuid-12345',
        gameName: 'Zabat',
        tagLine: 'sun',
        targetIconId: '0',
        userId: 'user-uuid'
      });

    expect(res.status).toBe(200);
    expect(res.body.riot_summoner_name).toBe('Zabat#sun');
    expect(res.body.lol_rank).toBe('GOLD IV');
  });
});
