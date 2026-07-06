#!/bin/bash

echo "🚀 Iniciando YouTube Downloader com Docker..."
echo ""

# Verifica se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Erro: Docker não está rodando!"
    echo "Por favor, inicie o Docker e tente novamente."
    exit 1
fi

# Para containers existentes (se houver)
echo "🛑 Parando containers existentes..."
docker compose down 2>/dev/null

# Inicia os containers
echo ""
echo "🔨 Fazendo build e iniciando os serviços..."
echo "⏳ Isso pode levar alguns minutos na primeira vez..."
echo ""

docker compose up -d --build

# Aguarda os serviços ficarem prontos
echo ""
echo "⏳ Aguardando serviços iniciarem..."
sleep 5

# Mostra o status
echo ""
echo "📊 Status dos containers:"
docker compose ps

# Instruções finais
echo ""
echo "✅ Aplicação iniciada com sucesso!"
echo ""
echo "🌐 Acesse a aplicação em:"
echo "   Frontend: http://localhost:3001"
echo "   Backend:  http://localhost:3000"
echo "   Swagger:  http://localhost:3000/docs"
echo ""
echo "📝 Para ver os logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Para parar:"
echo "   docker compose down"
echo ""
