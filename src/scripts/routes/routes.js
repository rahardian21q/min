import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";
import AddStoryPage from "../pages/add-story/add-story-page";
import DetailStoryPage from "../pages/detail-story/detail-story-page";

const routes = {
  "/": new HomePage(),
  "/about": new AboutPage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add": new AddStoryPage(),
  "/detail/:id": new DetailStoryPage(),
};

export default routes;
