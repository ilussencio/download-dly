'use client';

import { useState, useEffect } from 'react';
import { 
  MetadataResponse, 
  DownloadFormat, 
  VideoMetadata,
  CreateDownloadResponse,
  DownloadStatusResponse,
  DownloadStatus,
  DownloadProgress
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [error, setError] = useState('');
  const [format, setFormat] = useState<DownloadFormat>(DownloadFormat.MP3);
  const [quality, setQuality] = useState(5);
  const [downloads, setDownloads] = useState<DownloadProgress[]>([]);

  // Polling para verificar status dos downloads
  useEffect(() => {
    const interval = setInterval(async () => {
      const converting = downloads.filter(d => d.status === DownloadStatus.CONVERTING);
      
      for (const download of converting) {
        try {
          const response = await fetch(`${API_URL}/status/${download.id}`);
          if (response.ok) {
            const status: DownloadStatusResponse = await response.json();
            
            setDownloads(prev => prev.map(d => 
              d.id === download.id 
                ? { ...d, status: status.status, downloadUrl: status.downloadUrl }
                : d
            ));

            // Se o download estiver disponível, baixar automaticamente
            if (status.status === DownloadStatus.AVAILABLE && status.downloadUrl) {
              triggerDownload(status.downloadUrl, status.title || 'download');
            }
          }
        } catch (err) {
          console.error('Erro ao verificar status:', err);
        }
      }
    }, 2000); // Verifica a cada 2 segundos

    return () => clearInterval(interval);
  }, [downloads]);

  const triggerDownload = async (url: string, filename: string) => {
    try {
      // Faz o fetch do arquivo para forçar o download
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Cria uma URL temporária para o blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Cria um elemento de link e força o download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Limpa
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      // Fallback: tenta abrir em nova aba
      window.open(url, '_blank');
    }
  };

  const fetchMetadata = async () => {
    if (!url.trim()) {
      setError('Por favor, insira uma URL válida');
      return;
    }

    setLoading(true);
    setError('');
    setMetadata(null);

    try {
      const response = await fetch(`${API_URL}/videos/metadata`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar metadados');
      }

      const data: MetadataResponse = await response.json();
      setMetadata(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const downloadVideos = async (videos: VideoMetadata[]) => {
    try {
      const videoIds = videos.map(v => v.videoId);

      const response = await fetch(`${API_URL}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoIds,
          format,
          quality,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao iniciar download');
      }

      const data: CreateDownloadResponse = await response.json();
      
      // Adiciona os downloads à lista de progresso
      const newDownloads: DownloadProgress[] = data.ids.map((id, index) => ({
        id,
        videoId: videos[index].videoId,
        title: videos[index].title || 'Sem título',
        status: DownloadStatus.CONVERTING,
        downloadUrl: null,
      }));

      setDownloads(prev => [...prev, ...newDownloads]);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao iniciar download');
    }
  };

  const removeDownload = (id: string) => {
    setDownloads(prev => prev.filter(d => d.id !== id));
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: DownloadStatus) => {
    switch (status) {
      case DownloadStatus.CONVERTING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case DownloadStatus.AVAILABLE:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case DownloadStatus.CONVERSION_ERROR:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusText = (status: DownloadStatus) => {
    switch (status) {
      case DownloadStatus.CONVERTING:
        return '⏳ Convertendo...';
      case DownloadStatus.AVAILABLE:
        return '✅ Pronto';
      case DownloadStatus.CONVERSION_ERROR:
        return '❌ Erro';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <main className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            YouTube Downloader
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Baixe vídeos e áudios do YouTube facilmente
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchMetadata()}
              placeholder="Cole o link do YouTube aqui..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
            <button
              onClick={fetchMetadata}
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Downloads Progress Section */}
        {downloads.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Downloads ({downloads.length})
              </h2>
              <button
                onClick={() => setDownloads([])}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
              >
                Limpar tudo
              </button>
            </div>
            <div className="space-y-3">
              {downloads.map((download) => (
                <div
                  key={download.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {download.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(download.status)}`}>
                        {getStatusText(download.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {download.status === DownloadStatus.AVAILABLE && download.downloadUrl && (
                      <button
                        onClick={() => triggerDownload(download.downloadUrl!, download.title)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        ⬇️ Baixar
                      </button>
                    )}
                    <button
                      onClick={() => removeDownload(download.id)}
                      className="px-3 py-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Section */}
        {metadata && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configurações de Download
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Formato
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as DownloadFormat)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value={DownloadFormat.MP3}>MP3 (Áudio)</option>
                  <option value={DownloadFormat.MP4}>MP4 (Vídeo)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Qualidade: {quality}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Baixa</span>
                  <span>Alta</span>
                </div>
              </div>
            </div>
            
            {metadata.videos.length > 1 && (
              <button
                onClick={() => downloadVideos(metadata.videos)}
                className="mt-4 w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Baixar Todos ({metadata.videos.length} vídeos)
              </button>
            )}
          </div>
        )}

        {/* Videos Section */}
        {metadata && (
          <div className="space-y-4">
            {metadata.playlist && metadata.playlistTitle && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  📋 {metadata.playlistTitle}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {metadata.videos.length} vídeo(s)
                </p>
              </div>
            )}

            {metadata.videos.map((video) => (
              <div
                key={video.videoId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Thumbnail */}
                  <div className="sm:w-64 flex-shrink-0">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title || 'Video thumbnail'}
                        className="w-full h-48 sm:h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 sm:h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-400">Sem thumbnail</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {video.title || 'Título não disponível'}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {video.uploader && (
                        <div className="flex items-center gap-1">
                          <span>👤</span>
                          <span>{video.uploader}</span>
                        </div>
                      )}
                      {video.duration && (
                        <div className="flex items-center gap-1">
                          <span>⏱️</span>
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => downloadVideos([video])}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      ⬇️ Baixar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!metadata && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Cole um link do YouTube para começar
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
