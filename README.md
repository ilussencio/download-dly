# YouTube Downloader 🎬

Aplicação full-stack para download de vídeos e áudios do YouTube com interface moderna e API REST.

## 🚀 Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **yt-dlp** - Download de vídeos

### Frontend
- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização

## 📋 Funcionalidades

- ✅ Buscar metadados de vídeos do YouTube
- ✅ Suporte para playlists
- ✅ Download em MP3 (áudio) ou MP4 (vídeo)
- ✅ Seleção de qualidade (0-10)
- ✅ Conversão em background
- ✅ Polling automático de status
- ✅ Download automático quando pronto
- ✅ Interface responsiva com modo escuro

## 🐳 Instalação com Docker

### Pré-requisitos
- Docker
- Docker Compose

### Iniciar aplicação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd youtube-download

# Inicie os serviços
docker compose up -d

# Verificar logs
docker compose logs -f
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **API Docs**: http://localhost:3000/docs

### Parar aplicação

```bash
docker compose down

# Para remover volumes também
docker compose down -v
```

## 💻 Desenvolvimento Local

### Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar PostgreSQL (ou usar Docker Compose)
docker compose up postgres -d

# Rodar migrations
npm run migration:run

# Iniciar em modo desenvolvimento
npm run start:dev
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local

# Iniciar em modo desenvolvimento
npm run dev
```

## 🔧 Variáveis de Ambiente

### Backend (.env)

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=app_user
DB_PASSWORD=app_password
DB_NAME=app_db

DOWNLOADS_DIR=downloads
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📡 API Endpoints

### Vídeos

- **POST** `/videos/metadata` - Buscar metadados de vídeo/playlist

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

### Downloads

- **POST** `/download` - Iniciar download

```json
{
  "videoIds": ["dQw4w9WgXcQ"],
  "format": "MP3",
  "quality": 5
}
```

- **GET** `/status/:id` - Verificar status do download

## 🔄 CI/CD

O projeto inclui GitHub Actions para:

- ✅ Build e testes automáticos
- ✅ Lint do código
- ✅ Build de imagens Docker
- ✅ Deploy automático (opcional)

## 📦 Estrutura do Projeto

```
youtube-download/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── download/    # Módulo de downloads
│   │   ├── videos/      # Módulo de vídeos
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/            # Interface Next.js
│   ├── app/
│   │   ├── page.tsx    # Página principal
│   │   └── types.ts    # Tipos TypeScript
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yaml
└── .github/
    └── workflows/      # GitHub Actions
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]
