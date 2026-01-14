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

/* HERO */
function setHero(item) {
  const hero = document.getElementById("hero");
  hero.style.backgroundImage = `url(${IMG}${item.backdrop_path})`;
  document.getElementById("hero-title").textContent =
    item.title || item.name;
}

function startHero() {
  setInterval(() => {
    heroIndex = (heroIndex + 1) % heroItems.length;
    setHero(heroItems[heroIndex]);
  }, 5000);
}

/* LIST */
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
  const bg = document.getElementById("modal-bg");

  bg.style.backgroundImage = `url(${IMG}${item.poster_path})`;

  document.getElementById("modal-title").textContent =
    item.title || item.name;

  document.getElementById("modal-description").textContent =
    item.overview || "No description available.";

  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round(item.vote_average / 2));

  document.getElementById("server").value = "embed";
  changeServer();

  modal.style.display = "flex";
  document.body.classList.add("modal-open");
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
  document.body.classList.remove("modal-open");
}

/* PLAYER */
function changeServer() {
  if (!currentItem) return;

  const id = currentItem.id;
  const isMovie = !!currentItem.title;

  const url = isMovie
    ? `https://zxcstream.xyz/embed/movie/${id}`
    : `https://zxcstream.xyz/embed/tv/${id}/1/1`;

  document.getElementById("modal-video").src = url;
}

/* SEARCH */
async function runSearch() {
  const q = document.getElementById("search-input").value.trim();
  if (!q) return;

  const data = await fetchJSON(
    `${BASE}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}`
  );

  const results = data?.results || [];
  const section = document.getElementById("search-section");
  const list = document.getElementById("search-results");

  list.innerHTML = "";
  section.style.display = "block";

  results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement("img");
    img.src = IMG + item.poster_path;
    img.onclick = () => showDetails(item);
    list.appendChild(img);
  });

  window.scrollTo({ top: section.offsetTop - 80, behavior: "smooth" });
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

