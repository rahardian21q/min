import StoryApiService from "../../data/api";

class DetailStoryPresenter {
  constructor({ view }) {
    this.view = view;
  }

  async getStory(id) {
    try {
      this.view.showLoading();

      const response = await StoryApiService.getDetailStory(id);

      if (response.error) {
        this.view.showError(response.message);
        return;
      }

      const story = response.story;

      console.log("Story data retrieved:", {
        id: story.id,
        hasLocation: !!(story.lat && story.lon),
        lat: story.lat,
        lon: story.lon,
      });

      this.view.showStory(story);
    } catch (error) {
      console.error("Error retrieving story:", error);
      this.view.showError(error.message);
    } finally {
      this.view.hideLoading();
    }
  }
}

export default DetailStoryPresenter;
