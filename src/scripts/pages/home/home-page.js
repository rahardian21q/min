import HomePresenter from "./home-presenter";
import { showFormattedDate } from "../../utils/index";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function isUserLoggedIn() {
  return localStorage.getItem("authToken") !== null;
}

class HomePage {
  constructor() {
    this._presenter = new HomePresenter({
      view: this,
    });
  }

  async render() {
    return `
      <section class="home-page">
        <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
        
        <div class="container" style="max-width: 800px; padding: 0;">
          <div class="page-title">
            <h1>Dicoding Story</h1>
          </div>
          
          ${
            !isUserLoggedIn()
              ? this._createWelcomeSectionTemplate()
              : `
          <div id="loading" class="loading-indicator">
            <p>Memuat stories...</p>
          </div>
          
          <div id="error-container" class="error-container"></div>
          
          <div id="main-content" class="story-feed"></div>
          
          <div id="map-container" class="map-container">
            <h2>Lokasi Stories</h2>
            <div id="map" class="map"></div>
          </div>
          `
          }
        </div>
      </section>
    `;
  }

  _createWelcomeSectionTemplate() {
    return `
      <div class="welcome-section">
        <div class="welcome-header">
          <h2 class="welcome-title">Selamat Datang di Dicoding Story</h2>
          <p class="welcome-description">Platform berbagi cerita dan pengalaman bersama komunitas Dicoding</p>
        </div>
        
        <div class="welcome-body">
          <div class="welcome-features">
            <div class="feature-card">
              <div class="feature-icon">📸</div>
              <h3 class="feature-title">Bagikan Cerita</h3>
              <p class="feature-description">Bagikan pengalaman belajar dan berkarya bersama Dicoding</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">🌍</div>
              <h3 class="feature-title">Tandai Lokasi</h3>
              <p class="feature-description">Tandai lokasi cerita Anda di peta untuk konteks yang lebih kaya</p>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h3 class="feature-title">Komunitas</h3>
              <p class="feature-description">Terhubung dengan komunitas pembelajar Dicoding di seluruh Indonesia</p>
            </div>
          </div>
          
          <div class="info-banner">
            <div class="info-banner-icon">ℹ️</div>
            <div>
              <p>Anda dapat menambahkan cerita baru tanpa perlu login dengan mengklik "Tambah Story" di menu navigasi.</p>
            </div>
          </div>
          
          <div class="welcome-info">
            <div class="welcome-info-icon">🔒</div>
            <div>
              <p>Untuk melihat cerita dari pengguna lain, Anda perlu login terlebih dahulu. API Dicoding Story mengharuskan autentikasi untuk mengakses daftar cerita.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    if (!isUserLoggedIn()) {
      return;
    }

    this._storyListElement = document.getElementById("main-content");
    this._loadingElement = document.getElementById("loading");
    this._errorElement = document.getElementById("error-container");
    this._mapElement = document.getElementById("map");

    await this._presenter.getStories();
  }

  showLoading() {
    if (this._loadingElement) {
      this._loadingElement.style.display = "block";
    }
  }

  hideLoading() {
    if (this._loadingElement) {
      this._loadingElement.style.display = "none";
    }
  }

  showError(message) {
    if (this._errorElement) {
      this._errorElement.innerHTML = `<p class="error-message">${message}</p>`;
      this._errorElement.style.display = "block";
    }
  }

  showEmpty() {
    if (this._storyListElement) {
      this._storyListElement.innerHTML = `
        <div class="empty-message">
          <h3>Belum Ada Cerita</h3>
          <p>Belum ada story yang tersedia saat ini. Jadilah yang pertama berbagi cerita Anda dengan komunitas Dicoding!</p>
          <a href="#/add" class="button">Tambah Story Baru</a>
        </div>
      `;
    }
  }

  showStories(stories) {
    if (!this._storyListElement) return;

    this._storyListElement.innerHTML = "";

    stories.forEach((story) => {
      this._storyListElement.innerHTML += this._createStoryItemTemplate(story);
    });

    const storiesWithLocation = stories.filter(
      (story) => story.lat && story.lon
    );
    if (storiesWithLocation.length > 0) {
      this._initMap(storiesWithLocation);
    } else {
      const mapContainer = document.getElementById("map-container");
      if (mapContainer) {
        mapContainer.style.display = "none";
      }
    }
  }

  _createStoryItemTemplate(story) {
    const firstLetter = story.name.charAt(0).toUpperCase();
    const formattedDate = showFormattedDate(story.createdAt);

    return `
    <div class="story-card">
      <div class="story-header">
        <div class="story-avatar">
          ${firstLetter}
        </div>
        <div class="story-user-info">
          <h3 class="story-username">${story.name}</h3>
          <p class="story-time">${formattedDate}</p>
        </div>
      </div>
      
      <div class="story-content">
        <p class="story-description">
          ${story.description}
        </p>
      </div>
      
      <div class="story-media">
        <img src="${story.photoUrl}" alt="Foto dari ${
      story.name
    }" class="story-photo">
      </div>
      
      <div class="story-footer">
        ${
          story.lat && story.lon
            ? `<div class="story-location">
            <span>📍</span> Lat ${story.lat.toFixed(
              4
            )}, Lon ${story.lon.toFixed(4)}
          </div>`
            : `<div></div>`
        }
        <a href="#/detail/${
          story.id
        }" class="story-detail-link">Lihat Detail</a>
      </div>
    </div>
  `;
  }

  _initMap(stories) {
    const map = L.map(this._mapElement).setView([-2.548926, 118.0148634], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    stories.forEach((story) => {
      const marker = L.marker([story.lat, story.lon]).addTo(map);

      marker.bindPopup(`
        <div class="map-popup">
          <h3>${story.name}</h3>
          <p>${story.description.substring(0, 100)}${
        story.description.length > 100 ? "..." : ""
      }</p>
          <a href="#/detail/${story.id}" class="popup-link">Lihat Detail</a>
        </div>
      `);
    });
  }
}

export default HomePage;
