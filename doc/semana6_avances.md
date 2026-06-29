# ZabEsports — Avances Semana 6
**Grupo 10 | Taller de Desarrollo de Software**

---

## Resumen de Cambios

Esta semana se implementó la integración real con base de datos PostgreSQL, autenticación JWT y pruebas unitarias, resolviendo todas las observaciones críticas del docente.

---

## Base de Datos

### Tecnología
- **PostgreSQL 16** (Docker) con volumen persistente.
- **8 tablas** con relaciones, constraints de integridad referencial e índices.

### Esquema de Tablas

| Tabla | Descripción | Relaciones |
|---|---|---|
| `users` | Usuarios del sistema con hash de contraseña | — |
| `communities` | Comunidades de esports | FK → users (owner) |
| `community_members` | Membresía users↔communities | Many-to-Many |
| `tournaments` | Torneos con estado de aprobación | FK → users, communities |
| `tournament_registrations` | Inscripciones a torneos | Many-to-Many |
| `posts` | Publicaciones en el feed | FK → users, communities |
| `interactions` | Reacciones/comentarios por post | FK → posts, users |
| `reports` | Reportes de moderación | FK → users |

---

## Endpoints REST Implementados

### Autenticación (`/api/auth`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Registrar usuario (bcrypt hash) | No |
| POST | `/api/auth/login` | Login → devuelve JWT | No |
| GET | `/api/auth/me` | Info del usuario actual | Sí (JWT) |

### Comunidades (`/api/communities`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/communities` | Lista todas las comunidades | No |
| GET | `/api/communities/:id` | Detalle de una comunidad | No |
| POST | `/api/communities` | Crear comunidad | Sí |
| PATCH | `/api/communities/:id/approve` | Aprobar (solo mod/admin) | Sí + Rol |
| PATCH | `/api/communities/:id/reject` | Rechazar (solo mod/admin) | Sí + Rol |

### Torneos (`/api/tournaments`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/tournaments` | Lista torneos | No |
| GET | `/api/tournaments/:id` | Detalle torneo | No |
| POST | `/api/tournaments` | Crear torneo | Sí |
| PATCH | `/api/tournaments/:id/approve` | Aprobar (solo admin) | Sí + Rol |
| POST | `/api/tournaments/:id/register` | Inscribirse al torneo | Sí |

### Posts (`/api/posts`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/posts` | Feed de posts | No |
| POST | `/api/posts` | Crear post | Sí |
| POST | `/api/posts/:id/like` | Dar like (sin duplicados) | Sí |
| POST | `/api/posts/:id/report` | Reportar post | Sí |

### Jugadores (`/api/players`)
| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| GET | `/api/players` | Lista con filtros por posición/rango | No |

---

## Autenticación JWT

- Contraseñas almacenadas con **bcryptjs** (10 rounds de sal)
- Tokens **JWT** firmados con `JWT_SECRET` de variable de entorno
- Expiración de **24 horas**
- Middleware `authMiddleware.ts` protege endpoints según rol: `usuario`, `moderador`, `admin`

### Ejemplo de Uso
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jose@zabesports.cl", "password": "password123"}'

# 2. Usar el token recibido
curl http://localhost:5000/api/communities \
  -H "Authorization: Bearer <token_recibido>"
```

---

## Pruebas Unitarias

Framework: **Jest + Supertest + ts-jest**

```bash
cd backend
npm test
```

### Tests Implementados

**`auth.test.ts`** (7 tests)
- ✅ Registro: retorna 400 si faltan campos
- ✅ Registro: retorna 400 si contraseña < 6 caracteres
- ✅ Registro: crea usuario correctamente (no expone hash)
- ✅ Registro: retorna 409 si email duplicado
- ✅ Login: retorna 400 si faltan credenciales
- ✅ Login: retorna 401 si email no existe
- ✅ Login: devuelve JWT válido con 3 partes

**`communities.test.ts`** (6 tests)
- ✅ GET /communities: devuelve array de comunidades
- ✅ Cada comunidad tiene campos requeridos
- ✅ POST /communities: retorna 401 sin token
- ✅ POST /communities: retorna 400 sin nombre
- ✅ PATCH /approve: retorna 401 sin auth
- ✅ PATCH /approve: retorna 403 si rol es usuario
- ✅ PATCH /approve: aprueba comunidad si rol es admin

---

## Instrucciones para Ejecutar Localmente

### Prerrequisitos
- Node.js 18+ y npm
- Docker Desktop corriendo

### Pasos

```bash
# 1. Levantar base de datos (PostgreSQL)
docker-compose up postgres -d

# 2. Iniciar backend
cd backend
npm run dev

# 3. En otra terminal, iniciar frontend
cd frontend
npm run dev
```

El frontend queda en: **http://localhost:5173**
La API en: **http://localhost:5000/api/health**

### Credenciales de prueba
| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| JoseSepúlveda | jose@zabesports.cl | password123 | admin |
| ZabPlayer | zab@zabesports.cl | password123 | moderador |
| knghtfyre | knghtfyre@correo.com | password123 | usuario |

---

## Arquitectura del Proyecto

```
ZabEsports/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── init.sql         ← Esquema 8 tablas + seed
│   │   │   └── pool.ts          ← Conexión pg.Pool
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts ← JWT + RBAC
│   │   ├── routes/
│   │   │   ├── auth.ts          ← Register, Login, Me
│   │   │   ├── communities.ts   ← CRUD + Approve
│   │   │   ├── tournaments.ts   ← CRUD + Register
│   │   │   ├── posts.ts         ← Feed + Like + Report
│   │   │   └── players.ts       ← Reclutamiento
│   │   ├── __tests__/
│   │   │   ├── auth.test.ts
│   │   │   └── communities.test.ts
│   │   └── index.ts             ← Entry point con todos los routers
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   └── src/
│       └── App.jsx              ← Conectado a API real con fetch()
├── docker-compose.yml           ← postgres + backend + frontend
└── doc/
    └── semana6_avances.md       ← Este documento
```
