# YouTube Downloader - Docker Setup

## 🚀 Como Usar

### Pré-requisitos

- Docker (versão 20.10 ou superior)
- Docker Compose (versão 2.0 ou superior)

### Iniciar a aplicação completa

```bash
docker compose up -d
```

Este comando irá:
1. ✅ Criar e iniciar o banco de dados PostgreSQL
2. ✅ Executar as migrations SQL automaticamente
3. ✅ Fazer o build e iniciar o backend (NestJS + yt-dlp + ffmpeg)
4. ✅ Fazer o build e iniciar o frontend (Next.js)

**Aguarde cerca de 2-3 minutos para o build completo na primeira execução.**

### Verificar o status dos containers

```bash
docker compose ps
```

Todos os containers devem estar com status "Up" e "healthy":
```
NAME                 STATUS                   PORTS
youtube_backend      Up (healthy)             0.0.0.0:3000->3000/tcp
youtube_frontend     Up                       0.0.0.0:3001->3000/tcp
youtube_postgres     Up (healthy)             0.0.0.0:5432->5432/tcp
```

### Ver os logs

```bash
# Todos os serviços
docker compose logs -f

# Apenas backend
docker compose logs -f backend

# Apenas frontend
docker compose logs -f frontend

# Apenas postgres
docker compose logs -f postgres
```

### Parar a aplicação

```bash
docker compose down
```

### Parar e remover volumes (⚠️ limpa banco de dados e downloads)

```bash
docker compose down -v
```

### Rebuild após mudanças no código

```bash
# Rebuild e reiniciar
docker compose up -d --build

# Rebuild apenas um serviço
docker compose up -d --build backend
docker compose up -d --build frontend
```

### Remover tudo e começar do zero

```bash
docker compose down -v --rmi all
docker compose up -d --build
```

## 🔗 Acessos

Após iniciar os containers:

- **Frontend (Interface)**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs (Swagger)**: http://localhost:3000/docs
- **PostgreSQL**: localhost:5432

## 📂 Estrutura

```
youtube-download/
├── docker-compose.yaml          # Orquestração dos containers
├── .env.production             # Variáveis de ambiente
├── backend/
│   ├── Dockerfile              # Build do backend
│   ├── docker-entrypoint.sh    # Script de inicialização + migrations
│   ├── .dockerignore           # Arquivos ignorados no build
│   └── sql/                    # Migrations SQL (executadas automaticamente)
└── frontend/
    ├── Dockerfile              # Build do frontend
    └── .dockerignore           # Arquivos ignorados no build
```

## 🔧 Configurações

### Portas

| Serviço   | Porta Interna | Porta Host |
|-----------|---------------|------------|
| Backend   | 3000          | 3000       |
| Frontend  | 3000          | 3001       |
| PostgreSQL| 5432          | 5432       |

### Volumes Persistentes

- `postgres_data`: Dados do banco de dados PostgreSQL
- `backend_downloads`: Arquivos convertidos (MP3/MP4)

### Network

Todos os serviços estão na mesma rede `youtube-network` para comunicação interna.

## 🛠️ Troubleshooting

### Backend não inicia

```bash
# Verifique os logs
docker compose logs backend

# Verifique se o PostgreSQL está healthy
docker compose ps postgres
```

### Frontend não consegue conectar ao backend

Verifique se a variável `NEXT_PUBLIC_API_URL` está correta:
```bash
docker compose exec frontend env | grep NEXT_PUBLIC_API_URL
```

### Migrations SQL não executadas

```bash
# Entre no container do backend
docker compose exec backend sh

# Execute manualmente
cd /app/sql
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 001_create_downloads_table.sql
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 002_add_video_id_to_downloads.sql
```

### Limpar cache do Docker

```bash
docker system prune -a --volumes
```

## 📝 Notas

- Na primeira execução, o build pode levar alguns minutos devido ao download das dependências e instalação do yt-dlp e ffmpeg
- O backend aguarda automaticamente o PostgreSQL estar pronto antes de iniciar
- As migrations SQL são executadas automaticamente na inicialização do backend
- Os downloads ficam persistidos no volume `backend_downloads`

