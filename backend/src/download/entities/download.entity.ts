import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DownloadFormat {
  MP3 = 'MP3',
  MP4 = 'MP4',
}

export enum DownloadStatus {
  CONVERTING = 'CONVERTING',
  AVAILABLE = 'AVAILABLE',
  CONVERSION_ERROR = 'CONVERSION_ERROR',
}

@Entity({ name: 'downloads' })
export class Download {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'source_url', type: 'text' })
  sourceUrl: string;

  @Column({ name: 'video_id', type: 'text', nullable: true })
  videoId: string | null;

  @Column({ type: 'enum', enum: DownloadFormat })
  format: DownloadFormat;

  @Column({
    type: 'enum',
    enum: DownloadStatus,
    default: DownloadStatus.CONVERTING,
  })
  status: DownloadStatus;

  @Column({ type: 'int', default: 0 })
  quality: number;

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ name: 'download_url', type: 'text', nullable: true })
  downloadUrl: string | null;

  @Column({ name: 'file_path', type: 'text', nullable: true })
  filePath: string | null;

  @Column({ type: 'int', default: 0 })
  retry: number;

  @Column({ name: 'callback_url', type: 'text', nullable: true })
  callbackUrl: string | null;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
