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
  const res = await fetch(url);
  return res.ok ? res.json() : null;
}

async function fetchTrending(type) {
  const data = await fetchJSON(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  return data?.results || [];
}

async function fetchTrendingAnime() {
  const data = await fetchJSON(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
  return data?.results.filter(
    i => i.original_language === "ja" && i.genre_ids.includes(16)
  ) || [];
}

/* UI */
function displayBanner(item) {
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

  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-title").textContent =
    item.title || item.name;
  document.getElementById("modal-description").textContent =
    item.overview || "No description.";
  document.getElementById("modal-image").src =
    IMG_URL + item.poster_path;
  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round(item.vote_average / 2));

  document.getElementById("server").value = "embed"; // HD 2 default
  changeServer();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
}

/* PLAYER */
function changeServer() {
  if (!currentItem) return;

  const server = document.getElementById("server").value;
  const id = currentItem.id;
  const isMovie = !!currentItem.title;

  let url = "";

  if (isMovie) {
    url = server === "embed"
      ? `https://zxcstream.xyz/embed/movie/${id}`
      : `https://zxcstream.xyz/player/movie/${id}/en?autoplay=false`;
  } else {
    url = server === "embed"
      ? `https://zxcstream.xyz/embed/tv/${id}/1/1`
      : `https://zxcstream.xyz/player/tv/${id}/1/1/en?autoplay=false`;
  }

  document.getElementById("modal-video").src = url;
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
