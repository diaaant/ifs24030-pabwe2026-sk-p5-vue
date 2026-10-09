import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

// Mock store
vi.mock("../../users/states/usersStore.js", () => ({
  useUsersStore: () => ({
    profile: { name: "Dian Test", email: "dian@test.com" },
  }),
}));

vi.mock("../../auth/states/authStore.js", () => ({
  useAuthStore: () => ({
    logout: vi.fn(),
  }),
}));

vi.mock("../../../helpers/toolsHelper.js", () => ({
  showConfirmDialog: vi.fn(() => Promise.resolve(false)),
}));

import NavbarComponent from "./NavbarComponent.vue";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/auth/login", component: { template: "<div>Login</div>" } },
  ],
});

describe("NavbarComponent", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("renders app title", () => {
    const wrapper = mount(NavbarComponent, {
      global: { plugins: [router] },
    });
    expect(wrapper.text()).toContain("Delcom Auction");
  });

  it("displays user name", () => {
    const wrapper = mount(NavbarComponent, {
      global: { plugins: [router] },
    });
    expect(wrapper.text()).toContain("Dian Test");
  });

  it("emits toggle-sidebar when menu button clicked", async () => {
    const wrapper = mount(NavbarComponent, {
      global: { plugins: [router] },
    });
    await wrapper.find('[data-testid="btn-menu"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("toggle-sidebar");
  });

  it("renders avatar with initial when no photo", () => {
    const wrapper = mount(NavbarComponent, {
      global: { plugins: [router] },
    });
    const avatar = wrapper.find('[data-testid="avatar"]');
    expect(avatar.exists()).toBe(true);
    expect(avatar.text()).toBe("D");
  });
});