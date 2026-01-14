(function () {
  const k = "MWJkMjhkZWU5NTMzYTBiMWVkMjkyNTQ5ZDgyNmY4OGI="
    .split("").reverse().join("");
  window.API_KEY = atob(k.split("").reverse().join(""));
})();

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";

let currentItem = null;
let preloadIframe = null;
let preloadUrl = "";
let searchTimer = null;

/* FETCH */
const fetchJSON = url => fetch(url).then(r => r.ok ? r.json() : null);

const fetchTrending = type =>
  fetchJSON(`${BASE}/trending/${type}/week?api_key=${API_KEY}`)
    .then(d => d?.results || []);

async function fetchTrendingAnime() {
  const data = await fetchJSON(`${BASE}/trending/tv/week?api_key=${API_KEY}`);
  return data?.results.filter(i =>
    i.original_language === "ja" &&
    i.genre_ids?.includes(16)
  ) || [];
}

/* UI */
function displayBanner(item) {
  document.getElementById("banner").style.backgroundImage =
    `url(${IMG}${item.backdrop_path})`;
  document.getElementById("banner-title").textContent =
    item.title || item.name;
}

function displayList(items, id) {
  const el = document.getElementById(id);
  el.innerHTML = "";

  items.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement("img");
    img.src = IMG + item.poster_path;
    img.loading = "lazy";
    img.onclick = () => showDetails(item);
    img.onmouseenter = () => preloadPlayer(item);
    el.appendChild(img);
  });
}

/* PRELOAD */
function preloadPlayer(item) {
  preloadUrl = item.title
    ? `https://zxcstream.xyz/embed/movie/${item.id}`
    : `https://zxcstream.xyz/embed/tv/${item.id}/1/1`;

  preloadIframe = document.createElement("iframe");
  preloadIframe.src = preloadUrl;
  preloadIframe.style.display = "none";
  document.body.appendChild(preloadIframe);
}

/* MODAL */
function showDetails(item) {
  currentItem = item;
  document.body.style.overflow = "hidden";

  document.getElementById("modal").style.display = "flex";
  document.getElementById("info-bg").style.backgroundImage =
    `url(${IMG}${item.poster_path})`;

  document.getElementById("modal-title").textContent =
    item.title || item.name;

  document.getElementById("modal-description").textContent =
    item.overview || "No description.";

  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round(item.vote_average / 2));

  changeServer();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
  document.body.style.overflow = "";

  if (preloadIframe) {
    preloadIframe.remove();
    preloadIframe = null;
    preloadUrl = "";
  }
}

/* PLAYER */
function changeServer() {
  if (!currentItem) return;
  document.getElementById("modal-video").src = preloadUrl;
}

/* SEARCH */
function debouncedSearch(q) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => searchTMDB(q), 400);
}

async function searchTMDB(q) {
  if (!q) {
    document.getElementById("search-section").hidden = true;
    return;
  }

  const data = await fetchJSON(
    `${BASE}/search/multi?api_key=${API_KEY}&query=${q}`
  );

  const el = document.getElementById("search-results");
  el.innerHTML = "";
  document.getElementById("search-section").hidden = false;

  data?.results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement("img");
    img.src = IMG + item.poster_path;
    img.onclick = () => showDetails(item);
    el.appendChild(img);
  });
}

/* INIT */
async function init() {
  const movies = await fetchTrending("movie");
  const tv = await fetchTrending("tv");
  const anime = await fetchTrendingAnime();

  if (movies.length) displayBanner(movies[0]);
  displayList(movies, "movies-list");
  displayList(tv, "tvshows-list");
  displayList(anime, "anime-list");
}

init();
