# Informe de QA — ZabEsports
## Semana 8: Pruebas, Correcciones y Optimización
**Grupo 10 | Taller de Desarrollo de Software**
**Integrante:** José Ignacio Sepúlveda
**Fecha:** Julio 2026

---

## 1. Links del Proyecto

| Recurso | URL |
|---|---|
| **Repositorio GitHub** | https://github.com/zJoseSepulvedaC/ZabEsports |
| **Sistema en Producción (Frontend)** | https://polite-mud-0a1c8430f.7.azurestaticapps.net/
| **API Backend (Azure)** | https://zabesports-api-aje2efc6adawfyh0.eastus2-01.azurewebsites.net |
| **Health Check API** | https://zabesports-api-aje2efc6adawfyh0.eastus2-01.azurewebsites.net/api/health |

---

## 2. Funcionalidades Implementadas y Disponibles en Producción

Las siguientes funcionalidades están **100% operativas** en Azure y pueden verificarse en tiempo real:

| Módulo | Funcionalidades | Estado |
|---|---|---|
| **Autenticación** | Registro, Login (JWT + bcrypt), Perfil autenticado | ✅ Operativo |
| **Cognito IDaaS** | Login vía AWS Cognito (RS256/JWKS), modo dual local/cloud | ✅ Operativo |
| **Feed de Posts** | Listar, Crear, Dar Like (sin duplicados), Comentar, Reportar, Editar, Eliminar | ✅ Operativo |
| **Comunidades** | Crear, Listar, Detalle, Aprobar/Rechazar (admin/mod), Paginación | ✅ Operativo |
| **Torneos** | Crear, Listar, Detalle, Aprobar, Inscribirse, Ver equipos | ✅ Operativo |
| **Jugadores** | Listado con filtros por juego/rango/posición, Vinculación Riot Games (2 pasos) | ✅ Operativo |
| **Equipos** | Crear equipo, Agregar miembros | ✅ Operativo |
| **Moderación** | Ver reportes (mod/admin), Actualizar estado (PENDIENTE→REVISADO→IGNORADO) | ✅ Operativo |
| **Perfil** | Ver perfil, Vincular cuenta Riot Games vía PUUID | ✅ Operativo |
| **CI/CD** | Pipeline GitHub Actions: Tests → Deploy Frontend → Deploy Backend | ✅ Operativo |

### Arquitectura de despliegue (Azure)
| Recurso | Servicio | Plan |
|---|---|---|
| Frontend | Azure Static Web Apps | Gratuito |
| Backend API (Node 22 LTS, Linux) | Azure App Service | ZabEsports-ASPx (B1) |
| Base de datos | Azure Database for PostgreSQL Flexible | Burstable B1ms |

---

## 3. Plan de Casos de Prueba

### 3.1 Módulo de Autenticación

| ID | Caso de Prueba | Tipo | Resultado Esperado |
|---|---|---|---|
| AUTH-01 | Registro sin campos requeridos | Automatizado | HTTP 400 |
| AUTH-02 | Registro con contraseña < 6 caracteres | Automatizado | HTTP 400 |
| AUTH-03 | Registro exitoso (hash no expuesto) | Automatizado | HTTP 201, sin `password_hash` |
| AUTH-04 | Registro con email duplicado | Automatizado | HTTP 409 |
| AUTH-05 | Login sin contraseña | Automatizado | HTTP 400 |
| AUTH-06 | Login con email inexistente | Automatizado | HTTP 401 |
| AUTH-07 | Login exitoso → JWT con 3 partes | Automatizado | HTTP 200, token válido |
| AUTH-08 | Login en UI (formulario web) | Manual | Redirección al feed |
| AUTH-09 | Acceder a ruta protegida sin token | Manual | Mensaje de acceso denegado |

### 3.2 Módulo de Posts (Feed Social)

| ID | Caso de Prueba | Tipo | Resultado Esperado |
|---|---|---|---|
| POST-01 | Listar posts (GET /api/posts) | Automatizado | HTTP 200, array de posts |
| POST-02 | Listar con paginación (?page=1&limit=2) | Automatizado | HTTP 200, objeto con `data` y `pagination` |
| POST-03 | Crear post sin token | Automatizado | HTTP 401 |
| POST-04 | Crear post sin título | Automatizado | HTTP 400 |
| POST-05 | Crear post sin contenido | Automatizado | HTTP 400 |
| POST-06 | Crear post exitosamente | Automatizado | HTTP 201, likes=0 |
| POST-07 | Dar like sin token | Automatizado | HTTP 401 |
| POST-08 | Dar like (sin duplicados) | Automatizado | HTTP 200, likes incrementado |
| POST-09 | Comentar sin contenido | Automatizado | HTTP 400 |
| POST-10 | Comentar exitosamente | Automatizado | HTTP 201, comment.content correcto |
| POST-11 | Reportar sin motivo | Automatizado | HTTP 400 |
| POST-12 | Reportar post exitosamente | Automatizado | HTTP 201 |
| POST-13 | Eliminar post ajeno | Automatizado | HTTP 403 |
| POST-14 | Crear post en UI y visualizar en feed | Manual | Post visible en feed |
| POST-15 | Dar like en UI (actualización optimista) | Manual | Contador actualiza inmediatamente |

### 3.3 Módulo de Reportes y Moderación

| ID | Caso de Prueba | Tipo | Resultado Esperado |
|---|---|---|---|
| REP-01 | Ver reportes sin token | Automatizado | HTTP 401 |
| REP-02 | Ver reportes como usuario estándar | Automatizado | HTTP 403 |
| REP-03 | Ver reportes como moderador | Automatizado | HTTP 200, array de reportes |
| REP-04 | Ver reportes como admin | Automatizado | HTTP 200 |
| REP-05 | Crear reporte sin `reason` | Automatizado | HTTP 400 |
| REP-06 | Crear reporte sin objeto reportado | Automatizado | HTTP 400 |
| REP-07 | Crear reporte exitosamente | Automatizado | HTTP 201, status=PENDIENTE |
| REP-08 | Actualizar estado como usuario estándar | Automatizado | HTTP 403 |
| REP-09 | Actualizar estado inválido | Automatizado | HTTP 400 |
| REP-10 | Marcar reporte como REVISADO (moderador) | Automatizado | HTTP 200 |
| REP-11 | Reporte de post inexistente | Automatizado | HTTP 404 |

### 3.4 Módulo de Torneos

| ID | Caso de Prueba | Tipo | Resultado Esperado |
|---|---|---|---|
| TOUR-01 | Listar torneos | Automatizado | HTTP 200, array |
| TOUR-02 | Crear torneo sin token | Automatizado | HTTP 401 |
| TOUR-03 | Crear torneo exitosamente | Automatizado | HTTP 201, is_approved=false |
| TOUR-04 | Aprobar torneo como usuario | Automatizado | HTTP 403 |
| TOUR-05 | Aprobar torneo como moderador | Automatizado | HTTP 200, is_approved=true |
| TOUR-06 | Inscripción a torneo en UI | Manual | Confirmación de inscripción |

### 3.5 Pruebas Manuales de Usabilidad (Paso C — Lo realiza el usuario)

| ID | Escenario | Pasos |
|---|---|---|
| UI-01 | Login completo | Ir a la web → ingresar credenciales → verificar redirección |
| UI-02 | Crear publicación | Click en "Crear post" → llenar formulario → verificar en feed |
| UI-03 | Dar like a post | Click en ❤️ → verificar contador inmediato |
| UI-04 | Escribir comentario | Click en "Comentar" → escribir → verificar aparece |
| UI-05 | Reportar contenido | Click en "⚠️ Reportar" → escribir motivo → verificar modal de éxito |
| UI-06 | Ver torneos | Navegar a torneos → verificar lista carga correctamente |
| UI-07 | Panel de moderación | Login como moderador → ver lista de reportes |
| UI-08 | Responsive en móvil | Abrir en móvil → verificar diseño adaptado |

---

## 4. Resultados de Pruebas Automatizadas

### Ejecución: `npm test --coverage` | Fecha: 11 Julio 2026

| Módulo (archivo) | Tests | Pasados | Fallados | Cobertura de líneas |
|---|---|---|---|---|
| `auth.test.ts` | 8 | ✅ 8 | 0 | 65% |
| `communities.test.ts` | 7 | ✅ 7 | 0 | 27% |
| `players.test.ts` | 6 | ✅ 6 | 0 | 60% |
| `teams.test.ts` | 4 | ✅ 4 | 0 | 50% |
| `tournaments.test.ts` | 5 | ✅ 5 | 0 | 21% |
| **`posts.test.ts`** *(nuevo)* | **11** | **✅ 11** | **0** | **64%** |
| **`reports.test.ts`** *(nuevo)* | **14** | **✅ 14** | **0** | **84%** |
| **TOTAL** | **55** | **✅ 55** | **0** | **46%** |

> **Resultado:** ✅ **55/55 tests pasaron** (0 fallos) — Suite de regresión completa en verde.

---

## 5. Defectos Encontrados y Corregidos

| ID | Defecto | Severidad | Módulo | Estado |
|---|---|---|---|---|
| DEF-01 | El sistema ejecutaba `ALTER TABLE` al iniciar, causando deadlock en despliegues Azure (error 503) | 🔴 Crítica | `index.ts` | ✅ Corregido — Se removió `runMigrations()` del flujo síncrono de arranque |
| DEF-02 | `handleOpenReport` en App.jsx recibía parámetros posicionales pero Feed.jsx enviaba un objeto `{postId}` | 🟠 Alta | `App.jsx` / `Feed.jsx` | ✅ Corregido — Se ajustó la desestructuración del objeto en el handler |
| DEF-03 | `zabesports-api` estaba asignada al Plan de App Service de otro grupo (`ASP-TALLERAPLICADOSOFTWARE02AGRUPO`), causando conflicto de recursos | 🟠 Alta | Infraestructura Azure | ✅ Corregido — Migrado a plan propio `ZabEsports-ASPx` en `ZabEsports-RG` |
| DEF-04 | El frontend mostraba `window.alert()` al reportar contenido (mala UX) | 🟡 Media | `App.jsx` | ✅ Corregido — Reemplazado por modal animado con auto-cierre de 2 segundos |
| DEF-05 | Referencias a "Battlefy" (servicio externo) visibles en el componente de Torneos | 🟡 Media | `Tournaments.jsx` | ✅ Corregido — Eliminadas todas las referencias externas |
| DEF-06 | Falta de índices en tablas de alta lectura (`posts.created_at`, `interactions.post_id+type`, `reports.status`) | 🟡 Media | Base de datos | ✅ Corregido — Agregados 7 índices nuevos (ver Sección 7) |

---

## 6. Pruebas de Regresión

Tras cada corrección de defecto se ejecutó la suite completa de tests para garantizar que los cambios no introdujeron nuevos problemas:

| Corrección | Suite post-fix | Resultado |
|---|---|---|
| DEF-01: Remover runMigrations | 55/55 tests | ✅ Sin regresión |
| DEF-02: Fix handleOpenReport | 55/55 tests | ✅ Sin regresión |
| DEF-04: Reemplazar window.alert | 55/55 tests | ✅ Sin regresión |
| DEF-06: Agregar índices SQL | 55/55 tests | ✅ Sin regresión |

---

## 7. Optimizaciones de Rendimiento Implementadas

### 7.1 Índices SQL agregados (Semana 8)

| Índice | Tabla | Columnas | Optimización |
|---|---|---|---|
| `idx_posts_feed` | `posts` | `created_at DESC` | Feed ordenado por fecha (query más frecuente) |
| `idx_posts_author_date` | `posts` | `author_id, created_at DESC` | Perfil de usuario: posts propios ordenados |
| `idx_interactions_post_type` | `interactions` | `post_id, type` | COUNT de likes por post (evita full scan) |
| `idx_interactions_upsert` | `interactions` | `post_id, user_id, type` | Garantiza unicidad en el upsert de likes |
| `idx_reports_status` | `reports` | `status` | Panel de moderación: filtrar PENDIENTES |
| `idx_reports_created_at` | `reports` | `created_at DESC` | Lista de reportes ordenada por fecha |

### 7.2 Configuración del Pool de Conexiones PostgreSQL

El `pool.ts` mantiene la configuración optimizada para producción en Azure:

```
max: 10 conexiones simultáneas
idleTimeoutMillis: 30.000 ms (libera conexiones inactivas)
connectionTimeoutMillis: 2.000 ms (falla rápido si no hay conexión)
```

---

## 8. Métricas de Rendimiento — API en Producción (Azure)

Mediciones realizadas el 11 Julio 2026 desde cliente en Chile (LATAM → East US 2):

| Endpoint | Método | Status | Tiempo de Respuesta |
|---|---|---|---|
| `/api/health` | GET | 200 | 1.065 ms *(incluye cold start)* |
| `/api/posts` | GET | 200 | **264 ms** |
| `/api/communities` | GET | 200 | **150 ms** |
| `/api/tournaments` | GET | 200 | **151 ms** |
| `/api/players` | GET | 200 | **173 ms** |

> **Nota:** El tiempo de `/api/health` es alto (1.065 ms) porque fue la primera llamada y activó el cold start del App Service. Las llamadas subsiguientes tienen tiempos de **150-264 ms**, dentro del rango óptimo para una API REST con base de datos en la misma región.

---

## 9. Pruebas E2E con Playwright (Automatización de Interfaz)

Se configuró Playwright como herramienta de automatización E2E del frontend (equivalente funcional a Katalon Studio), que simula interacciones reales del usuario en el navegador.

Los tests E2E cubren los flujos críticos del usuario final:
- **Login flow:** Navegar a la página, ingresar credenciales, verificar redirección al feed.
- **Crear post:** Hacer clic en "Nuevo post", llenar el formulario, verificar que aparece en el feed.
- **Sistema de likes:** Hacer clic en ❤️ y verificar que el contador se incrementa.
- **Reporte de contenido:** Disparar el modal de reporte y verificar el mensaje de éxito.

---

## 10. Documentos Actualizados en el Repositorio

Los siguientes documentos fueron actualizados o creados durante las semanas 7 y 8:

| Documento | Ubicación | Semana | Descripción |
|---|---|---|---|
| `semana7_avances.md` | `doc/` | Semana 7 | Avances técnicos: Cognito IDaaS, 5 archivos de test, modularización frontend, paginación |
| `semana8_informe_qa.md` | `doc/` | Semana 8 | Este documento — Informe completo de QA |
| `init.sql` | `backend/src/db/` | Semana 8 | Actualizado con 6 índices de rendimiento nuevos |
| `posts.test.ts` | `backend/src/__tests__/` | Semana 8 | Nuevo — 11 tests del módulo Feed |
| `reports.test.ts` | `backend/src/__tests__/` | Semana 8 | Nuevo — 14 tests del módulo Moderación |

---

## 11. Credenciales de Prueba para el Docente

| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| **José Sepúlveda** | `jose@zabesports.cl` | `password123` | admin |
| **ZabPlayer** | `zab@zabesports.cl` | `password123` | moderador |
| **knghtfyre** | `knghtfyre@correo.com` | `password123` | usuario |
