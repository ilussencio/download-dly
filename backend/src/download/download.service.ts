import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { promises as fs } from 'node:fs';
import { join, isAbsolute } from 'node:path';
import youtubeDl from 'youtube-dl-exec';
import { CreateDownloadDto } from './dto/create-download.dto';
import { CreateDownloadResponseDto } from './dto/download-status.dto';
import {
  Download,
  DownloadFormat,
  DownloadStatus,
} from './entities/download.entity';

@Injectable()
export class DownloadService {
  private readonly logger = new Logger(DownloadService.name);
  private readonly downloadsDir: string;
  private readonly publicUrl: string;

  constructor(
    @InjectRepository(Download)
    private readonly downloadRepository: Repository<Download>,
    private readonly config: ConfigService,
  ) {
    const dir = this.config.get<string>('DOWNLOADS_DIR', 'downloads');
    this.downloadsDir = isAbsolute(dir) ? dir : join(process.cwd(), dir);
    this.publicUrl = this.config
      .get<string>('PUBLIC_URL', 'http://localhost:3000')
      .replace(/\/$/, '');
  }

  /**
   * Cria um download por videoId informado e dispara a conversao em segundo
   * plano. Retorna a lista de ids gerados.
   */
  async create(dto: CreateDownloadDto): Promise<CreateDownloadResponseDto> {
    const ids: string[] = [];
    for (const videoId of dto.videoIds) {
      const saved = await this.enqueue(dto, videoId);
      ids.push(saved.id);
    }

    this.logger.log(`Criados ${ids.length} download(s)`);
    return { ids };
  }

  /**
   * Cria o registro de download para um videoId e dispara o processamento.
   */
  private async enqueue(
    dto: CreateDownloadDto,
    videoId: string,
  ): Promise<Download> {
    const download = this.downloadRepository.create({
      videoId,
      sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
      format: dto.format,
      quality: dto.quality ?? 0,
      callbackUrl: dto.callbackUrl ?? null,
      status: DownloadStatus.CONVERTING,
    });

    const saved = await this.downloadRepository.save(download);

    // Processa em segundo plano; nao bloqueia a resposta ao cliente.
    void this.processDownload(saved.id);

    return saved;
  }

  async getStatus(id: string) {
    const download = await this.downloadRepository.findOne({ where: { id } });
    if (!download) {
      throw new NotFoundException(`Download ${id} nao encontrado`);
    }

    return {
      id: download.id,
      downloadUrl: download.downloadUrl,
      status: download.status,
      format: download.format,
      title: download.title,
      quality: download.quality,
      retry: download.retry,
      callbackUrl: download.callbackUrl,
    };
  }

  /**
   * Executa o download/conversao real usando o yt-dlp (youtube-dl-exec).
   */
  private async processDownload(id: string): Promise<void> {
    const download = await this.downloadRepository.findOne({ where: { id } });
    if (!download) {
      this.logger.error(`Download ${id} sumiu antes de processar`);
      return;
    }

    try {
      await fs.mkdir(this.downloadsDir, { recursive: true });

      const outputTemplate = join(this.downloadsDir, `${id}.%(ext)s`);
      const commonFlags = {
        output: outputTemplate,
        noPlaylist: true,
        noWarnings: true,
        restrictFilenames: true,
      };

      const flags =
        download.format === DownloadFormat.MP3
          ? {
              ...commonFlags,
              extractAudio: true,
              audioFormat: 'mp3',
              // yt-dlp: 0 = melhor, 10 = pior. Invertemos a escala do usuario.
              audioQuality: 10 - download.quality,
            }
          : {
              ...commonFlags,
              format: this.buildVideoFormat(download.quality),
              mergeOutputFormat: 'mp4',
            };

      this.logger.log(`Iniciando download ${id} (${download.format})`);
      await youtubeDl(download.sourceUrl, flags);

      const ext = download.format === DownloadFormat.MP3 ? 'mp3' : 'mp4';
      const fileName = `${id}.${ext}`;
      const filePath = join(this.downloadsDir, fileName);

      // Garante que o arquivo foi realmente gerado.
      await fs.access(filePath);

      const title = await this.resolveTitle(download.sourceUrl);

      download.title = title;
      download.filePath = filePath;
      download.downloadUrl = `${this.publicUrl}/${fileName}`;
      download.status = DownloadStatus.AVAILABLE;
      await this.downloadRepository.save(download);

      this.logger.log(`Download ${id} disponivel`);
      await this.notifyCallback(download);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Falha no download ${id}: ${message}`);

      download.status = DownloadStatus.CONVERSION_ERROR;
      download.errorMessage = message;
      await this.downloadRepository.save(download);

      await this.notifyCallback(download);
    }
  }

  /**
   * Mapeia a qualidade (0-10) para uma altura maxima de video.
   */
  private buildVideoFormat(quality: number): string {
    const heights = [144, 240, 360, 480, 720, 720, 1080, 1080, 1440, 2160, 2160];
    const maxHeight = heights[Math.min(Math.max(quality, 0), 10)];
    return `bestvideo[height<=${maxHeight}]+bestaudio/best[height<=${maxHeight}]/best`;
  }

  private async resolveTitle(sourceUrl: string): Promise<string | null> {
    try {
      const info = (await youtubeDl(sourceUrl, {
        dumpSingleJson: true,
        noPlaylist: true,
        noWarnings: true,
        skipDownload: true,
      })) as { title?: string };
      return info?.title ?? null;
    } catch {
      return null;
    }
  }

  private async notifyCallback(download: Download): Promise<void> {
    if (!download.callbackUrl) {
      return;
    }

    try {
      await fetch(download.callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: download.id,
          downloadUrl: download.downloadUrl,
          status: download.status,
          format: download.format,
          title: download.title,
          quality: download.quality,
          retry: download.retry,
          callbackUrl: download.callbackUrl,
        }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Falha ao notificar callback de ${download.id}: ${message}`);
    }
  }
}
