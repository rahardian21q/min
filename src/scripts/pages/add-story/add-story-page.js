import AddStoryPresenter from "./add-story-presenter.js";
import { isUserLoggedIn } from "../../utils/index";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { initMapWithLayerControl } from "../../utils/map-helper.js";

class AddStoryPage {
  constructor() {
    this._presenter = new AddStoryPresenter({
      view: this,
    });

    this._map = null;
    this._marker = null;
    this._lat = null;
    this._lon = null;
    this._mediaStream = null;
  }

  async render() {
    const isGuest = !isUserLoggedIn();

    return `
      <section class="add-story-page">
        <a href="#form-add-story" class="skip-link">Lewati ke formulir tambah story</a>
        
        <div class="container">
          <div class="page-title">
            <h1>Tambah Story Baru</h1>
          </div>
          
          ${
            isGuest
              ? `
          <div class="guest-notice">
            <div class="guest-notice-icon">ℹ️</div>
            <div>
              <p>Anda sedang menambahkan story sebagai tamu. Anda tidak perlu login untuk membagikan pengalaman Anda.</p>
            </div>
          </div>
          `
              : ""
          }
          
          <div id="error-container" class="error-container"></div>
          
          <div id="loading" class="loading-indicator">
            <p>Memproses...</p>
          </div>
          
          <form id="form-add-story" class="form">
            <div class="form-group">
              <label for="description">Ceritakan pengalaman Anda</label>
              <textarea id="description" name="description" rows="4" placeholder="Bagikan pengalaman atau cerita menarik Anda bersama komunitas Dicoding..." required></textarea>
            </div>
            
            <div class="form-group">
              <label>Foto</label>
              <div class="camera-container">
                <div id="camera-select-container" style="margin-bottom: 16px; display: none;">
                  <label for="camera-select">Pilih Kamera:</label>
                  <select id="camera-select" class="camera-select">
                    <option value="">Memuat daftar kamera...</option>
                  </select>
                </div>
                <div id="camera-preview-container">
                  <video id="camera-preview" autoplay></video>
                </div>
                <div class="camera-actions">
                  <button type="button" id="start-camera" class="button">Buka Kamera</button>
                  <button type="button" id="capture-photo" class="button" disabled>Ambil Foto</button>
                  <button type="button" id="recapture-photo" class="button" disabled>Ambil Ulang</button>
                </div>
                <canvas id="photo-canvas" style="display: none;"></canvas>
                <div id="photo-preview-container" style="display: none;">
                  <img id="photo-preview" alt="Preview foto yang diambil">
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>Lokasi</label>
              <p class="form-hint">Klik pada peta untuk menentukan lokasi cerita Anda</p>
              <div id="map" class="map"></div>
              <div id="location-info" class="location-info">
                <span>📍</span> <span>Lokasi belum dipilih</span>
              </div>
            </div>
            
            <div class="form-action">
              <button type="submit" id="submit-button" class="button submit-button" disabled>Publikasikan Story</button>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._formElement = document.getElementById("form-add-story");
    this._loadingElement = document.getElementById("loading");
    this._errorElement = document.getElementById("error-container");
    this._cameraPreview = document.getElementById("camera-preview");
    this._photoCanvas = document.getElementById("photo-canvas");
    this._photoPreview = document.getElementById("photo-preview");
    this._photoPreviewContainer = document.getElementById(
      "photo-preview-container"
    );
    this._cameraSelectContainer = document.getElementById(
      "camera-select-container"
    );
    this._cameraSelect = document.getElementById("camera-select");
    this._startCameraButton = document.getElementById("start-camera");
    this._capturePhotoButton = document.getElementById("capture-photo");
    this._recapturePhotoButton = document.getElementById("recapture-photo");
    this._submitButton = document.getElementById("submit-button");
    this._locationInfoElement = document.getElementById("location-info");

    this._loadingElement.style.display = "none";

    this._initMap();

    this._checkCameraDevices();

    this._setupCameraControls();
    this._setupFormSubmission();
  }

  _initMap() {
    this._map = initMapWithLayerControl(
      document.getElementById("map"),
      [-2.548926, 118.0148634],
      5,
      []
    );

    this._map.on("click", (event) => {
      const { lat, lng } = event.latlng;

      this._lat = lat;
      this._lon = lng;

      this._locationInfoElement.innerHTML = `
        <p>Lokasi dipilih: Lat ${lat.toFixed(6)}, Lon ${lng.toFixed(6)}</p>
      `;

      if (this._marker) {
        this._map.removeLayer(this._marker);
      }

      this._marker = L.marker([lat, lng]).addTo(this._map);

      this._validateForm();
    });

    const mapInfoElement = document.createElement("div");
    mapInfoElement.className = "map-info";
    mapInfoElement.innerHTML = `
      <p><i class="map-info-icon">ℹ️</i> Anda dapat mengganti tampilan peta dengan mengklik tombol kontrol layer di kanan atas peta</p>
    `;

    document
      .getElementById("map")
      .parentNode.insertBefore(
        mapInfoElement,
        document.getElementById("map").nextSibling
      );
  }

  _setupCameraControls() {
    this._startCameraButton.addEventListener("click", () => {
      this._startCamera();
    });

    this._capturePhotoButton.addEventListener("click", () => {
      this._capturePhoto();
    });

    this._recapturePhotoButton.addEventListener("click", () => {
      this._resetCamera();
    });
  }

  async _startCamera() {
    try {
      this._stopMediaStream();

      const selectedCameraId = this._cameraSelect && this._cameraSelect.value;

      const constraints = {
        video: selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : true,
        audio: false,
      };

      this.showLoading();

      try {
        this._mediaStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );

        this._cameraPreview.srcObject = this._mediaStream;

        this._capturePhotoButton.disabled = false;
        this._startCameraButton.disabled = true;

        this._errorElement.style.display = "none";
      } catch (error) {
        if (error.name === "NotReadableError" || error.name === "AbortError") {
          this.showError(
            `Kamera "${
              this._cameraSelect.options[this._cameraSelect.selectedIndex].text
            }" sedang digunakan oleh aplikasi lain. Silakan pilih kamera lain atau tutup aplikasi yang menggunakan kamera tersebut.`
          );
        } else if (error.name === "NotFoundError") {
          this.showError(
            "Kamera tidak ditemukan. Pastikan kamera terhubung dengan benar."
          );
        } else if (error.name === "NotAllowedError") {
          this.showError(
            "Izin akses kamera ditolak. Berikan izin untuk mengakses kamera."
          );
        } else {
          this.showError(`Gagal mengakses kamera: ${error.message}`);
        }
      }
    } catch (error) {
      this.showError(`Terjadi kesalahan: ${error.message}`);
      this._startCameraButton.disabled = false;
    } finally {
      this.hideLoading();
    }
  }

  _capturePhoto() {
    const { videoWidth, videoHeight } = this._cameraPreview;

    this._photoCanvas.width = videoWidth;
    this._photoCanvas.height = videoHeight;

    const context = this._photoCanvas.getContext("2d");
    context.drawImage(this._cameraPreview, 0, 0, videoWidth, videoHeight);

    const photoDataUrl = this._photoCanvas.toDataURL("image/jpeg");

    this._photoPreview.src = photoDataUrl;
    this._photoPreviewContainer.style.display = "block";

    this._cameraPreview.style.display = "none";

    this._recapturePhotoButton.disabled = false;
    this._capturePhotoButton.disabled = true;

    this._validateForm();
  }

  _resetCamera() {
    this._cameraPreview.style.display = "block";

    this._photoPreviewContainer.style.display = "none";

    this._capturePhotoButton.disabled = false;
    this._recapturePhotoButton.disabled = true;

    this._validateForm();
  }

  async _checkCameraDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("MediaDevices API or enumerateDevices not supported");
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length > 0) {
        this._cameraSelectContainer.style.display = "block";

        this._cameraSelect.innerHTML = "";

        videoDevices.forEach((device, index) => {
          const option = document.createElement("option");
          option.value = device.deviceId;
          option.text = device.label || `Camera ${index + 1}`;
          this._cameraSelect.appendChild(option);
        });

        if (videoDevices.length <= 1) {
          this._cameraSelectContainer.style.display = "none";
        }

        this._cameraSelect.addEventListener("change", () => {
          if (this._mediaStream) {
            this._stopMediaStream();
            this._startCamera();
          }
        });
      } else {
        this._cameraSelectContainer.style.display = "none";
        console.warn("No camera devices detected");
      }
    } catch (error) {
      console.error("Error enumerating devices:", error);
      this._cameraSelectContainer.style.display = "none";
    }
  }

  _validateForm() {
    const photoTaken = this._photoPreviewContainer.style.display === "block";

    const description = document.getElementById("description").value.trim();

    this._submitButton.disabled = !(photoTaken && description);
  }

  _setupFormSubmission() {
    document.getElementById("description").addEventListener("input", () => {
      this._validateForm();
    });

    this._formElement.addEventListener("submit", async (event) => {
      event.preventDefault();

      const description = document.getElementById("description").value;

      const photoDataUrl = this._photoPreview.src;
      const response = await fetch(photoDataUrl);
      const blob = await response.blob();
      const photo = new File([blob], "photo.jpg", { type: "image/jpeg" });

      const isLoggedIn = isUserLoggedIn();

      const { success } = await this._presenter.addStory({
        description,
        photo,
        lat: this._lat,
        lon: this._lon,
        isGuest: !isLoggedIn,
      });

      if (success) {
        this._showNotificationIfPossible(description);

        this._stopMediaStream();
        window.location.hash = "#/";
      }
    });
  }

  async _showNotificationIfPossible(description) {
    if ("serviceWorker" in navigator && "Notification" in window) {
      try {
        if (Notification.permission === "granted") {
          const registration = await navigator.serviceWorker.ready;

          await registration.showNotification("Story berhasil dibuat", {
            body: `Anda telah membuat story baru dengan deskripsi: ${description.substring(
              0,
              50
            )}${description.length > 50 ? "..." : ""}`,
            icon: "/public/images/logo.png",
          });
        }
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    }
  }

  _stopMediaStream() {
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach((track) => track.stop());
      this._mediaStream = null;
    }
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
}

export default AddStoryPage;
