-- Extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos de enum para formato e status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'download_format') THEN
        CREATE TYPE download_format AS ENUM ('MP3', 'MP4');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'download_status') THEN
        CREATE TYPE download_status AS ENUM ('CONVERTING', 'AVAILABLE', 'CONVERSION_ERROR');
    END IF;
END$$;

-- Tabela de downloads
CREATE TABLE IF NOT EXISTS downloads (
    id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_url    TEXT            NOT NULL,
    format        download_format NOT NULL,
    status        download_status NOT NULL DEFAULT 'CONVERTING',
    quality       INTEGER         NOT NULL DEFAULT 0 CHECK (quality BETWEEN 0 AND 10),
    title         TEXT,
    download_url  TEXT,
    file_path     TEXT,
    retry         INTEGER         NOT NULL DEFAULT 0,
    callback_url  TEXT,
    error_message TEXT,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT now()
);

-- Índice para consultas por status
CREATE INDEX IF NOT EXISTS idx_downloads_status ON downloads (status);

-- Gatilho para manter updated_at atualizado
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_downloads_updated_at ON downloads;
CREATE TRIGGER trg_downloads_updated_at
    BEFORE UPDATE ON downloads
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
