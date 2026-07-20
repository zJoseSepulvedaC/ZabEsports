-- ============================================================
-- ZabEsports - Esquema de Base de Datos Completo
-- Versión: Semana 8 | Grupo 10 (Compatible con Azure Cloud)
-- Actualizado: Semana 8 — Optimización de rendimiento (índices compuestos)
-- ============================================================

-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                  CHECK (role IN ('usuario', 'moderador', 'admin')),
    avatar_url  TEXT,
    riot_puuid  VARCHAR(100) UNIQUE,
    riot_game_name VARCHAR(100),
    riot_tag_line  VARCHAR(10),
    lol_rank       VARCHAR(50),
    lol_summoner_level INTEGER,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_puuid    ON users(riot_puuid);

-- ============================================================
-- TABLA: communities
-- ============================================================
CREATE TABLE IF NOT EXISTS communities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    owner_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    game        VARCHAR(100),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communities_owner ON communities(owner_id);

-- ============================================================
-- TABLA: community_members  (many-to-many: users <-> communities)
-- ============================================================
CREATE TABLE IF NOT EXISTS community_members (
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (community_id, user_id)
);

-- ============================================================
-- TABLA: tournaments
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    max_teams    INT NOT NULL DEFAULT 16,
    registered_teams INT NOT NULL DEFAULT 0,
    prize_pool   VARCHAR(100),
    status       VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                   CHECK (status IN ('OPEN', 'ONGOING', 'FINISHED')),
    is_approved  BOOLEAN NOT NULL DEFAULT FALSE,
    riot_tournament_id INT,
    start_date   TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_community ON tournaments(community_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_organizer ON tournaments(organizer_id);

-- ============================================================
-- TABLA: tournament_registrations (many-to-many: teams/users <-> tournaments)
-- ============================================================
CREATE TABLE IF NOT EXISTS tournament_registrations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team_name     VARCHAR(100) NOT NULL,
    registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON tournament_registrations(tournament_id);

-- ============================================================
-- TABLA: tournament_matches
-- ============================================================
CREATE TABLE IF NOT EXISTS tournament_matches (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    team1_name    VARCHAR(100) NOT NULL,
    team2_name    VARCHAR(100) NOT NULL,
    tournament_code VARCHAR(255) UNIQUE NOT NULL,
    status        VARCHAR(20) DEFAULT 'PENDIENTE',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matches_tournament ON tournament_matches(tournament_id);

-- ============================================================
-- TABLA: posts
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    content      TEXT NOT NULL,
    likes        INT NOT NULL DEFAULT 0,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author       ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community    ON posts(community_id);
-- Índice compuesto: optimiza el ORDER BY created_at DESC del feed
CREATE INDEX IF NOT EXISTS idx_posts_feed         ON posts(created_at DESC);
-- Índice compuesto: optimiza búsqueda por autor + orden temporal
CREATE INDEX IF NOT EXISTS idx_posts_author_date  ON posts(author_id, created_at DESC);

-- ============================================================
-- TABLA: interactions
-- ============================================================
CREATE TABLE IF NOT EXISTS interactions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment')),
    content    TEXT, -- NULL si es solo un 'like'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interactions_post      ON interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user      ON interactions(user_id);
-- Índice compuesto: optimiza COUNT de likes por post (post_id + type)
CREATE INDEX IF NOT EXISTS idx_interactions_post_type ON interactions(post_id, type);
-- Índice único parcial: garantiza un solo like por usuario/post
CREATE UNIQUE INDEX IF NOT EXISTS idx_interactions_upsert ON interactions(post_id, user_id, type);

-- ============================================================
-- TABLA: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reason      TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                  CHECK (status IN ('PENDIENTE', 'REVISADO', 'IGNORADO')),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_post       ON reports(reported_post_id);
-- Índice de estado: optimiza filtro de reportes PENDIENTES en el panel de moderación
CREATE INDEX IF NOT EXISTS idx_reports_status     ON reports(status);
-- Índice de fecha: optimiza ORDER BY created_at DESC en la lista de reportes
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);


-- ============================================================
-- DATOS SEMILLA (SEED DATA)
-- ============================================================

-- Usuarios (JoseSepulveda es admin, ZabPlayer es moderador, knghtfyre es usuario)
-- Hash de las contraseñas precalculado con bcrypt (clave: 'password123')
INSERT INTO users (id, username, email, password_hash, role) VALUES
('a1111111-0000-0000-0000-000000000001', 'JoseSepulveda', 'jose@zabesports.cl', '$2b$10$7z9Zt2TFbtcielc6lwp3zeZamUqlv5Rb.mucU4Fn06Dz6ifEeMRYm', 'admin'),
('a1111111-0000-0000-0000-000000000002', 'ZabPlayer', 'zab@zabesports.cl', '$2b$10$7z9Zt2TFbtcielc6lwp3zeZamUqlv5Rb.mucU4Fn06Dz6ifEeMRYm', 'moderador'),
('a1111111-0000-0000-0000-000000000003', 'knghtfyre', 'knghtfyre@correo.com', '$2b$10$7z9Zt2TFbtcielc6lwp3zeZamUqlv5Rb.mucU4Fn06Dz6ifEeMRYm', 'usuario')
ON CONFLICT (id) DO NOTHING;

-- Comunidades
INSERT INTO communities (id, name, description, owner_id, is_approved, game) VALUES
('b2222222-0000-0000-0000-000000000001', 'The Gladiators Clan', 'Comunidad competitiva de League of Legends en Chile', 'a1111111-0000-0000-0000-000000000001', true, 'League of Legends'),
('b2222222-0000-0000-0000-000000000002', 'FNatic Fan Club LATAM', 'Espacio de encuentro para fans de FNATIC en Sudamérica', 'a1111111-0000-0000-0000-000000000002', true, 'Valorant'),
('b2222222-0000-0000-0000-000000000003', 'Apex Competitive Chile', 'Torneos locales y scrims de Apex Legends', 'a1111111-0000-0000-0000-000000000003', false, 'Apex Legends')
ON CONFLICT (id) DO NOTHING;

-- Miembros de Comunidades
INSERT INTO community_members (community_id, user_id) VALUES
('b2222222-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001'),
('b2222222-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000002'),
('b2222222-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- Torneos
INSERT INTO tournaments (id, name, description, community_id, organizer_id, max_teams, registered_teams, prize_pool, status, is_approved, start_date) VALUES
('c3333333-0000-0000-0000-000000000001', 'Copa de las Comunidades LoL 2026', 'Torneo amateur 5v5 en la Grieta del Invocador', 'b2222222-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 16, 4, 'USD 100 y Skin de Campeón', 'OPEN', true, NOW() + INTERVAL '5 days'),
('c3333333-0000-0000-0000-000000000002', 'Valorant Open Challenge', 'Demuestra quién tiene el mejor aim en Santiago', 'b2222222-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002', 8, 2, 'Periféricos Gamer', 'OPEN', false, NOW() + INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Publicaciones
INSERT INTO posts (id, author_id, community_id, title, content, likes) VALUES
('d4444444-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000001', '¡Bienvenidos al lanzamiento de ZabEsports!', 'Este portal es el nuevo hogar para las escuadras de esports y las comunidades que buscan organizar torneos y reclutar talentos.', 12),
('d4444444-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002', 'b2222222-0000-0000-0000-000000000002', 'Buscamos Main Support Challenger para torneo presencial', 'Nuestra escuadra requiere un jugador comprometido con horarios de entrenamiento nocturnos. Dejen sus stats en comentarios.', 8)
ON CONFLICT (id) DO NOTHING;
