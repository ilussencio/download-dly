import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadModule } from './download/download.module';
import { Download } from './download/entities/download.entity';
import { VideosModule } from './videos/videos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'app_user'),
        password: config.get<string>('DB_PASSWORD', 'app_password'),
        database: config.get<string>('DB_NAME', 'app_db'),
        entities: [Download],
        // As tabelas sao criadas via scripts SQL (pasta ./sql).
        synchronize: false,
      }),
    }),
    DownloadModule,
    VideosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
