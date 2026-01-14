(function () {
  const k = "MWJkMjhkZWU5NTMzYTBiMWVkMjkyNTQ5ZDgyNmY4OGI="
    .split("").reverse().join("");
  window.API_KEY = atob(k.split("").reverse().join(""));
})();

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/original";
let currentItem = null;

/* FETCH */
async function fetchJSON(url) {
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}

async function fetchTrending(type) {
  const d = await fetchJSON(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  return d?.results || [];
}

async function fetchTrendingAnime() {
  const d = await fetchJSON(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
  return d?.results.filter(x => x.genre_ids?.includes(16)) || [];
}

/* UI */
function displayBanner(item) {
  if (!item?.backdrop_path) return;
  document.getElementById("banner").style.backgroundImage =
    `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById("banner-title").textContent =
    item.title || item.name;
}

function displayList(items, id) {
  const el = document.getElementById(id);
  el.innerHTML = "";

  items.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement("img");
    img.src = IMG_URL + item.poster_path;
    img.onclick = () => showDetails(item);
    el.appendChild(img);
  });
}

/* MODAL */
function showDetails(item) {
  currentItem = item;

  document.getElementById("modal-title").textContent =
    item.title || item.name;

  document.getElementById("modal-description").textContent =
    item.overview || "No description available.";

  document.getElementById("modal-image").src =
    IMG_URL + item.poster_path;

  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round((item.vote_average || 0) / 2));

  document.getElementById("player-container").style.display = "none";
  document.getElementById("modal-video").src = "";

  document.getElementById("modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
}

/* PLAYER */
function openPlayer() {
  document.getElementById("player-container").style.display = "block";
  changeServer();
}

function changeServer() {
  if (!currentItem) return;

  const server = document.getElementById("server").value;
  const isMovie = !!currentItem.title;

  let url = isMovie
    ? server === "player"
      ? `https://zxcstream.xyz/player/movie/${currentItem.id}/en`
      : `https://zxcstream.xyz/embed/movie/${currentItem.id}`
    : server === "player"
      ? `https://zxcstream.xyz/player/tv/${currentItem.id}/1/1/en`
      : `https://zxcstream.xyz/embed/tv/${currentItem.id}/1/1`;

  document.getElementById("modal-video").src = url;
}

/* INIT */
(async function () {
  const movies = await fetchTrending("movie");
  const tv = await fetchTrending("tv");
  const anime = await fetchTrendingAnime();

  if (movies.length) {
    displayBanner(movies[0]);
    displayList(movies, "movies-list");
  }

  displayList(tv, "tvshows-list");
  displayList(anime, "anime-list");
})();
