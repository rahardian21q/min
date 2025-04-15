import LoginPresenter from "./login-presenter";

class LoginPage {
  constructor() {
    this._presenter = new LoginPresenter({
      view: this,
    });
  }

  async render() {
    return `
      <section class="login-page">
        <a href="#form-login" class="skip-link">Lewati ke formulir login</a>
        
        <div class="container">
          <div class="page-title">
            <h1>Login</h1>
          </div>
          
          <div id="error-container" class="error-container"></div>
          
          <div id="loading" class="loading-indicator">
            <p>Memproses...</p>
          </div>
          
          <form id="form-login" class="form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Masukkan email anda" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" placeholder="Masukkan password anda" required>
            </div>
            
            <div class="form-action">
              <button type="submit" class="button submit-button">Login</button>
            </div>
            
            <div class="form-footer">
              <p>Belum punya akun? <a href="#/register">Register</a></p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._formElement = document.getElementById("form-login");
    this._loadingElement = document.getElementById("loading");
    this._errorElement = document.getElementById("error-container");

    this._loadingElement.style.display = "none";

    this._formElement.addEventListener("submit", async (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { success } = await this._presenter.login({ email, password });

      if (success) {
        window.location.hash = "#/";
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

export default LoginPage;
