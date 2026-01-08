(function () {
  const k = "MWJkMjhkZWU5NTMzYTBiMWVkMjkyNTQ5ZDgyNmY4OGI="
    .split("").reverse().join("");
  window.API_KEY = atob(k.split("").reverse().join(""));
})();

/* ================= CONSTANTS ================= */
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/original";

let currentItem = null;

/* ================= FORCE SERVER NAME ================= */
document.addEventListener("DOMContentLoaded", () => {
  const server = document.getElementById("server");
  if (server && server.options.length >= 2) {
    server.options[0].text = "Server 1";
    server.options[1].text = "Server 2";
  }
});

/* ================= FETCH ================= */
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    return await res.json();
  } catch (e) {
    console.error(e);
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
  let results = [];
  for (let page = 1; page <= 3; page++) {
    const data = await fetchJSON(
      `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`
    );
    if (!data) continue;

    const anime = data.results.filter(
      i => i.original_language === "ja" && i.genre_ids.includes(16)
    );
    results.push(...anime);
  }
  return results;
}

/* ================= UI ================= */
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
    img.src = `${IMG_URL}${item.poster_path}`;
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
    `${IMG_URL}${item.poster_path}`;

  document.getElementById("modal-rating").innerHTML =
    "★".repeat(Math.round(item.vote_average / 2));

  changeServer();

  const modal = document.getElementById("modal");
  modal.style.display = "flex";
  modal.style.opacity = 0;

  setTimeout(() => modal.style.opacity = 1, 10);
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.opacity = 0;

  setTimeout(() => {
    modal.style.display = "none";
    document.getElementById("modal-video").src = "";
  }, 200);
}

/* ================= PLAYER ================= */
function changeServer() {
  if (!currentItem) return;

  const server = document.getElementById("server").value;

  const isMovie = !!currentItem.title;
  const tmdbId = currentItem.id;

  const season = 1;
  const episode = 1;
  const language = "en";

  let url = "";

  if (isMovie) {
    url =
      server === "player"
        ? `https://zxcstream.xyz/player/movie/${tmdbId}/${language}?autoplay=false&back=true&server=0`
        : `https://zxcstream.xyz/embed/movie/${tmdbId}`;
  } else {
    url =
      server === "player"
        ? `https://zxcstream.xyz/player/tv/${tmdbId}/${season}/${episode}/${language}?autoplay=false&back=true&server=0`
        : `https://zxcstream.xyz/embed/tv/${tmdbId}/${season}/${episode}`;
  }

  document.getElementById("modal-video").src = url;
}

/* ================= SEARCH ================= */
function openSearchModal() {
  document.getElementById("search-modal").style.display = "flex";
  document.getElementById("search-input").focus();
}

function closeSearchModal() {
  document.getElementById("search-modal").style.display = "none";
  document.getElementById("search-results").innerHTML = "";
}

async function searchTMDB() {
  const q = document.getElementById("search-input").value.trim();
  if (!q) return;

  const data = await fetchJSON(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${q}`
  );

  const el = document.getElementById("search-results");
  el.innerHTML = "";

  data?.results.forEach(item => {
    if (!item.poster_path) return;

    const img = document.createElement("img");
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name;
    img.onclick = () => {
      closeSearchModal();
      showDetails(item);
    };
    el.appendChild(img);
  });
}

/* ================= INIT ================= */
async function init() {
  const movies = await fetchTrending("movie");
  const tv = await fetchTrending("tv");
  const anime = await fetchTrendingAnime();

  if (movies.length) {
    displayBanner(movies[Math.floor(Math.random() * movies.length)]);
    displayList(movies, "movies-list");
  }

  displayList(tv, "tvshows-list");
  displayList(anime, "anime-list");
}

init();
