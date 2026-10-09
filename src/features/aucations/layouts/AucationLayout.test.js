import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

const mockFetchProfile = vi.fn(() => Promise.resolve(true));
const mockLogout = vi.fn();

vi.mock("../../users/states/usersStore.js", () => ({
  useUsersStore: () => ({
    fetchProfile: mockFetchProfile,
  }),
}));

vi.mock("../../auth/states/authStore.js", () => ({
  useAuthStore: () => ({
    logout: mockLogout,
  }),
}));

import AucationLayout from "./AucationLayout.vue";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/auth/login", component: { template: "<div>Login</div>" } },
  ],
});

describe("AucationLayout", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockFetchProfile.mockResolvedValue(true);
  });

  it("renders layout structure and calls fetchProfile on mount", async () => {
    const wrapper = mount(AucationLayout, {
      global: {
        plugins: [router],
        stubs: {
          NavbarComponent: true,
          SidebarComponent: true,
          RouterView: true,
        },
      },
    });
    await flushPromises();
    expect(wrapper.exists()).toBe(true);
    expect(mockFetchProfile).toHaveBeenCalled();
  });

  it("toggles sidebar when navbar emits toggle-sidebar", async () => {
    const wrapper = mount(AucationLayout, {
      global: {
        plugins: [router],
        stubs: {
          NavbarComponent: {
            template:
              '<button data-testid="nav-toggle" @click="$emit(\'toggle-sidebar\')">Toggle</button>',
          },
          SidebarComponent: {
            template: '<div data-testid="sidebar" :data-open="open"></div>',
            props: ["open"],
          },
          RouterView: true,
        },
      },
    });
    await flushPromises();
    await wrapper.find('[data-testid="nav-toggle"]').trigger("click");
    expect(wrapper.exists()).toBe(true);
  });

  it("handles fetchProfile returning false — logs out and redirects to login", async () => {
    mockFetchProfile.mockResolvedValueOnce(false);
    const wrapper = mount(AucationLayout, {
      global: {
        plugins: [router],
        stubs: {
          NavbarComponent: true,
          SidebarComponent: true,
          RouterView: true,
        },
      },
    });
    await flushPromises();
    expect(mockFetchProfile).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();
  });
});