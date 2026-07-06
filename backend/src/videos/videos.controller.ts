import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetMetadataDto } from './dto/get-metadata.dto';
import { MetadataResponseDto } from './dto/video-metadata.dto';
import { VideosService } from './videos.service';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('metadata')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consulta metadados de um video ou playlist',
    description:
      'Recebe a URL de um video ou playlist do YouTube e retorna os metadados dos videos (id, titulo, duracao, miniatura, canal). Nao inicia download.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Metadados encontrados',
    type: MetadataResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'URL invalida ou sem videos',
  })
  getMetadata(@Body() dto: GetMetadataDto) {
    return this.videosService.getMetadata(dto.url);
  }
}
