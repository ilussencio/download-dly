export interface VideoMetadata {
  videoId: string;
  title: string | null;
  duration: number | null;
  thumbnail: string | null;
  uploader: string | null;
  url: string;
}

export interface MetadataResponse {
  playlist: boolean;
  playlistTitle: string | null;
  videos: VideoMetadata[];
}

export enum DownloadFormat {
  MP3 = 'MP3',
  MP4 = 'MP4',
}

export enum DownloadStatus {
  CONVERTING = 'CONVERTING',
  AVAILABLE = 'AVAILABLE',
  CONVERSION_ERROR = 'CONVERSION_ERROR',
}

export interface CreateDownloadDto {
  videoIds: string[];
  format: DownloadFormat;
  quality?: number;
  callbackUrl?: string;
}

export interface CreateDownloadResponse {
  ids: string[];
}

export interface DownloadStatusResponse {
  id: string;
  downloadUrl: string | null;
  status: DownloadStatus;
  format: DownloadFormat;
  title: string | null;
  quality: number;
  retry: number;
  callbackUrl: string | null;
}

export interface DownloadProgress {
  id: string;
  videoId: string;
  title: string;
  status: DownloadStatus;
  downloadUrl: string | null;
}
