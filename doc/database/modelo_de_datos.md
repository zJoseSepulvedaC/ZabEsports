# Modelo de Datos - ZabEsports

Este documento describe la estructura y diseño de la base de datos relacional para **ZabEsports**, utilizando **PostgreSQL** y siguiendo los principios de consistencia transaccional y diseño cloud-native.

## 📊 Diagrama Entidad-Relación (ER)

El siguiente diagrama representa gráficamente las entidades, sus atributos clave y las relaciones con sus respectivas cardinalidades.

```mermaid
erDiagram
    USERS {
        uuid id PK "Coincide con sub de AWS Cognito"
        varchar username UK
        varchar email UK
        varchar active_role "Admin, Moderador, Usuario"
        varchar riot_puuid UK
        varchar riot_summoner_name
        varchar lol_rank
        varchar preferred_position "TOP, JG, MID, ADC, SUPP, FILL"
        varchar availability
        timestamp created_at
    }

    COMMUNITIES {
        uuid id PK
        uuid owner_id FK "Creador de la comunidad"
        varchar name UK
        text description
        boolean is_approved "Aprobación de Moderador"
        timestamp created_at
        timestamp last_modified_at
    }

    COMMUNITY_MEMBERS {
        uuid community_id PK, FK
        uuid user_id PK, FK
        timestamp joined_at
    }

    TOURNAMENTS {
        uuid id PK
        uuid owner_id FK "Creador del torneo"
        varchar name
        text description
        timestamp start_date
        integer max_teams
        varchar status "OPEN, IN_PROGRESS, FINISHED"
        boolean is_approved "Aprobación de Moderador"
        timestamp created_at
        timestamp last_modified_at
    }

    TOURNAMENT_REGISTRATIONS {
        uuid tournament_id PK, FK
        uuid user_id PK, FK
        varchar status "PENDING, APPROVED, REJECTED"
        timestamp registered_at
    }

    POSTS {
        uuid id PK
        uuid user_id FK "Autor"
        varchar target_type "COMMUNITY o TOURNAMENT"
        uuid target_id "ID del torneo o de la comunidad"
        varchar title
        text content
        timestamp created_at
    }

    INTERACTIONS {
        uuid id PK
        uuid user_id FK
        uuid post_id FK
        varchar type "LIKE, LOVE, CLAP"
        timestamp created_at
    }

    REPORTS {
        uuid id PK
        uuid reporter_id FK
        varchar target_type "POST, COMMUNITY, TOURNAMENT"
        uuid target_id "ID del elemento reportado"
        text reason
        varchar status "PENDING, REVIEWED, DISMISSED"
        timestamp created_at
    }

    %% Relaciones
    USERS ||--o{ COMMUNITIES : "crea"
    USERS ||--o{ COMMUNITY_MEMBERS : "pertenece_a"
    COMMUNITIES ||--o{ COMMUNITY_MEMBERS : "contiene"
    
    USERS ||--o{ TOURNAMENTS : "organiza"
    USERS ||--o{ TOURNAMENT_REGISTRATIONS : "se_inscribe"
    TOURNAMENTS ||--o{ TOURNAMENT_REGISTRATIONS : "recibe"

    USERS ||--o{ POSTS : "publica"
    USERS ||--o{ INTERACTIONS : "interactua"
    POSTS ||--o{ INTERACTIONS : "recibe_interaccion"

    USERS ||--o{ REPORTS : "crea_reporte"
```

---

## 🗂️ Descripción Detallada de Entidades y Atributos

### 1. `USERS` (Usuarios)
Almacena el perfil y metadatos de los usuarios. La contraseña no se almacena localmente ya que la autenticación es externa (Amazon Cognito).
* `id` (UUID, PK): Identificador único que se mapea directamente con el identificador `sub` retornado por Amazon Cognito.
* `username` (VARCHAR, Único): Nombre de usuario visible en la plataforma.
* `email` (VARCHAR, Único): Correo electrónico del usuario.
* `active_role` (VARCHAR): Rol del usuario en el sistema (`'Admin'`, `'Moderador'`, `'Usuario'`).
* `riot_puuid` (VARCHAR, Único, Nullable): ID único de Riot Games obtenido mediante la API oficial para verificar estadísticas de forma automatizada.
* `riot_summoner_name` (VARCHAR, Nullable): Nombre del invocador del usuario en League of Legends.
* `lol_rank` (VARCHAR, Nullable): Rango del usuario en League of Legends (ej. Gold, Platinum, Diamond).
* `preferred_position` (VARCHAR, Nullable): Rol principal en League of Legends (TOP, JUNGLE, MID, ADC, SUPPORT, FILL).
* `availability` (VARCHAR, Nullable): Horarios disponibles para entrenar o competir.

### 2. `COMMUNITIES` (Comunidades)
Comunidades amateur creadas por usuarios finales para congregar jugadores y compartir contenido.
* `owner_id` (UUID, FK): Referencia al usuario creador y administrador de la comunidad.
* `is_approved` (BOOLEAN): Control de aprobación. Por defecto es `FALSE` y requiere la intervención de un moderador para activarse.
* `last_modified_at` (TIMESTAMP): Registro del momento de la última modificación para auditorías.

### 3. `COMMUNITY_MEMBERS` (Miembros de Comunidad)
Tabla intermedia Many-to-Many que registra qué usuarios pertenecen a qué comunidades.

### 4. `TOURNAMENTS` (Torneos)
Torneos competitivos publicados en la plataforma.
* `owner_id` (UUID, FK): Referencia al usuario organizador del torneo.
* `max_teams` (INTEGER): Límite máximo de participantes.
* `status` (VARCHAR): Estado de progreso del torneo (`'OPEN'`, `'IN_PROGRESS'`, `'FINISHED'`).
* `is_approved` (BOOLEAN): Control de aprobación. Por defecto es `FALSE` y requiere la intervención de un moderador.
* `last_modified_at` (TIMESTAMP): Registro de la última modificación del torneo para auditorías de estado.

### 5. `TOURNAMENT_REGISTRATIONS` (Inscripciones a Torneo)
Tabla intermedia Many-to-Many que registra las inscripciones de jugadores en los torneos.
* `status` (VARCHAR): Estado de la inscripción (`'PENDING'`, `'APPROVED'`, `'REJECTED'`).

### 6. `POSTS` (Publicaciones)
Contenido creado dentro de las comunidades y torneos.
* `target_type` (VARCHAR): Indica si la publicación pertenece a una comunidad o torneo (`'COMMUNITY'`, `'TOURNAMENT'`).
* `target_id` (UUID): ID correspondiente del torneo o de la comunidad.

### 7. `INTERACTIONS` (Interacciones)
Interacciones que los usuarios pueden realizar con las publicaciones (Likes/Reacciones).
* `type` (VARCHAR): Tipo de interacción (ej. `'LIKE'`).

### 8. `REPORTS` (Reportes)
Registro de reportes generados por usuarios sobre publicaciones, comunidades o torneos ofensivos o inapropiados.
* `reporter_id` (UUID, FK): El usuario que realiza la denuncia.
* `target_type` (VARCHAR): Tipo del elemento denunciado (`'POST'`, `'COMMUNITY'`, `'TOURNAMENT'`).
* `target_id` (UUID): ID del elemento denunciado.
* `status` (VARCHAR): Estado del reporte (`'PENDING'`, `'REVIEWED'`, `'DISMISSED'`).
