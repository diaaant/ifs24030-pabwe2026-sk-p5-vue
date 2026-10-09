import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

const mockLogout = vi.fn();

vi.mock("../../users/states/usersStore.js", () => ({
  useUsersStore: () => ({
    profile: { name: "Dian Test", email: "dian@test.com", photo: null },
  }),
}));

vi.mock("../../auth/states/authStore.js", () => ({
  useAuthStore: () => ({
    logout: mockLogout,
  }),
}));

vi.mock("../../../helpers/toolsHelper.js", () => ({
  showConfirmDialog: vi.fn(() => Promise.resolve(false)),
}));

import NavbarComponent from "./NavbarComponent.vue";
import { showConfirmDialog } from "../../../helpers/toolsHelper.js";

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
    vi.clearAllMocks();
    showConfirmDialog.mockResolvedValue(false);
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

  it("does not logout when user cancels confirm dialog", async () => {
    showConfirmDialog.mockResolvedValueOnce(false);
    const wrapper = mount(NavbarComponent, {
      global: { plugins: [router] },
    });
    await wrapper.find('[data-testid="btn-logout"]').trigger("click");
    await flushPromises();
    expect(showConfirmDialog).toHaveBeenCalledWith("Yakin ingin keluar?");
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("calls logout and redirects when user confirms", async () => {
    showConfirmDialog.mockResolvedValueOnce(true);
    const wrapper = mount(NavbarComponent, {
      global: { plugins: [router] },
    });
    await wrapper.find('[data-testid="btn-logout"]').trigger("click");
    await flushPromises();
    expect(showConfirmDialog).toHaveBeenCalledWith("Yakin ingin keluar?");
    expect(mockLogout).toHaveBeenCalled();
  });
});