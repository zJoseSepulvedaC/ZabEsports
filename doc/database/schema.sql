-- SQL Script para inicializar la base de datos de ZabEsports (PostgreSQL)

-- Extensión para generación de UUIDs si es necesario
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios (Autenticación delegada a Cognito/Identity Provider)
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Mapea al 'sub' (UUID) de AWS Cognito
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    active_role VARCHAR(20) NOT NULL CHECK (active_role IN ('Admin', 'Moderador', 'Usuario')),
    riot_puuid VARCHAR(100) UNIQUE,
    riot_summoner_name VARCHAR(100),
    lol_rank VARCHAR(50),
    preferred_position VARCHAR(20) CHECK (preferred_position IN ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT', 'FILL')),
    availability VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Tabla de Comunidades
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Tabla Intermedia: Miembros de la Comunidad (Many-to-Many)
CREATE TABLE community_members (
    community_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (community_id, user_id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabla de Torneos
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    max_teams INTEGER NOT NULL CHECK (max_teams > 0),
    status VARCHAR(20) DEFAULT 'OPEN' NOT NULL CHECK (status IN ('OPEN', 'IN_PROGRESS', 'FINISHED')),
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Tabla Intermedia: Registro/Inscripción de usuarios en Torneos (Many-to-Many)
CREATE TABLE tournament_registrations (
    tournament_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (tournament_id, user_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Tabla de Publicaciones (dentro de Comunidades o Torneos)
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('COMMUNITY', 'TOURNAMENT')),
    target_id UUID NOT NULL, -- Hace referencia a communities.id o tournaments.id según el target_type
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Tabla de Interacciones (Reacciones/Likes a publicaciones)
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    post_id UUID NOT NULL,
    type VARCHAR(20) DEFAULT 'LIKE' NOT NULL CHECK (type IN ('LIKE', 'LOVE', 'CLAP')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_post_interaction UNIQUE (user_id, post_id)
);

-- 8. Tabla de Reportes (Denuncias de publicaciones, comunidades o torneos)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('POST', 'COMMUNITY', 'TOURNAMENT')),
    target_id UUID NOT NULL, -- Hace referencia al elemento reportado
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'REVIEWED', 'DISMISSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices recomendados para optimización de búsquedas y emparejamiento (reclutamiento)
CREATE INDEX idx_users_lol_rank ON users(lol_rank);
CREATE INDEX idx_users_preferred_position ON users(preferred_position);
CREATE INDEX idx_posts_target ON posts(target_type, target_id);
CREATE INDEX idx_reports_status ON reports(status);
