FROM node:20-alpine AS builder

# Instala dependências necessárias para yt-dlp e ffmpeg
RUN apk add --no-cache python3 py3-pip ffmpeg

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Instala yt-dlp
RUN pip3 install --break-system-packages yt-dlp

# Stage de produção
FROM node:20-alpine

# Instala dependências de runtime
RUN apk add --no-cache python3 py3-pip ffmpeg postgresql-client bash

WORKDIR /app

# Copia node_modules e build do stage anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Copia migrations SQL
COPY --from=builder /app/sql ./sql

# Copia script de entrada
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Instala yt-dlp
RUN pip3 install --break-system-packages yt-dlp

# Cria diretório de downloads
RUN mkdir -p /app/downloads

# Expõe a porta
EXPOSE 3000

# Usa o script de entrada
ENTRYPOINT ["docker-entrypoint.sh"]
