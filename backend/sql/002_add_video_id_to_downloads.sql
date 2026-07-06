-- Guarda o id original do video no YouTube que gerou o download
ALTER TABLE downloads ADD COLUMN IF NOT EXISTS video_id TEXT;

CREATE INDEX IF NOT EXISTS idx_downloads_video_id ON downloads (video_id);
