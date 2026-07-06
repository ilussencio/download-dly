import { ApiProperty } from '@nestjs/swagger';
import { DownloadFormat, DownloadStatus } from '../entities/download.entity';

export class DownloadStatusDto {
  @ApiProperty({ example: '0cbd1a95-4259-40c2-8b05-7dca250ce6d3' })
  id: string;

  @ApiProperty({
    nullable: true,
    example: 'http://localhost:3000/0cbd1a95-4259-40c2-8b05-7dca250ce6d3.mp3',
  })
  downloadUrl: string | null;

  @ApiProperty({ enum: DownloadStatus, example: DownloadStatus.AVAILABLE })
  status: DownloadStatus;

  @ApiProperty({ enum: DownloadFormat, example: DownloadFormat.MP3 })
  format: DownloadFormat;

  @ApiProperty({ nullable: true, example: 'Artist - Song Name | Medium' })
  title: string | null;

  @ApiProperty({ example: 0 })
  quality: number;

  @ApiProperty({ example: 0 })
  retry: number;

  @ApiProperty({ nullable: true, example: 'https://your-callback-url.com/notify' })
  callbackUrl: string | null;
}

export class CreateDownloadResponseDto {
  @ApiProperty({
    description: 'Ids dos downloads criados (um por videoId informado)',
    type: [String],
    example: [
      '0cbd1a95-4259-40c2-8b05-7dca250ce6d3',
      '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
    ],
  })
  ids: string[];
}
