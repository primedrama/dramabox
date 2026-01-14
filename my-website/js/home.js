(function () {
  const k = "MWJkMjhkZWU5NTMzYTBiMWVkMjkyNTQ5ZDgyNmY4OGI="
    .split("").reverse().join("");
  window.API_KEY = atob(k.split("").reverse().join(""));
})();

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";

let currentItem = null;
let heroItems = [];
let heroIndex = 0;

/* FETCH */
async function fetchJSON(url) {
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}

async function fetchTrending(type) {
  const d = await fetchJSON(`${BASE}/trending/${type}/week?api_key=${API_KEY}`);
  return d?.results || [];
}

/* HERO AUTO SWIPE */
function startHero() {
  if (!heroItems.length) return;
  setInterval(() => {
    heroIndex = (heroIndex + 1) % heroItems.length;
    setHero(heroItems[heroIndex]);
  }, 5000);
}

function setHero(item) {
  const hero = document.getElementById("hero");
  hero.style.backgroundImage = `url(${IMG}${item.backdrop_path})`;
  document.getElementById("hero-title").textContent =
    item.title || item.name;
}

/* UI */
function displayList(items, id) {
  const el = document.getElementById(id);
  el.innerHTML = "";

  items.forEach(item => {
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
  const content = document.querySelector(".modal-content");

  content.style.backgroundImage =
    `url(${IMG}${item.backdrop_path || item.poster_path})`;

  document.getElementById("modal-title").textContent =
    item.title || item.name;

  document.getElementById("modal-description").textContent =
    item.overview || "No description available.";

  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round(item.vote_average / 2));

  document.getElementById("server").value = "embed";
  changeServer();

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
}

/* PLAYER */
function changeServer() {
  if (!currentItem) return;

  const id = currentItem.id;
  const isMovie = !!currentItem.title;

  let url = isMovie
    ? `https://zxcstream.xyz/embed/movie/${id}`
    : `https://zxcstream.xyz/embed/tv/${id}/1/1`;

  document.getElementById("modal-video").src = url;
}

/* SEARCH */
async function searchTMDB(e) {
  if (e.key !== "Enter") return;

  const q = e.target.value.trim();
  if (!q) return;

  const d = await fetchJSON(
    `${BASE}/search/multi?api_key=${API_KEY}&query=${q}`
  );

  if (d?.results?.length) showDetails(d.results[0]);
}

/* INIT */
(async function init() {
  const movies = await fetchTrending("movie");
  const tv = await fetchTrending("tv");
  const anime = await fetchTrending("tv");

  heroItems = movies.slice(0, 5);
  setHero(heroItems[0]);
  startHero();

  displayList(movies, "movies-list");
  displayList(tv, "tvshows-list");
  displayList(
    anime.filter(a => a.original_language === "ja"),
    "anime-list"
  );
})();
