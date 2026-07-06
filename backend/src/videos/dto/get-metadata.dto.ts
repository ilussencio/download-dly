import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class GetMetadataDto {
  @ApiProperty({
    description: 'URL de um video ou de uma playlist do YouTube',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  })
  @IsUrl({}, { message: 'URL invalida' })
  url: string;
}
