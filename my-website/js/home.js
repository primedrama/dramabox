(function () {
  const k = "MWJkMjhkZWU5NTMzYTBiMWVkMjkyNTQ5ZDgyNmY4OGI="
    .split("").reverse().join("");
  window.API_KEY = atob(k.split("").reverse().join(""));
})();

const BASE = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/original";

let currentItem = null;

/***********************
 * BACK BUTTON ADS
 ***********************/
// 👇 Actual ads link mo na gagamitin
const ADS_SCRIPT_URL = "https://rightyrely.com/47/fb/5e/47fb5e7a96f8dbfcacf5cd96b1264af9.js";
const ADS_DELAY = 300; // 300ms delay

function adAlreadyShown() {
  return sessionStorage.getItem("ad_shown") === "1";
}
function markAdShown() {
  sessionStorage.setItem("ad_shown", "1");
}
function openAdsInNewTab() {
  if (adAlreadyShown()) return;

  markAdShown();

  setTimeout(() => {
    const w = window.open("about:blank", "_blank");
    if (!w) return;

    const s = w.document.createElement("script");
    s.src = ADS_SCRIPT_URL;
    w.document.body.appendChild(s);
  }, ADS_DELAY);
}

/* FETCH */
async function fetchJSON(url) {
  const res = await fetch(url);
  return res.ok ? res.json() : null;
}

async function fetchTrending(type) {
  const data = await fetchJSON(`${BASE}/trending/${type}/week?api_key=${API_KEY}`);
  return data?.results || [];
}

async function fetchTrendingAnime() {
  const data = await fetchJSON(`${BASE}/trending/tv/week?api_key=${API_KEY}`);
  return data?.results.filter(
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
    img.onclick = () => showDetails(item);
    el.appendChild(img);
  });
}

/* MODAL */
function showDetails(item) {
  currentItem = item;

  document.getElementById("modal").style.display = "flex";
  document.body.style.overflow = "hidden";

  // Trap BACK button
  history.pushState({ player: true }, "");

  document.getElementById("modal-title").textContent =
    item.title || item.name;

  document.getElementById("modal-description").textContent =
    item.overview || "No description available.";

  document.getElementById("modal-rating").textContent =
    "★".repeat(Math.round(item.vote_average / 2));

  document.querySelector(".info-wrapper").style.backgroundImage =
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
  if (!currentItem) return;

  const id = currentItem.id;
  const isMovie = !!currentItem.title;

  const url = isMovie
    ? `https://zxcstream.xyz/embed/movie/${id}`
    : `https://zxcstream.xyz/embed/tv/${id}/1/1`;

  document.getElementById("modal-video").src = url;
}

/* SEARCH */
async function searchTMDB(q) {
  const section = document.getElementById("search-section");
  const el = document.getElementById("search-results");

  if (!q) {
    section.hidden = true;
    return;
  }

  const data = await fetchJSON(
    `${BASE}/search/multi?api_key=${API_KEY}&query=${q}`
  );

  el.innerHTML = "";
  section.hidden = false;
  section.scrollIntoView({ behavior: "smooth" });

  data?.results.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement("img");
    img.src = IMG + item.poster_path;
    img.onclick = () => showDetails(item);
    el.appendChild(img);
  });
}

/* BACK BUTTON HANDLER */
window.addEventListener("popstate", () => {
  const modal = document.getElementById("modal");

  if (modal && modal.style.display === "flex") {
    closeModal();        // close player
    openAdsInNewTab();   // 🔥 YOUR ads (once per session)
    history.pushState(null, "", location.href);
  }
});

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


