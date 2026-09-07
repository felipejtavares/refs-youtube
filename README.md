# Minha Videoteca

Uma videoteca pessoal e estática para GitHub Pages. Não usa API, chave do Google, banco de dados ou servidor.

## Como funciona

Os vídeos da playlist `MOTION` já estão cadastrados em `playlists.js`, que contém os IDs, títulos e canais dos 18 vídeos. As capas vêm diretamente do CDN público de miniaturas do YouTube e o vídeo só é carregado quando você clica nele.

Como um site estático não pode obter, de modo confiável, a lista de vídeos de uma playlist do YouTube sem API, esta versão não se atualiza automaticamente quando você altera a playlist original no YouTube. Para atualizar a videoteca, edite `playlists.js` e publique de novo.

## Adicionar uma nova página em todos os dispositivos

No arquivo `playlists.js`, adicione outro objeto dentro de `DEFAULT_PLAYLISTS`:

```js
{
  id: "referencias-design",
  name: "Referências de design",
  description: "Vídeos para estudar",
  videos: [
    { id: "ID_DO_VIDEO", title: "Título", channel: "Canal" },
  ],
},
```

O ID é a parte depois de `v=` num link como `https://www.youtube.com/watch?v=ID_DO_VIDEO`. Essa página aparecerá no menu superior em todos os lugares onde você abrir o site.

O botão **+ Playlist** é um atalho para criar uma coleção somente no navegador atual: cole um link de vídeo por linha. Para levar essa coleção para outros dispositivos, acrescente-a ao arquivo e publique novamente.

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
