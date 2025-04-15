import DetailStoryPresenter from "./detail-story-presenter";
import { showFormattedDate } from "../../utils/index";
import { parseActivePathname } from "../../routes/url-parser";

class DetailStoryPage {
  constructor() {
    this._presenter = new DetailStoryPresenter({
      view: this,
    });
  }

  async render() {
    return `
      <section class="detail-story-page">
        <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
        
        <div class="container">
          <div class="page-title">
            <h1>Detail Story</h1>
          </div>
          
          <div id="loading" class="loading-indicator">
            <p>Memuat story...</p>
          </div>
          
          <div id="error-container" class="error-container"></div>
          
          <div id="main-content" class="story-detail-container"></div>
          
          <div class="action-buttons">
            <a href="#/" class="button back-button">Kembali ke Beranda</a>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._storyDetailElement = document.getElementById("main-content");
    this._loadingElement = document.getElementById("loading");
    this._errorElement = document.getElementById("error-container");

    this._loadLeafletResources();

    this._defineInitializeMapFunction();

    const { id } = parseActivePathname();

    if (!id) {
      this.showError("ID story tidak ditemukan");
      return;
    }

    await this._presenter.getStory(id);
  }

  _loadLeafletResources() {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const leafletCSS = document.createElement("link");
      leafletCSS.rel = "stylesheet";
      leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(leafletCSS);
    }

    if (!window.L) {
      const leafletScript = document.createElement("script");
      leafletScript.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      document.head.appendChild(leafletScript);
    }
  }

  _defineInitializeMapFunction() {
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

      L.marker([lat, lon]).addTo(map).bindPopup("Lokasi Story").openPopup();

      setTimeout(() => {
        map.invalidateSize(true);
      }, 100);

      return map;
    };
  }

  showLoading() {
    this._loadingElement.style.display = "block";
  }

  hideLoading() {
    this._loadingElement.style.display = "none";
  }

  showError(message) {
    this._errorElement.innerHTML = `<p class="error-message">${message}</p>`;
    this._errorElement.style.display = "block";
  }

  showStory(story) {
    this._storyDetailElement.innerHTML = this._createStoryDetailTemplate(story);
  }

  _createStoryDetailTemplate(story) {
    return `
    <article class="story-detail">
      <div class="story-detail-header">
        <h2 class="story-detail-title">${story.name}</h2>
        <p class="story-detail-date">📅 ${showFormattedDate(
          story.createdAt
        )}</p>
      </div>
      
      <div class="story-detail-media">
        <img src="${story.photoUrl}" alt="Foto dari ${
      story.name
    }" class="story-detail-photo">
      </div>
      
      <div class="story-detail-body">
        <p class="story-detail-text">${story.description}</p>
        
        ${
          story.lat && story.lon
            ? `
          <div class="story-detail-location">
            <span>📍</span> Lokasi: Lat ${story.lat.toFixed(
              6
            )}, Lon ${story.lon.toFixed(6)}
          </div>
          
          <div class="map-container" style="margin-top: 20px; padding: 15px; background-color: #2d2d2d; border-radius: 8px;">
            <h2 style="margin-bottom: 12px; color: #7986cb;">Lokasi Story</h2>
            <div id="simple-map" style="width: 100%; height: 400px; border-radius: 8px; overflow: hidden;"></div>
            <button class="button" onclick="window.initializeMap('simple-map', ${
              story.lat
            }, ${
                story.lon
              })" style="margin-top: 10px; display: block; width: 100%;">
              Tampilkan Peta
            </button>
          </div>
        `
            : `
          <div class="story-detail-location">
            <span>ℹ️</span> Cerita ini tidak memiliki informasi lokasi
          </div>
        `
        }
      </div>
    </article>
  `;
  }
}

export default DetailStoryPage;
