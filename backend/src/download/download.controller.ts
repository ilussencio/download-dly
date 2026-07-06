import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateDownloadDto } from './dto/create-download.dto';
import {
  CreateDownloadResponseDto,
  DownloadStatusDto,
} from './dto/download-status.dto';
import { DownloadService } from './download.service';

@ApiTags('downloads')
@Controller()
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Post('download')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Solicita o download de um video (MP3 ou MP4)',
    description:
      'Registra o pedido, inicia a conversao em segundo plano e retorna o id do download.',
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Download aceito e em processamento',
    type: CreateDownloadResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados invalidos' })
  create(@Body() dto: CreateDownloadDto) {
    return this.downloadService.create(dto);
  }

  @Get('status/:id')
  @ApiOperation({
    summary: 'Consulta o status de um download',
    description:
      'Retorna o status (CONVERTING, AVAILABLE ou CONVERSION_ERROR) e a URL de download quando disponivel.',
  })
  @ApiParam({ name: 'id', format: 'uuid', description: 'Id do download' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status do download',
    type: DownloadStatusDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Download nao encontrado',
  })
  getStatus(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.downloadService.getStatus(id);
  }
}
