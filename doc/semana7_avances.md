# ZabEsports — Avances Semana 7
**Grupo 10 | Taller de Desarrollo de Software**
**Integrante:** José Ignacio Sepúlveda

---

## Resumen Ejecutivo

En esta iteración se abordaron todas las observaciones marcadas como pendientes en el feedback de la semana 6. Los tres frentes de trabajo fueron: (1) integración de un proveedor de identidad como servicio (IDaaS) con AWS Cognito, (2) ampliación significativa de la cobertura de pruebas unitarias, y (3) modularización del frontend en componentes reutilizables, con soporte de paginación en los endpoints de listado.

---

## 1. Integración IDaaS con AWS Cognito ✅

### Motivación
La semana anterior el sistema utilizaba autenticación JWT puramente simétrica (HMAC-SHA256) gestionada de forma manual, sin un proveedor de identidad estandarizado. El docente señaló la necesidad de incorporar un IDaaS (Identity as a Service) como práctica de la industria para gestión segura de identidades.

### Implementación

Se creó el servicio `backend/src/services/cognitoService.ts` que encapsula toda la comunicación con AWS Cognito mediante el SDK oficial (`@aws-sdk/client-cognito-identity-provider`):

| Función exportada | Descripción |
|---|---|
| `isCognitoConfigured()` | Verifica la presencia de variables de entorno de Cognito. Permite al sistema operar en modo **dual** (Cognito o JWT local). |
| `registerUserInCognito(username, email, password)` | Invoca `SignUpCommand` de Cognito. Usa el email como identificador único y retorna el `UserSub` (ID universal del usuario en Cognito). |
| `loginUserInCognito(email, password)` | Invoca `InitiateAuthCommand` con el flujo `USER_PASSWORD_AUTH`. Retorna el `AccessToken` (para autorizar llamadas a la API) y el `IdToken` (que contiene los *claims* del usuario). |

### Integración en `auth.ts`

Las rutas `/api/auth/register` y `/api/auth/login` detectan si Cognito está configurado y derivan el flujo de identidad al proveedor externo. Si las variables de entorno no están presentes, el sistema cae automáticamente al flujo local con JWT simétrico, garantizando compatibilidad con el entorno de desarrollo.

```
IF COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID están configurados:
    → Flujo de identidad delegado a AWS Cognito
ELSE:
    → Flujo local con JWT (HMAC-SHA256) + bcrypt
```

### Validación de Tokens RS256 con JWKS

El middleware `authMiddleware.ts` fue actualizado para verificar tokens emitidos por Cognito usando el estándar RS256 (clave pública asimétrica). El proceso de validación:

1. **Decodificar el header del JWT** para extraer el campo `kid` (Key ID).
2. **Obtener las claves públicas** desde el endpoint JWKS de Cognito: `https://cognito-idp.{REGION}.amazonaws.com/{USER_POOL_ID}/.well-known/jwks.json`
3. **Cachear las claves** en memoria durante 24 horas para evitar llamadas recurrentes.
4. **Convertir el JWK a formato PEM** usando el módulo nativo `crypto` de Node.js (sin dependencias externas).
5. **Verificar la firma** del token con `jwt.verify(token, pem, { algorithms: ['RS256'] })`.
6. **Buscar el usuario** en la base de datos local usando el `sub` del token para recuperar su perfil y rol.

---

## 2. Ampliación de Cobertura de Pruebas Unitarias ✅

### Comparación con semana anterior

| Semana | Archivos de test | Tests totales |
|--------|-----------------|--------------|
| Semana 6 | 2 (`auth.test.ts`, `communities.test.ts`) | 13 tests |
| **Semana 7** | **5** (`auth`, `communities`, `players`, `teams`, `tournaments`) | **~30 tests** |

### Nuevos módulos de prueba

#### `players.test.ts`
- ✅ `GET /api/players` retorna arreglo con campos requeridos (`username`, `game`, `rank`, `role`).
- ✅ Filtrado por parámetro `game` retorna solo jugadores del juego solicitado.
- ✅ Filtrado por parámetro `rank` funciona correctamente.
- ✅ Endpoint es público (no requiere autenticación).

#### `teams.test.ts`
- ✅ `POST /api/teams` retorna 401 si no hay token.
- ✅ `POST /api/teams` crea equipo correctamente con token válido.
- ✅ `POST /api/teams/:id/members` permite añadir miembro al equipo (vinculación Riot en 2 pasos).
- ✅ `POST /api/teams/:id/members` retorna 401 sin autenticación.

#### `tournaments.test.ts`
- ✅ `GET /api/tournaments` retorna lista con status 200.
- ✅ `POST /api/tournaments` retorna 401 sin token.
- ✅ `POST /api/tournaments` crea torneo con `is_approved: false` por defecto.
- ✅ `PATCH /api/tournaments/:id/approve` retorna 403 para rol `usuario`.
- ✅ `PATCH /api/tournaments/:id/approve` aprueba el torneo con rol `moderador` o `admin`.

### Infraestructura de pruebas

- **Framework:** Jest + Supertest + ts-jest
- **Estrategia de mocking:** `jest.mock('../db/pool')` aísla completamente las pruebas de la base de datos real.
- **Ejecución:** `cd backend && npm test`

---

## 3. Modularización del Frontend ✅ (Parcial)

El frontend fue refactorizado de un único archivo monolítico a una arquitectura de componentes en `frontend/src/components/`:

| Componente | Responsabilidad |
|---|---|
| `LoginForm.jsx` | Formulario de inicio de sesión y registro |
| `Feed.jsx` | Feed social con likes optimistas y comentarios en tiempo real |
| `TeamBuilder.jsx` | Constructor y gestión de equipos |
| `Tournaments.jsx` | Listado, detalle e inscripción a torneos |
| `Profile.jsx` | Perfil de usuario, estadísticas y vinculación Riot |
| `Moderation.jsx` | Panel de moderación para gestión de reportes |

---

## 4. Paginación en Endpoints de Listado ✅ (Parcial)

| Endpoint | Parámetros | Respuesta con metadatos |
|---|---|---|
| `GET /api/communities` | `?page=1&limit=10` | `{ data: [...], page, limit, total }` |
| `GET /api/posts` | `?page=1&limit=10` | `{ data: [...], page, limit, total }` |
| `GET /api/tournaments` | `?page=1&limit=10` | `{ data: [...], page, limit, total }` |

La paginación es opcional; si los parámetros no se envían, el endpoint responde con todos los registros (comportamiento retrocompatible).

---

## 5. Arquitectura Actualizada del Proyecto

```
ZabEsports/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── init.sql          ← Esquema 8 tablas + datos semilla
│   │   │   └── pool.ts           ← Conexión pg.Pool con DATABASE_URL
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts ← JWT dual: RS256 (Cognito) + HS256 (local) + RBAC
│   │   ├── routes/
│   │   │   ├── auth.ts           ← Register, Login con Cognito o JWT local
│   │   │   ├── communities.ts    ← CRUD + Approve + Paginación
│   │   │   ├── tournaments.ts    ← CRUD + Approve + Register + Teams
│   │   │   ├── posts.ts          ← Feed + Like + Comment + Paginación
│   │   │   ├── players.ts        ← Reclutamiento con filtros y paginación
│   │   │   ├── reports.ts        ← Moderación de contenido
│   │   │   ├── teams.ts          ← Gestión de equipos
│   │   │   └── users.ts          ← Perfil de usuario
│   │   ├── services/
│   │   │   └── cognitoService.ts ← SDK AWS Cognito: SignUp + InitiateAuth
│   │   ├── __tests__/
│   │   │   ├── auth.test.ts          ← 7 tests
│   │   │   ├── communities.test.ts   ← 7 tests + RBAC
│   │   │   ├── players.test.ts       ← 4 tests
│   │   │   ├── teams.test.ts         ← 4 tests
│   │   │   └── tournaments.test.ts   ← 5 tests + moderación
│   │   └── index.ts              ← Entry point, registro de routers
│   └── package.json
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── LoginForm.jsx
│       │   ├── Feed.jsx
│       │   ├── TeamBuilder.jsx
│       │   ├── Tournaments.jsx
│       │   ├── Profile.jsx
│       │   └── Moderation.jsx
│       └── App.jsx               ← Orquestador principal, manejo de estado global
└── doc/
    ├── semana6_avances.md
    └── semana7_avances.md        ← Este documento
```

---

## 6. Infraestructura Cloud (Operativa)

El sistema continúa en producción en Microsoft Azure bajo el grupo de recursos `ZabEsports-RG`:

| Recurso | Servicio Azure | Identificador |
|---|---|---|
| Frontend | Azure Static Web Apps | `polite-mud-0a1c8430f7.azurestaticapps.net` |
| Backend API | Azure App Service (Node 22 LTS) | `zabesports-api-aje2efc6adawfyh0.eastus2-01.azurewebsites.net` |
| Base de datos | Azure Database for PostgreSQL Flexible | `zabesports-db-cloud.postgres.database.azure.com` |
| Plan de hosting | Azure App Service Plan (`ZabEsports-ASPx`) | East US 2, Linux |

El pipeline de CI/CD en GitHub Actions (rama `main`) ejecuta automáticamente:
1. Pruebas unitarias (Jest + Supertest).
2. Deploy del frontend a Azure Static Web Apps.
3. Deploy del backend a Azure App Service vía Zip Deploy.

---

## 7. Credenciales de Prueba para el Docente

| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| **José Sepúlveda** | `jose@zabesports.cl` | `password123` | admin |
| **ZabPlayer** | `zab@zabesports.cl` | `password123` | moderador |
| **knghtfyre** | `knghtfyre@correo.com` | `password123` | usuario |
