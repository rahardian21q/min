import "./styles/styles.css";
import "leaflet/dist/leaflet.css";
import App from "./scripts/pages/app";

window.initializeMap = function (containerId, lat, lon) {
  if (!window.L) {
    console.error("Leaflet belum dimuat!");
    return;
  }

  const mapElement = document.getElementById(containerId);
  if (!mapElement) {
    console.error("Map container tidak ditemukan:", containerId);
    return;
  }

  const map = L.map(mapElement).setView([lat, lon], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  L.marker([lat, lon]).addTo(map);

  setTimeout(() => {
    map.invalidateSize(true);
  }, 100);

  return map;
};

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
