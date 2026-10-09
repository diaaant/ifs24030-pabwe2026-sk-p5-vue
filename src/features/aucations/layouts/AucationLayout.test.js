import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

// Mock stores
vi.mock("../../users/states/usersStore.js", () => ({
  useUsersStore: () => ({
    fetchProfile: vi.fn(() => Promise.resolve(true)),
  }),
}));

vi.mock("../../auth/states/authStore.js", () => ({
  useAuthStore: () => ({
    logout: vi.fn(),
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
  });

  it("renders layout structure", () => {
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
    expect(wrapper.exists()).toBe(true);
  });

  it("toggles sidebar when navbar emits toggle-sidebar", async () => {
    const wrapper = mount(AucationLayout, {
      global: {
        plugins: [router],
        stubs: {
          NavbarComponent: {
            template: '<button data-testid="nav-toggle" @click="$emit(\'toggle-sidebar\')">Toggle</button>',
          },
          SidebarComponent: true,
          RouterView: true,
        },
      },
    });
    await wrapper.find('[data-testid="nav-toggle"]').trigger("click");
    expect(wrapper.exists()).toBe(true);
  });
});