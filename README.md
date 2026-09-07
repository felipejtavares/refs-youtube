# Minha Videoteca

Uma videoteca pessoal no GitHub Pages, com atualização automática de playlists via Cloudflare Worker.

## Como funciona

Os 18 vídeos atuais da playlist `MOTION` ficam em `playlists.js` como backup. Quando o Worker está configurado, ele busca a playlist pública no YouTube e a grade é atualizada automaticamente. A chave da API nunca vai para o GitHub nem para o navegador.

O Worker guarda cada resultado por seis horas no cache do Cloudflare. Assim, as visitas repetidas não consomem a quota da API e as alterações no YouTube aparecem em até seis horas.

## Adicionar uma nova página em todos os dispositivos

No arquivo `playlists.js`, adicione outro objeto dentro de `DEFAULT_PLAYLISTS`:

```js
{
  id: "referencias-design",
  youtubePlaylistId: "ID_DA_PLAYLIST_DO_YOUTUBE",
  name: "Referências de design",
  description: "Vídeos para estudar",
  videos: [
    { id: "ID_DO_VIDEO", title: "Título", channel: "Canal" },
  ],
},
```

O ID é a parte depois de `v=` num link como `https://www.youtube.com/watch?v=ID_DO_VIDEO`. Essa página aparecerá no menu superior em todos os lugares onde você abrir o site.

Para que uma nova página também seja atualizada automaticamente, acrescente `youtubePlaylistId: "ID_DA_PLAYLIST"` ao objeto. O botão **+ Playlist** cria uma coleção somente no navegador atual: cole um link de vídeo por linha.

## Configurar atualização automática

1. No Google Cloud, crie uma chave com a **YouTube Data API v3** ativada.
2. No painel Cloudflare, crie um Worker usando os arquivos da pasta `worker/`.
3. Em **Worker → Settings → Variables and Secrets**, adicione o segredo `YOUTUBE_API_KEY` com a chave criada no Google. Não use variável de texto simples.
4. Em `worker/wrangler.toml`, substitua `SITE_ORIGIN` pela URL exata do seu site publicado. Depois publique o Worker em um subdomínio, por exemplo `https://api.seudominio.com`.
5. Em `playlists.js`, troque a linha abaixo pelo endereço do Worker:

```js
window.VIDEOTECA_API_ENDPOINT = "https://api.seudominio.com";
```

6. Publique `playlists.js` no GitHub Pages.

Sem esse endereço, o site continua funcionando com a lista fixa de backup.

## Publicar gratuitamente

1. Crie um repositório público no GitHub e envie os arquivos desta pasta para a branch `main`.
2. Abra **Settings → Pages** e selecione **Deploy from a branch**, `main` e `/(root)`.
3. Use a URL `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/` que o GitHub informar.

## Domínio próprio no Cloudflare

1. Adicione seu domínio ao Cloudflare e deixe o DNS gerenciado por ele.
2. Em GitHub → **Settings → Pages**, configure seu domínio em **Custom domain**.
3. Para `www`, crie no Cloudflare um `CNAME` apontando para `SEU-USUARIO.github.io`.
4. Se for usar o domínio raiz, use os registros `A` que o GitHub Pages indicar. Durante a validação e emissão do certificado, deixe os registros como **DNS only**.

Depois de o GitHub concluir o HTTPS, você pode usar o proxy do Cloudflare se quiser.
