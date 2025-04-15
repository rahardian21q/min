import AboutPresenter from "./about-presenter";

class AboutPage {
  constructor() {
    this._presenter = new AboutPresenter({
      view: this,
    });
  }

  async render() {
    return `
      <section class="about-page">
        <a href="#main-content" class="skip-link">Lewati ke konten utama</a>
        
        <div class="container">
          <div class="page-title">
            <h1>Tentang Aplikasi</h1>
          </div>
          
          <div id="main-content" class="about-content">
            <div class="about-section">
              <h2>Dicoding Story App</h2>
              <p>Aplikasi ini dibuat sebagai proyek submission untuk kelas Dicoding. Dicoding Story App memungkinkan pengguna untuk berbagi cerita mereka dengan komunitas Dicoding.</p>
            </div>
            
            <div class="about-section">
              <h2>Fitur Utama</h2>
              <ul>
                <li>Berbagi cerita dengan gambar</li>
                <li>Menambahkan lokasi pada cerita</li>
                <li>Melihat cerita dari pengguna lain</li>
                <li>Melihat lokasi cerita di peta</li>
              </ul>
            </div>
            
            <div class="about-section">
              <h2>Teknologi yang Digunakan</h2>
              <ul>
                <li>JavaScript ES6+</li>
                <li>Vite sebagai bundler</li>
                <li>Leaflet dan OpenStreetMap untuk peta</li>
                <li>Web API seperti Geolocation dan Camera API</li>
                <li>Dicoding Story API</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {}
}

export default AboutPage;
