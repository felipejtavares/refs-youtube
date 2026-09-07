const STORAGE = { playlists: "videoteca:playlists", theme: "videoteca:theme" };
const defaultPlaylists = window.DEFAULT_PLAYLISTS || [];
const state = { playlists: loadPlaylists(), current: null };
const $ = (selector) => document.querySelector(selector);
const elements = {
  nav: $("#playlist-nav"), title: $("#page-title"), description: $("#playlist-description"),
  count: $("#video-count"), grid: $("#video-grid"), playlistDialog: $("#playlist-dialog"), theme: $("#theme-button"),
};

function loadPlaylists() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE.playlists));
    return Array.isArray(saved) && saved.length ? [...defaultPlaylists, ...saved] : defaultPlaylists;
  } catch { return defaultPlaylists; }
}

function saveExtraPlaylist(playlist) {
  const custom = state.playlists.filter((item) => !defaultPlaylists.some((base) => base.id === item.id));
  custom.push(playlist);
  localStorage.setItem(STORAGE.playlists, JSON.stringify(custom));
}

function videoIdFromUrl(value) {
  try {
    const url = new URL(value.trim());
    if (url.hostname === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (url.hostname.endsWith("youtube.com")) return url.searchParams.get("v") || (url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : null);
  } catch { /* link inválido */ }
  return null;
}

function normalizeVideo(video) {
  const id = typeof video === "string" ? videoIdFromUrl(video) || video : video.id;
  return {
    id,
    title: typeof video === "string" ? "Vídeo do YouTube" : (video.title || "Vídeo do YouTube"),
    channel: typeof video === "string" ? "YouTube" : (video.channel || "YouTube"),
    thumbnail: `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`,
  };
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE.theme, theme);
  elements.theme.textContent = theme === "dark" ? "☀" : "☾";
  elements.theme.setAttribute("aria-label", theme === "dark" ? "Usar tema claro" : "Usar tema escuro");
}

function renderNav() {
  elements.nav.replaceChildren();
  state.playlists.forEach((playlist) => {
    const link = document.createElement("a");
    link.href = `?page=${encodeURIComponent(playlist.id)}`;
    link.textContent = playlist.name;
    link.className = playlist.id === state.current?.id ? "active" : "";
    link.setAttribute("aria-current", playlist.id === state.current?.id ? "page" : "false");
    elements.nav.append(link);
  });
}

function playerUrl(videoId) {
  const params = new URLSearchParams({ rel: "0", modestbranding: "1", enablejsapi: "1" });
  if (location.origin && location.origin !== "null") params.set("origin", location.origin);
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params}`;
}

async function fetchPlaylistFromWorker(playlist) {
  const endpoint = (window.VIDEOTECA_API_ENDPOINT || "").replace(/\/$/, "");
  if (!endpoint || !playlist.youtubePlaylistId) return null;
  const response = await fetch(`${endpoint}/playlist/${encodeURIComponent(playlist.youtubePlaylistId)}`);
  const data = await response.json();
  if (!response.ok || !Array.isArray(data.items)) throw new Error(data.error || "Não foi possível atualizar a playlist.");
  return data.items.map(normalizeVideo);
}

function renderVideos(videos) {
  elements.grid.replaceChildren();
  const template = $("#video-card-template");
  videos.forEach((video) => {
    const card = template.content.cloneNode(true);
    const title = card.querySelector(".video-title");
    const player = card.querySelector(".inline-player");
    player.src = playerUrl(video.id);
    player.title = video.title;
    title.textContent = video.title;
    card.querySelector(".channel-name").textContent = video.channel;
    const external = card.querySelector(".open-video");
    external.href = `https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}`;
    elements.grid.append(card);
  });
}

async function openPlaylist(playlist) {
  state.current = playlist;
  let videos = (playlist.videos || []).map(normalizeVideo);
  document.title = `${playlist.name} · Minha Videoteca`;
  elements.title.textContent = playlist.name;
  elements.description.textContent = playlist.description || "";
  elements.count.textContent = `${videos.length} ${videos.length === 1 ? "vídeo" : "vídeos"}`;
  renderNav();
  renderVideos(videos);
  if (!window.VIDEOTECA_API_ENDPOINT || !playlist.youtubePlaylistId) return;

  elements.count.textContent = "Atualizando playlist…";
  try {
    const updatedVideos = await fetchPlaylistFromWorker(playlist);
    if (!updatedVideos || state.current?.id !== playlist.id) return;
    videos = updatedVideos;
    renderVideos(videos);
    elements.count.textContent = `${videos.length} ${videos.length === 1 ? "vídeo" : "vídeos"}`;
  } catch (error) {
    if (state.current?.id === playlist.id) {
      elements.count.textContent = `${videos.length} vídeos · backup local`;
      console.warn("Não foi possível atualizar a playlist:", error.message);
    }
  }
}

function chooseInitialPlaylist() {
  const requested = new URLSearchParams(location.search).get("page");
  return state.playlists.find((playlist) => playlist.id === requested) || state.playlists[0];
}

$("#theme-button").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
$("#add-playlist-button").addEventListener("click", () => elements.playlistDialog.showModal());
$("#playlist-form").addEventListener("submit", (event) => {
  if (event.submitter?.value !== "save") return;
  const name = $("#playlist-name").value.trim();
  const links = $("#video-links").value.split("\n").map((link) => link.trim()).filter(Boolean);
  const videos = links.map(videoIdFromUrl).filter(Boolean).map((id) => ({ id }));
  if (!videos.length || videos.length !== links.length) {
    event.preventDefault();
    $("#video-links").setCustomValidity("Cole um link válido do YouTube em cada linha.");
    $("#video-links").reportValidity();
    return;
  }
  const id = `local-${Date.now()}`;
  const playlist = { id, name, description: "Coleção adicionada neste navegador", videos };
  state.playlists.push(playlist);
  saveExtraPlaylist(playlist);
  elements.playlistDialog.close();
  location.href = `?page=${encodeURIComponent(id)}`;
});
$("#video-links").addEventListener("input", (event) => event.target.setCustomValidity(""));

setTheme(localStorage.getItem(STORAGE.theme) || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
openPlaylist(chooseInitialPlaylist());
