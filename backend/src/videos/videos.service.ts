import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import youtubeDl from 'youtube-dl-exec';
import {
  MetadataResponseDto,
  VideoMetadataDto,
} from './dto/video-metadata.dto';

interface RawVideo {
  id?: string;
  title?: string;
  duration?: number;
  thumbnail?: string;
  thumbnails?: { url?: string }[];
  uploader?: string;
  channel?: string;
  url?: string;
}

interface RawInfo extends RawVideo {
  _type?: string;
  entries?: RawVideo[];
}

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  /**
   * Consulta a URL (video ou playlist) e retorna os metadados dos videos.
   * Nao persiste nada — apenas leitura via yt-dlp.
   */
  async getMetadata(url: string): Promise<MetadataResponseDto> {
    let info: RawInfo;
    try {
      info = (await youtubeDl(url, {
        dumpSingleJson: true,
        flatPlaylist: true,
        noWarnings: true,
        skipDownload: true,
      })) as RawInfo;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Falha ao consultar metadados (${url}): ${message}`);
      throw new BadRequestException(
        'Nao foi possivel obter os metadados da URL informada',
      );
    }

    if (
      info?._type === 'playlist' &&
      Array.isArray(info.entries) &&
      info.entries.length > 0
    ) {
      const videos = info.entries
        .filter((entry): entry is RawVideo => Boolean(entry?.id))
        .map((entry) => this.mapVideo(entry));

      return {
        playlist: true,
        playlistTitle: info.title ?? null,
        videos,
      };
    }

    if (!info?.id) {
      throw new BadRequestException('Nenhum video encontrado na URL informada');
    }

    return {
      playlist: false,
      playlistTitle: null,
      videos: [this.mapVideo(info)],
    };
  }

  private mapVideo(raw: RawVideo): VideoMetadataDto {
    const videoId = raw.id ?? '';
    const thumbnail =
      raw.thumbnail ??
      raw.thumbnails?.[raw.thumbnails.length - 1]?.url ??
      null;

    return {
      videoId,
      title: raw.title ?? null,
      duration: raw.duration ?? null,
      thumbnail,
      uploader: raw.uploader ?? raw.channel ?? null,
      url:
        raw.url && raw.url.startsWith('http')
          ? raw.url
          : `https://www.youtube.com/watch?v=${videoId}`,
    };
  }
}
