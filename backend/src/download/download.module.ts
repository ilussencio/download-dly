import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadController } from './download.controller';
import { DownloadService } from './download.service';
import { Download } from './entities/download.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Download])],
  controllers: [DownloadController],
  providers: [DownloadService],
})
export class DownloadModule {}
