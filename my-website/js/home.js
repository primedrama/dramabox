(function () {
  const k = "MWJkMjhkZWU5NTMzYTBiMWVkMjkyNTQ5ZDgyNmY4OGI="
    .split("").reverse().join("");
  window.API_KEY = atob(k.split("").reverse().join(""));
})();

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/original";

let currentItem = null;
let heroItems = [];
let heroIndex = 0;

/* FETCH */
async function fetchJSON(url) {
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}

async function fetchTrending(type) {
  const d = await fetchJSON(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
  return d?.results || [];
}

/* HERO AUTO SLIDE */
function updateHero() {
  if (!heroItems.length) return;
  const item = heroItems[heroIndex];
  document.getElementById("hero").style.backgroundImage =
    `url(${IMG_URL}${item.backdrop_path})`;
  document.getElementById("hero-title").textContent =
    item.title || item.name;
  heroIndex = (heroIndex + 1) % heroItems.length;
}

/* LIST */
function displayList(items, id) {
  const el = document.getElementById(id);
  el.innerHTML = "";

  items.forEach(item => {
    if (!item.poster_path) return;

    const card = document.createElement("div");
    card.className = "preview-card";

    const img = document.createElement("img");
    img.src = IMG_URL + item.poster_path;
    img.onclick = () => showDetails(item);
    card.appendChild(img);

    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    fetch(`${BASE_URL}/${item.title ? "movie" : "tv"}/${item.id}/videos?api_key=${API_KEY}`)
      .then(r => r.json())
      .then(d => {
        const t = d.results?.find(v => v.site === "YouTube");
        if (!t) return;
        video.src = `https://www.youtube.com/watch?v=${t.key}`;
      });

    card.onmouseenter = () => video.play();
    card.onmouseleave = () => {
      video.pause();
      video.currentTime = 0;
    };

    card.appendChild(video);
    el.appendChild(card);
  });
}

/* MODAL */
function showDetails(item) {
  currentItem = item;
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-title").textContent =
    item.title || item.name;
  document.getElementById("modal-description").textContent =
    item.overview || "";
  document.getElementById("modal-image").src =
    IMG_URL + item.poster_path;
  changeServer();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
}

function changeServer() {
  if (!currentItem) return;
  const id = currentItem.id;
  const isMovie = !!currentItem.title;
  document.getElementById("modal-video").src =
    isMovie
      ? `https://zxcstream.xyz/embed/movie/${id}`
      : `https://zxcstream.xyz/embed/tv/${id}/1/1`;
}

/* SEARCH */
async function searchTMDB(q) {
  if (!q) return init();
  const d = await fetchJSON(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${q}`
  );
  displayList(d.results || [], "movies-list");
}

/* INIT */
async function init() {
  const movies = await fetchTrending("movie");
  const tv = await fetchTrending("tv");
  const anime = await fetchTrending("tv");

  heroItems = movies.filter(m => m.backdrop_path).slice(0, 5);
  updateHero();
  setInterval(updateHero, 5000);

  displayList(movies, "movies-list");
  displayList(tv, "tvshows-list");
  displayList(anime.filter(a => a.genre_ids.includes(16)), "anime-list");
}

init();

