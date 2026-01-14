(function () {
  const k = "MWJkMjhkZWU5NTMzYTBiMWVkMjkyNTQ5ZDgyNmY4OGI="
    .split("").reverse().join("");
  window.API_KEY = atob(k.split("").reverse().join(""));
})();

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";

let currentItem = null;

/* FETCH */
async function fetchJSON(url) {
  try {
    const r = await fetch(url);
    return r.ok ? r.json() : null;
  } catch {
    return null;
  }
}

/* TRENDING */
async function fetchTrending(type) {
  const d = await fetchJSON(`${BASE}/trending/${type}/week?api_key=${API_KEY}`);
  return d?.results || [];
}

async function fetchTrendingAnime() {
  const d = await fetchJSON(`${BASE}/trending/tv/week?api_key=${API_KEY}`);
  return d?.results.filter(
    i => i.original_language === "ja" && i.genre_ids.includes(16)
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
    el.appendChild(img);
  });
}

/* SEARCH NASA TAAS */
async function searchTMDB(q) {
  const section = document.getElementById("search-section");
  const el = document.getElementById("search-results");

  if (!q) {
    section.hidden = true;
    el.innerHTML = "";
    return;
  }

  const d = await fetchJSON(
    `${BASE}/search/multi?api_key=${API_KEY}&query=${q}`
  );

  el.innerHTML = "";
  section.hidden = false;
  section.scrollIntoView({ behavior: "smooth" });

  d?.results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement("img");
    img.src = IMG + item.poster_path;
    img.onclick = () => showDetails(item);
    el.appendChild(img);
  });
}

/* MODAL */
function showDetails(item) {
  currentItem = item;

  const modal = document.getElementById("modal");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  document.getElementById("modal-title").textContent =
    item.title || item.name;
  document.getElementById("modal-description").textContent =
    item.overview || "No description available.";
  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round(item.vote_average / 2));

  document.getElementById("info-wrapper").style.backgroundImage =
    `linear-gradient(rgba(0,0,0,.75),rgba(0,0,0,.75)),url(${IMG}${item.poster_path})`;

  changeServer();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
  document.body.style.overflow = "";
}

/* PLAYER */
function changeServer() {
  if (!currentItem) return;

  const isMovie = !!currentItem.title;
  const id = currentItem.id;

  const url = isMovie
    ? `https://zxcstream.xyz/embed/movie/${id}`
    : `https://zxcstream.xyz/embed/tv/${id}/1/1`;

  document.getElementById("modal-video").src = url;
}

/* INIT */
(async function init() {
  const movies = await fetchTrending("movie");
  const tv = await fetchTrending("tv");
  const anime = await fetchTrendingAnime();

  if (movies.length) displayBanner(movies[0]);
  displayList(movies, "movies-list");
  displayList(tv, "tvshows-list");
  displayList(anime, "anime-list");
})();
