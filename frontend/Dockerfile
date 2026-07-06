FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Build da aplicação Next.js
RUN npm run build

# Stage de produção
FROM node:20-alpine

WORKDIR /app

# Copia node_modules e build do stage anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./next.config.ts

# Expõe a porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
