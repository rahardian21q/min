import StoryApiService from "../../data/api";

class HomePresenter {
  constructor({ view }) {
    this.view = view;
  }

  async getStories() {
    try {
      this.view.showLoading();

      const response = await StoryApiService.getAllStories();

      if (response.error) {
        this.view.showError(response.message);
        return;
      }

      const { listStory } = response;

      if (!listStory || listStory.length === 0) {
        this.view.showEmpty();
        return;
      }

      this.view.showStories(listStory);
    } catch (error) {
      this.view.showError(error.message);
    } finally {
      this.view.hideLoading();
    }
  }
}

export default HomePresenter;
