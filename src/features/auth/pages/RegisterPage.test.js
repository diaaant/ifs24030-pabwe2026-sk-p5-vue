import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

const mockRegister = vi.fn(() => Promise.resolve(true));
vi.mock("../states/authStore.js", () => ({
  useAuthStore: () => ({
    register: mockRegister,
    isAuthRegister: false,
  }),
}));

vi.mock("../../../helpers/toolsHelper.js", () => ({
  showWarningDialog: vi.fn(() => Promise.resolve()),
}));

import RegisterPage from "./RegisterPage.vue";
import { showWarningDialog } from "../../../helpers/toolsHelper.js";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/auth/login", component: { template: "<div>Login</div>" } },
    { path: "/auth/register", component: { template: "<div>Register</div>" } },
  ],
});

describe("RegisterPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("renders name, email, password inputs", () => {
    const wrapper = mount(RegisterPage, {
      global: { plugins: [router] },
    });
    expect(wrapper.find('[data-testid="register-name"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="register-email"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="register-password"]').exists()).toBe(true);
  });

  it("renders submit button", () => {
    const wrapper = mount(RegisterPage, {
      global: { plugins: [router] },
    });
    expect(wrapper.find("#register-submit-button").exists()).toBe(true);
    expect(wrapper.text()).toContain("Daftar Sekarang");
  });

  it("shows warning when fields are empty on submit", async () => {
    const wrapper = mount(RegisterPage, {
      global: { plugins: [router] },
    });
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalledWith("Semua kolom wajib diisi");
  });

  it("shows warning when password less than 6 characters", async () => {
    const wrapper = mount(RegisterPage, {
      global: { plugins: [router] },
    });
    await wrapper.find('[data-testid="register-name"]').setValue("Dian");
    await wrapper.find('[data-testid="register-email"]').setValue("dian@test.com");
    await wrapper.find('[data-testid="register-password"]').setValue("123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalledWith("Kata sandi minimal 6 karakter");
  });

  it("calls auth.register when all fields are valid", async () => {
    const wrapper = mount(RegisterPage, {
      global: { plugins: [router] },
    });
    await wrapper.find('[data-testid="register-name"]').setValue("Dian");
    await wrapper.find('[data-testid="register-email"]').setValue("dian@test.com");
    await wrapper.find('[data-testid="register-password"]').setValue("password123");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(mockRegister).toHaveBeenCalledWith("Dian", "dian@test.com", "password123");
  });

  it("updates name input value on typing", async () => {
    const wrapper = mount(RegisterPage, {
      global: { plugins: [router] },
    });
    const input = wrapper.find('[data-testid="register-name"]');
    await input.setValue("Test User");
    expect(input.element.value).toBe("Test User");
  });
});