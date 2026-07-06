import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VideoMetadataDto {
  @ApiProperty({ description: 'Id do video no YouTube', example: 'dQw4w9WgXcQ' })
  videoId: string;

  @ApiProperty({
    description: 'Titulo do video',
    example: 'Rick Astley - Never Gonna Give You Up',
    nullable: true,
  })
  title: string | null;

  @ApiProperty({
    description: 'Duracao em segundos',
    example: 213,
    nullable: true,
  })
  duration: number | null;

  @ApiProperty({
    description: 'URL da miniatura',
    example: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    nullable: true,
  })
  thumbnail: string | null;

  @ApiProperty({
    description: 'Canal / autor do video',
    example: 'Rick Astley',
    nullable: true,
  })
  uploader: string | null;

  @ApiProperty({
    description: 'URL canonica do video',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  url: string;
}

export class MetadataResponseDto {
  @ApiProperty({
    description: 'Indica se a URL era uma playlist',
    example: false,
  })
  playlist: boolean;

  @ApiPropertyOptional({
    description: 'Titulo da playlist (quando aplicavel)',
    example: 'Minha Playlist',
    nullable: true,
  })
  playlistTitle: string | null;

  @ApiProperty({
    description: 'Lista de videos encontrados',
    type: [VideoMetadataDto],
  })
  videos: VideoMetadataDto[];
}
