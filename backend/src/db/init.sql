-- ============================================================
-- ZabEsports - Esquema de Base de Datos Completo
-- Versión: Semana 6 | Grupo 10
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'usuario'
                  CHECK (role IN ('usuario', 'moderador', 'admin')),
    avatar_url  TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================================
-- TABLA: communities
-- ============================================================
CREATE TABLE IF NOT EXISTS communities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    joined_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (community_id, user_id)
);

-- ============================================================
-- TABLA: tournaments
-- ============================================================
CREATE TABLE IF NOT EXISTS tournaments (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         VARCHAR(200) NOT NULL,
    description  TEXT,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game         VARCHAR(100),
    start_date   DATE NOT NULL,
    end_date     DATE,
    max_teams    INTEGER NOT NULL DEFAULT 16 CHECK (max_teams > 0),
    status       VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                   CHECK (status IN ('OPEN', 'IN_PROGRESS', 'FINISHED', 'CANCELLED')),
    is_approved  BOOLEAN NOT NULL DEFAULT FALSE,
    prize_pool   VARCHAR(100),
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tournaments_organizer  ON tournaments(organizer_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status     ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);

-- ============================================================
-- TABLA: tournament_registrations  (many-to-many: users <-> tournaments)
-- ============================================================
CREATE TABLE IF NOT EXISTS tournament_registrations (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id       UUID NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    team_name     VARCHAR(100),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON tournament_registrations(tournament_id);

-- ============================================================
-- TABLA: posts
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id)    ON DELETE SET NULL,
    title        VARCHAR(200) NOT NULL,
    content      TEXT NOT NULL,
    likes        INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
    is_visible   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_author    ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created   ON posts(created_at DESC);

-- ============================================================
-- TABLA: interactions  (likes por usuario por post)
-- ============================================================
CREATE TABLE IF NOT EXISTS interactions (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id    UUID NOT NULL REFERENCES posts(id)  ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    type       VARCHAR(20) NOT NULL DEFAULT 'like'
                 CHECK (type IN ('like', 'comment')),
    content    TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (post_id, user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_interactions_post ON interactions(post_id);

-- ============================================================
-- TABLA: reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL
                  CHECK (target_type IN ('post', 'community', 'user', 'tournament')),
    target_id   UUID NOT NULL,
    reason      TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================================
-- DATOS SEMILLA (seed data)
-- ============================================================

-- Usuarios de prueba (passwords son hash de 'password123')
INSERT INTO users (id, username, email, password_hash, role) VALUES
  ('a1111111-0000-0000-0000-000000000001', 'JoseSepulveda',  'jose@zabesports.cl',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImJ2zdkq', 'admin'),
  ('a1111111-0000-0000-0000-000000000002', 'ZabPlayer',      'zab@zabesports.cl',    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImJ2zdkq', 'moderador'),
  ('a1111111-0000-0000-0000-000000000003', 'knghtfyre',      'knghtfyre@correo.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImJ2zdkq', 'usuario'),
  ('a1111111-0000-0000-0000-000000000004', 'GamerGirl99',    'gamer@correo.com',     '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVImJ2zdkq', 'usuario')
ON CONFLICT (email) DO NOTHING;

-- Comunidades
INSERT INTO communities (id, name, description, owner_id, is_approved, game) VALUES
  ('b2222222-0000-0000-0000-000000000001', 'The Gladiators Clan',      'Comunidad principal de reclutamiento y torneos.', 'a1111111-0000-0000-0000-000000000001', TRUE,  'League of Legends'),
  ('b2222222-0000-0000-0000-000000000002', 'FNatic Fan Club',           'Club oficial de fanáticos de FNatic en Latinoamérica.', 'a1111111-0000-0000-0000-000000000002', TRUE, 'Valorant'),
  ('b2222222-0000-0000-0000-000000000003', 'Apex Legends Competitive', 'Comunidad para coordinar escuadras competitivas de Apex.', 'a1111111-0000-0000-0000-000000000004', FALSE, 'Apex Legends')
ON CONFLICT (name) DO NOTHING;

-- Miembros de comunidades
INSERT INTO community_members (community_id, user_id) VALUES
  ('b2222222-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001'),
  ('b2222222-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000003'),
  ('b2222222-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002'),
  ('b2222222-0000-0000-0000-000000000003', 'a1111111-0000-0000-0000-000000000004')
ON CONFLICT DO NOTHING;

-- Torneos
INSERT INTO tournaments (id, name, description, community_id, organizer_id, game, start_date, max_teams, status, is_approved, prize_pool) VALUES
  ('c3333333-0000-0000-0000-000000000001', 'VCT: Masters Madrid - Grand Final', 'Evento final presencial retransmitido. 5v5 oficial.', 'b2222222-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002', 'Valorant', '2026-07-10', 16, 'OPEN', TRUE,  '2000 USD en skins'),
  ('c3333333-0000-0000-0000-000000000002', 'FNatic Qualifier: Semi-Finals',      'Clasificatorias para representar al club FNatic.', 'b2222222-0000-0000-0000-000000000002',  'a1111111-0000-0000-0000-000000000002', 'Valorant', '2026-06-28', 8,  'OPEN', TRUE,  NULL),
  ('c3333333-0000-0000-0000-000000000003', 'Apex Legends Global Series (ALGS)',  'Torneo clasificatorio amateur de Apex Legends.', 'b2222222-0000-0000-0000-000000000003',   'a1111111-0000-0000-0000-000000000004', 'Apex Legends', '2026-07-20', 20, 'OPEN', FALSE, NULL)
ON CONFLICT DO NOTHING;

-- Posts
INSERT INTO posts (id, author_id, community_id, title, content, likes) VALUES
  ('d4444444-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 'b2222222-0000-0000-0000-000000000001', 'VCT: Masters Madrid - Grand Final', '¡Espectacular final este fin de semana! Los esperamos a todos en la sala principal de Discord para la retransmisión oficial.', 142),
  ('d4444444-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000003', 'b2222222-0000-0000-0000-000000000003', 'Buscamos Mid Laner suplente para ALGS', 'De preferencia rango Diamante o superior para completar la alineación titular. Buena comunicación por Discord.', 28)
ON CONFLICT DO NOTHING;
