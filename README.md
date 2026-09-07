# Minha Videoteca

Uma videoteca pessoal no GitHub Pages. A forma simples de atualizá-la não exige API, chave do Google nem Worker.

## Como funciona

Os 18 vídeos atuais da playlist `MOTION` ficam em `playlists.js` como backup. A página tem o botão **↻ Atualizar**, que mostra um favorito de atualização.

1. Salve o favorito uma vez.
2. Abra a playlist pública no YouTube.
3. Clique no favorito.

Ele percorre a página do YouTube, coleta os vídeos atuais e abre sua videoteca atualizada **somente naquela aba**. Ao fechar a aba, a atualização temporária desaparece e o site volta ao backup fixo. Para playlists grandes, espere a página do YouTube carregar até o fim antes de usar o favorito.

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

## Atualização automática pela API (opcional)

Use esta alternativa somente se preferir atualização automática sem abrir o YouTube. Ela exige uma chave da API e o Worker Cloudflare.

1. No Google Cloud, crie uma chave com a **YouTube Data API v3** ativada.
2. No painel Cloudflare, abra **Workers & Pages → Create application → Worker**, dê um nome (por exemplo, `minha-videoteca-api`) e selecione **Deploy**.
3. Abra o Worker criado, clique em **Edit Code**, substitua todo o conteúdo pelo arquivo `worker/worker.js` deste projeto e clique em **Deploy**. Não envie a pasta nem procure um carregador de arquivos.
4. No Worker, abra **Settings → Variables and Secrets → Add** e crie:
   - `YOUTUBE_API_KEY`: tipo **Secret**, com a chave do Google.
   - `SITE_ORIGIN`: tipo **Text**, com a origem exata do GitHub Pages, por exemplo `https://seu-usuario.github.io` (sem barra final e sem o caminho do repositório).
   - `ALLOWED_PLAYLIST_IDS`: tipo **Text**, com `PLRQNkjQ891-sr3S-oJ1wMEgo3E5xcTCWD`.
5. Clique em **Deploy** e copie o endereço `https://NOME-DO-WORKER.SUA-CONTA.workers.dev` mostrado pelo Cloudflare. Não é necessário ter domínio próprio para isso.
6. Em `playlists.js`, troque a linha abaixo pelo endereço do Worker:

```js
window.VIDEOTECA_API_ENDPOINT = "https://api.seudominio.com";
```

7. Publique `playlists.js` no GitHub Pages.

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
