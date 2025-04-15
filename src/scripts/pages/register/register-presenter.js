import StoryApiService from "../../data/api";

class RegisterPresenter {
  constructor({ view }) {
    this.view = view;
  }

  async register({ name, email, password }) {
    try {
      this.view.showLoading();

      const response = await StoryApiService.register({
        name,
        email,
        password,
      });

      if (response.error) {
        this.view.showError(response.message);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      this.view.showError(error.message);
      return { success: false };
    } finally {
      this.view.hideLoading();
    }
  }
}

export default RegisterPresenter;
