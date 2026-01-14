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
  const res = await fetch(url);
  return res.ok ? res.json() : null;
}

async function fetchTrending(type) {
  const d = await fetchJSON(`${BASE}/trending/${type}/week?api_key=${API_KEY}`);
  return d?.results || [];
}

/* HERO SLIDER */
function startHero() {
  setInterval(() => {
    heroIndex = (heroIndex + 1) % heroItems.length;
    displayHero(heroItems[heroIndex]);
  }, 5000);
}

function displayHero(item) {
  const hero = document.getElementById("hero");
  hero.style.backgroundImage = `url(${IMG}${item.backdrop_path})`;
  document.getElementById("hero-title").textContent =
    item.title || item.name;
}

/* LIST */
function displayList(items, id) {
  const el = document.getElementById(id);
  el.innerHTML = "";

  items.forEach(i => {
    if (!i.poster_path) return;
    const img = document.createElement("img");
    img.src = IMG + i.poster_path;
    img.onclick = () => openModal(i);
    el.appendChild(img);
  });
}

/* MODAL */
function openModal(item) {
  currentItem = item;
  document.body.style.overflow = "hidden";

  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-title").textContent =
    item.title || item.name;
  document.getElementById("modal-description").textContent =
    item.overview || "";
  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round(item.vote_average / 2));

  document.getElementById("modal-bg").style.backgroundImage =
    `url(${IMG}${item.poster_path})`;

  document.getElementById("server").value = "embed";
  changeServer();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
  document.body.style.overflow = "";
}

/* PLAYER */
function changeServer() {
  const id = currentItem.id;
  const isMovie = !!currentItem.title;

  let url = isMovie
    ? `https://zxcstream.xyz/embed/movie/${id}`
    : `https://zxcstream.xyz/embed/tv/${id}/1/1`;

  document.getElementById("modal-video").src = url;
}

/* SEARCH */
async function searchTMDB() {
  const q = document.getElementById("search-input").value.trim();
  if (!q) return;

  const d = await fetchJSON(
    `${BASE}/search/multi?api_key=${API_KEY}&query=${q}`
  );

  if (d?.results?.length) openModal(d.results[0]);
}

/* INIT */
async function init() {
  const movies = await fetchTrending("movie");
  const tv = await fetchTrending("tv");

  heroItems = movies.slice(0, 5);
  displayHero(heroItems[0]);
  startHero();

  displayList(movies, "movies-list");
  displayList(tv, "tvshows-list");
  displayList(tv.filter(i => i.genre_ids?.includes(16)), "anime-list");
}

init();

