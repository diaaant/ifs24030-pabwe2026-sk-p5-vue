import { createRouter, createWebHistory } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper.js";
import AuthLayout from "./features/auth/layouts/AuthLayout.vue";
import LoginPage from "./features/auth/pages/LoginPage.vue";
import RegisterPage from "./features/auth/pages/RegisterPage.vue";
import AucationLayout from "./features/aucations/layouts/AucationLayout.vue";
import HomePage from "./features/aucations/pages/HomePage.vue";
import DetailPage from "./features/aucations/pages/DetailPage.vue";
import UsersPage from "./features/users/pages/UsersPage.vue";
import ProfilePage from "./features/users/pages/ProfilePage.vue";
import NotFoundPage from "./features/common/pages/NotFoundPage.vue";

export const guestOnly = () => (getAccessToken() ? "/" : true);
export const authOnly = () => (getAccessToken() ? true : "/auth/login");

export const routes = [
  {
    path: "/auth",
    component: AuthLayout,
    beforeEnter: guestOnly,
    children: [
      { path: "", redirect: "/auth/login" },
      { path: "login", component: LoginPage },
      { path: "register", component: RegisterPage },
    ],
  },
  {
    path: "/",
    component: AucationLayout,
    beforeEnter: authOnly,
    children: [
      { path: "", component: HomePage },
      { path: "aucations/:aucationId", component: DetailPage },
      { path: "users", component: UsersPage },
      { path: "profile", component: ProfilePage },
    ],
  },
  { path: "/:pathMatch(.*)*", component: NotFoundPage },
];

export default createRouter({ history: createWebHistory(), routes });
