import CONFIG from "../utils/config";

const API_ENDPOINT = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  GET_ALL_STORIES: `${CONFIG.BASE_URL}/stories`,
  GET_DETAIL_STORY: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  POST_STORY: `${CONFIG.BASE_URL}/stories`,
  POST_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  SUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE_NOTIFICATION: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

class StoryApiService {
  static async register({ name, email, password }) {
    try {
      const response = await fetch(API_ENDPOINT.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      return await response.json();
    } catch (error) {
      return {
        error: true,
        message: `Error: ${error.message}`,
      };
    }
  }

  static async login({ email, password }) {
    try {
      const response = await fetch(API_ENDPOINT.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      if (!responseJson.error) {
        const { token } = responseJson.loginResult;
        localStorage.setItem("authToken", token);
        localStorage.setItem(
          "userData",
          JSON.stringify(responseJson.loginResult)
        );
      }

      return responseJson;
    } catch (error) {
      return {
        error: true,
        message: `Error: ${error.message}`,
      };
    }
  }

  static async getAllStories({ page = 1, size = 10, location = 1 } = {}) {
    try {
      const token = localStorage.getItem("authToken");
      const url = `${API_ENDPOINT.GET_ALL_STORIES}?page=${page}&size=${size}&location=${location}`;

      if (token) {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return await response.json();
      } else {
        const response = await fetch(url);

        return await response.json();
      }
    } catch (error) {
      return {
        error: true,
        message: `Error: ${error.message}`,
      };
    }
  }

  static async getDetailStory(id) {
    try {
      const token = localStorage.getItem("authToken");
      const url = API_ENDPOINT.GET_DETAIL_STORY(id);

      if (token) {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        return await response.json();
      } else {
        const response = await fetch(url);
        return await response.json();
      }
    } catch (error) {
      return {
        error: true,
        message: `Error: ${error.message}`,
      };
    }
  }

  static async addStory({ description, photo, lat, lon }) {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        return {
          error: true,
          message: "Anda harus login terlebih dahulu",
        };
      }

      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photo);

      if (lat !== undefined && lon !== undefined) {
        formData.append("lat", lat);
        formData.append("lon", lon);
      }

      const response = await fetch(API_ENDPOINT.POST_STORY, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      return await response.json();
    } catch (error) {
      return {
        error: true,
        message: `Error: ${error.message}`,
      };
    }
  }

  static async addStoryAsGuest({ description, photo, lat, lon }) {
    try {
      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photo);

      if (lat !== undefined && lon !== undefined) {
        formData.append("lat", lat);
        formData.append("lon", lon);
      }

      const response = await fetch(API_ENDPOINT.POST_STORY_GUEST, {
        method: "POST",
        body: formData,
      });

      return await response.json();
    } catch (error) {
      return {
        error: true,
        message: `Error: ${error.message}`,
      };
    }
  }

  static async subscribeNotification(subscription) {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        return {
          error: true,
          message: "Anda harus login terlebih dahulu",
        };
      }

      const response = await fetch(API_ENDPOINT.SUBSCRIBE_NOTIFICATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });

      return await response.json();
    } catch (error) {
      return {
        error: true,
        message: `Error: ${error.message}`,
      };
    }
  }

  static async unsubscribeNotification(endpoint) {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        return {
          error: true,
          message: "Anda harus login terlebih dahulu",
        };
      }

      const response = await fetch(API_ENDPOINT.UNSUBSCRIBE_NOTIFICATION, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint }),
      });

      return await response.json();
    } catch (error) {
      return {
        error: true,
        message: `Error: ${error.message}`,
      };
    }
  }
}

export default StoryApiService;
