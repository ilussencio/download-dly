API de download de videos do youtube

[x] - conectar com o banco de dados postgress
    usuario: app_user
    senha: app_password
    dadtabase: app_db

[x] - criar arquivos sql para criação das tabelas

[x] - criar endpoint para /download, onde ele vai fazer o download do video .mp4 ou audio .mp3
    campos obrigatorios:
        URL do video:
        e formato (mp3 ou mp4)
    
    campos opcionais:
        qualidade de 0 (menor qualidade) a 10 (maior qualidade)

    retornar o id do download

    utilizar o youtube-dl-exec para executar o donwload (consulte a documentação)

[x] - get /status/:id
    verifica o status de um arquivo e recupera seu url de download, se disponivel:
    status retornados:
        - CONVERTING
        - AVAILABLE (caso disponivel enviar a url)
        - CONVERSION_ERROR

{
    "id": "0cbd1a95-4259-40c2-8b05-7dca250ce6d3",
    "downloadUrl": "http://localhost/0cbd1a95-4259-40c2-8b05-7dca250ce6d3.mp3",
    "status": "AVAILABLE",
    "format": "MP3",
    "title": "Artist - Song Name | Medium",
    "quality": 0,
    "retry": 0,
    "callbackUrl": "https://your-callback-url.com/notify"
}