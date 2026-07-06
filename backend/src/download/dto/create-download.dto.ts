import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { DownloadFormat } from '../entities/download.entity';

export class CreateDownloadDto {
  @ApiProperty({
    description:
      'Lista de ids de video do YouTube (obtidos em POST /videos/metadata)',
    example: ['dQw4w9WgXcQ'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'informe ao menos um videoId' })
  @IsString({ each: true })
  videoIds: string[];

  @ApiProperty({
    description: 'Formato de saida do download',
    enum: DownloadFormat,
    example: DownloadFormat.MP3,
  })
  @IsEnum(DownloadFormat, { message: 'format deve ser MP3 ou MP4' })
  format: DownloadFormat;

  @ApiPropertyOptional({
    description: 'Qualidade de 0 (menor) a 10 (maior)',
    minimum: 0,
    maximum: 10,
    default: 0,
    example: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'quality minima e 0' })
  @Max(10, { message: 'quality maxima e 10' })
  quality?: number;

  @ApiPropertyOptional({
    description: 'URL para notificacao (callback) quando a conversao terminar',
    example: 'https://your-callback-url.com/notify',
  })
  @IsOptional()
  @IsUrl({}, { message: 'callbackUrl invalida' })
  @IsString()
  callbackUrl?: string;
}
