import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

// Mock useAuthStore
const mockLogin = vi.fn(() => Promise.resolve(true));
vi.mock("../states/authStore.js", () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isAuthLogin: false,
  }),
}));

// Mock toolsHelper
vi.mock("../../../helpers/toolsHelper.js", () => ({
  showWarningDialog: vi.fn(() => Promise.resolve()),
}));

import LoginPage from "./LoginPage.vue";
import { showWarningDialog } from "../../../helpers/toolsHelper.js";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/auth/login", component: { template: "<div>Login</div>" } },
  ],
});

describe("LoginPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("renders email and password inputs", () => {
    const wrapper = mount(LoginPage, {
      global: { plugins: [router] },
    });
    expect(wrapper.find('[data-testid="login-email"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="login-password"]').exists()).toBe(true);
  });

  it("renders submit button", () => {
    const wrapper = mount(LoginPage, {
      global: { plugins: [router] },
    });
    expect(wrapper.find("#login-submit-button").exists()).toBe(true);
    expect(wrapper.text()).toContain("Masuk Sekarang");
  });

  it("shows warning when fields are empty on submit", async () => {
    const wrapper = mount(LoginPage, {
      global: { plugins: [router] },
    });
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalledWith("Email dan kata sandi wajib diisi");
  });

  it("calls auth.login when fields are filled", async () => {
    const wrapper = mount(LoginPage, {
      global: { plugins: [router] },
    });
    await wrapper.find('[data-testid="login-email"]').setValue("test@test.com");
    await wrapper.find('[data-testid="login-password"]').setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(mockLogin).toHaveBeenCalledWith("test@test.com", "password123");
  });

  it("updates email input value on typing", async () => {
    const wrapper = mount(LoginPage, {
      global: { plugins: [router] },
    });
    const input = wrapper.find('[data-testid="login-email"]');
    await input.setValue("dian@test.com");
    expect(input.element.value).toBe("dian@test.com");
  });
});