import StoryApiService from "../../data/api";

class AddStoryPresenter {
  constructor({ view }) {
    this.view = view;
  }

  async addStory({ description, photo, lat, lon, isGuest }) {
    try {
      this.view.showLoading();

      let response;
      if (isGuest) {
        response = await StoryApiService.addStoryAsGuest({
          description,
          photo,
          lat,
          lon,
        });
      } else {
        response = await StoryApiService.addStory({
          description,
          photo,
          lat,
          lon,
        });
      }

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

export default AddStoryPresenter;
