import RegisterPresenter from "./register-presenter";

class RegisterPage {
  constructor() {
    this._presenter = new RegisterPresenter({
      view: this,
    });
  }

  async render() {
    return `
      <section class="register-page">
        <a href="#form-register" class="skip-link">Lewati ke formulir registrasi</a>
        
        <div class="container">
          <div class="page-title">
            <h1>Register</h1>
          </div>
          
          <div id="error-container" class="error-container"></div>
          
          <div id="loading" class="loading-indicator">
            <p>Memproses...</p>
          </div>
          
          <form id="form-register" class="form">
            <div class="form-group">
              <label for="name">Nama</label>
              <input type="text" id="name" name="name" placeholder="Masukkan nama lengkap anda" required>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Masukkan email anda" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Minimal 8 karakter" required minlength="8">
              <p class="form-hint">Password minimal 8 karakter</p>
            </div>
            
            <div class="form-action">
              <button type="submit" class="button submit-button">Register</button>
            </div>
            
            <div class="form-footer">
              <p>Sudah punya akun? <a href="#/login">Login</a></p>
            </div>
          </form>
          
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._formElement = document.getElementById("form-register");
    this._loadingElement = document.getElementById("loading");
    this._errorElement = document.getElementById("error-container");

    this._loadingElement.style.display = "none";

    this._formElement.addEventListener("submit", async (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { success } = await this._presenter.register({
        name,
        email,
        password,
      });

      if (success) {
        window.location.hash = "#/login";
        alert(
          "Registrasi berhasil! Silakan login dengan akun yang baru dibuat."
        );
      }
    });
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

export default RegisterPage;
