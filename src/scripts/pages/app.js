import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  registerServiceWorker,
  requestNotificationPermission,
  isPushNotificationSupported,
  subscribeToPushNotification,
  unsubscribeFromPushNotification,
} from "../utils/notification-helper";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #logoutButton = null;
  #logoutItem = null;
  #notificationToggle = null;
  #notificationItem = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#logoutButton = document.getElementById("logout-button");
    this.#logoutItem = document.getElementById("logout-item");
    this.#notificationToggle = document.getElementById("notification-toggle");
    this.#notificationItem = document.getElementById("notification-item");

    this.#setupDrawer();

    if (this.#logoutButton) {
      this.#setupLogout();
    }

    this.#setupPushNotification();

    this.#updateAuthUI();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupViewTransition() {
    if (!document.startViewTransition) {
      console.warn("View Transition API tidak didukung di browser ini.");
      return;
    }
  }

  #setupLogout() {
    if (this.#logoutButton) {
      this.#logoutButton.addEventListener("click", (event) => {
        event.preventDefault();

        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");

        this.#updateAuthUI();

        window.location.hash = "#/";

        window.location.reload();
      });
    }
  }

  async #setupPushNotification() {
    if (!isPushNotificationSupported()) {
      if (this.#notificationItem) {
        this.#notificationItem.style.display = "none";
      }
      return;
    }

    await registerServiceWorker();

    if (this.#notificationToggle) {
      this.#notificationToggle.addEventListener("click", async () => {
        const isSubscribed =
          this.#notificationToggle.classList.contains("subscribed");

        if (isSubscribed) {
          const result = await unsubscribeFromPushNotification();

          if (result.success) {
            this.#notificationToggle.classList.remove("subscribed");
            this.#notificationToggle.textContent = "Aktifkan Notifikasi";
            alert("Notifikasi berhasil dinonaktifkan");
          } else {
            alert(`Gagal menonaktifkan notifikasi: ${result.message}`);
          }
        } else {
          const permission = await requestNotificationPermission();

          if (permission.granted) {
            const result = await subscribeToPushNotification();

            if (result.success) {
              this.#notificationToggle.classList.add("subscribed");
              this.#notificationToggle.textContent = "Nonaktifkan Notifikasi";
              alert("Notifikasi berhasil diaktifkan");
            } else {
              alert(`Gagal mengaktifkan notifikasi: ${result.message}`);
            }
          } else {
            alert("Anda perlu memberikan izin notifikasi");
          }
        }
      });
    }

    this.#updateNotificationStatus();
  }

  async #updateNotificationStatus() {
    if (!this.#notificationToggle || !localStorage.getItem("authToken")) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        this.#notificationToggle.classList.add("subscribed");
        this.#notificationToggle.textContent = "Nonaktifkan Notifikasi";
      } else {
        this.#notificationToggle.classList.remove("subscribed");
        this.#notificationToggle.textContent = "Aktifkan Notifikasi";
      }
    } catch (error) {
      console.error("Error checking notification status:", error);
    }
  }

  #updateAuthUI() {
    const isLoggedIn = localStorage.getItem("authToken") !== null;
    const loginItem = document.getElementById("login-item");
    const registerItem = document.getElementById("register-item");

    if (isLoggedIn) {
      if (this.#logoutItem) this.#logoutItem.style.display = "block";

      if (this.#notificationItem && isPushNotificationSupported()) {
        this.#notificationItem.style.display = "block";
      }

      if (loginItem) loginItem.style.display = "none";
      if (registerItem) registerItem.style.display = "none";
    } else {
      if (this.#logoutItem) this.#logoutItem.style.display = "none";
      if (this.#notificationItem) this.#notificationItem.style.display = "none";

      if (loginItem) loginItem.style.display = "block";
      if (registerItem) registerItem.style.display = "block";
    }

    if (isLoggedIn) {
      this.#updateNotificationStatus();
    }
  }

  async renderPage() {
    this.#updateAuthUI();

    const url = getActiveRoute();
    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = `
        <div class="error-page">
          <h2>404 - Halaman Tidak Ditemukan</h2>
          <p>Halaman yang Anda cari tidak ada.</p>
          <a href="#/" class="button back-button">Kembali ke Beranda</a>
        </div>
      `;
      return;
    }

    try {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    } catch (error) {
      console.error("Error rendering page:", error);
      this.#content.innerHTML = `
        <div class="error-page">
          <h2>Terjadi Kesalahan</h2>
          <p>${error.message}</p>
          <a href="#/" class="button back-button">Kembali ke Beranda</a>
        </div>
      `;
    }
  }
}

export default App;
