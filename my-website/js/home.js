(function () {
  const k = "MWJkMjhkZWU5NTMzYTBiMWVkMjkyNTQ5ZDgyNmY4OGI="
    .split("").reverse().join("");
  window.API_KEY = atob(k.split("").reverse().join(""));
})();

/* ================= CONSTANTS ================= */
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/original";

let currentItem = null;

/* ================= FETCH ================= */
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    return res.ok ? res.json() : null;
  } catch {
    return null;
  }
}

async function fetchTrending(type) {
  const data = await fetchJSON(
    `${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`
  );
  return data?.results || [];
}

async function fetchTrendingAnime() {
  const data = await fetchJSON(
    `${BASE_URL}/trending/tv/week?api_key=${API_KEY}`
  );

  return (
    data?.results.filter(
      i => i.original_language === "ja" && i.genre_ids.includes(16)
    ) || []
  );
}

/* ================= BANNER ================= */
function displayBanner(item) {
  if (!item?.backdrop_path) return;

  const banner = document.getElementById("banner");
  banner.style.backgroundImage =
    `url(${IMG_URL}${item.backdrop_path})`;

  document.getElementById("banner-title").textContent =
    item.title || item.name;

  // CLICKABLE HERO
  banner.onclick = () => showDetails(item);
}

/* ================= LIST ================= */
function displayList(items, id) {
  const el = document.getElementById(id);
  el.innerHTML = "";

  items.forEach(item => {
    if (!item.poster_path) return;

    const img = document.createElement("img");
    img.src = IMG_URL + item.poster_path;
    img.alt = item.title || item.name;
    img.loading = "lazy";
    img.onclick = () => showDetails(item);

    el.appendChild(img);
  });
}

/* ================= MODAL ================= */
function showDetails(item) {
  currentItem = item;

  document.getElementById("modal-title").textContent =
    item.title || item.name;

  document.getElementById("modal-description").textContent =
    item.overview || "No description available.";

  document.getElementById("modal-image").src =
    IMG_URL + item.poster_path;

  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round(item.vote_average / 2));

  const modal = document.getElementById("modal");
  modal.style.display = "flex";

  // HD 2 default (embed)
  document.getElementById("server").value = "embed";

  setTimeout(changeServer, 100);
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";

  const iframe = document.getElementById("modal-video");
  iframe.src = "";
}

/* ================= PLAYER ================= */
function changeServer() {
  if (!currentItem) return;

  const server = document.getElementById("server").value;
  const id = currentItem.id;
  const isMovie = !!currentItem.title;

  let url = "";

  if (isMovie) {
    url =
      server === "embed"
        ? `https://zxcstream.xyz/embed/movie/${id}`
        : `https://zxcstream.xyz/player/movie/${id}/en?autoplay=false`;
  } else {
    url =
      server === "embed"
        ? `https://zxcstream.xyz/embed/tv/${id}/1/1`
        : `https://zxcstream.xyz/player/tv/${id}/1/1/en?autoplay=false`;
  }

  const iframe = document.getElementById("modal-video");
  iframe.src = "";
  setTimeout(() => (iframe.src = url), 50);
}

/* ================= INIT ================= */
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

