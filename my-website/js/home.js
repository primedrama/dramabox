(function () {
  const k = "MWJkMjhkZWU5NTMzYTBiMWVkMjkyNTQ5ZDgyNmY4OGI="
    .split("")
    .reverse()
    .join("");
  window.API_KEY = atob(k.split("").reverse().join(""));
})();

/* ================= CONSTANTS ================= */
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";

let currentItem = null;

/* ================= FETCH ================= */
async function fetchJSON(url) {
  try {
    const r = await fetch(url);
    return r.ok ? r.json() : null;
  } catch {
    return null;
  }
}

async function fetchTrending(type) {
  const d = await fetchJSON(
    `${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`
  );
  return d?.results || [];
}

async function fetchTrailer(id, type) {
  const d = await fetchJSON(
    `${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`
  );
  if (!d) return null;
  const t = d.results.find(
    v => v.site === "YouTube" && v.type === "Trailer"
  );
  return t ? t.key : null;
}

/* ================= HERO ================= */
function displayHero(item) {
  document.getElementById("hero").style.backgroundImage =
    `url(${IMG + item.backdrop_path})`;
  document.getElementById("hero-title").textContent =
    item.title || item.name;
}

/* ================= LIST ================= */
function displayList(items, id) {
  const el = document.getElementById(id);
  el.innerHTML = "";

  items.forEach(i => {
    if (!i.poster_path) return;
    const img = document.createElement("img");
    img.src = IMG + i.poster_path;
    img.loading = "lazy";
    img.onclick = () => showDetails(i);
    el.appendChild(img);
  });
}

/* ================= SEARCH ================= */
async function searchTMDB(q) {
  const modal = document.getElementById("search-modal");
  if (!q) {
    modal.style.display = "none";
    return;
  }

  modal.style.display = "block";
  const d = await fetchJSON(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${q}`
  );

  const el = document.getElementById("search-results");
  el.innerHTML = "";

  for (const i of d.results) {
    if (!i.poster_path) continue;

    const type = i.media_type === "tv" ? "tv" : "movie";
    const key = await fetchTrailer(i.id, type);

    const box = document.createElement("div");
    box.className = "preview-box";
    box.innerHTML = `
      <img src="${IMG + i.poster_path}">
      ${
        key
          ? `<iframe
              src="https://www.youtube.com/embed/${key}?mute=1&controls=0&playsinline=1"
              loading="lazy"
            ></iframe>`
          : ""
      }
    `;

    box.onclick = () => {
      modal.style.display = "none";
      showDetails(i);
    };

    el.appendChild(box);
  }
}

/* ================= MODAL ================= */
function showDetails(i) {
  currentItem = i;
  document.body.style.overflow = "hidden";

  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-title").textContent =
    i.title || i.name;
  document.getElementById("modal-description").textContent =
    i.overview || "";
  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round(i.vote_average / 2));

  changeServer();
}

function closeModal() {
  document.body.style.overflow = "";
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-video").src = "";
}

/* ================= PLAYER ================= */
function changeServer() {
  if (!currentItem) return;

  const id = currentItem.id;
  const movie = !!currentItem.title;

  const url = movie
    ? `https://zxcstream.xyz/embed/movie/${id}`
    : `https://zxcstream.xyz/embed/tv/${id}/1/1`;

  document.getElementById("modal-video").src = url;
}

/* ================= INIT ================= */
(async function init() {
  const movies = await fetchTrending("movie");
  const tv = await fetchTrending("tv");
  const anime = await fetchTrending("tv");

  if (movies.length) displayHero(movies[0]);
  displayList(movies, "movies-list");
  displayList(tv, "tvshows-list");
  displayList(anime, "anime-list");
})();


