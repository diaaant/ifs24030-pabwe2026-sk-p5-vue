import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { createRouter, createMemoryHistory } from "vue-router";
import AuthLayout from "./AuthLayout.vue";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/auth/login", component: { template: "<div>Login</div>" } },
    { path: "/auth/register", component: { template: "<div>Register</div>" } },
  ],
});

describe("AuthLayout", () => {
  it("renders app title and brand", () => {
    const wrapper = mount(AuthLayout, {
      global: {
        plugins: [router],
        stubs: { RouterView: true },
      },
    });
    expect(wrapper.text()).toContain("Delcom Auction");
    expect(wrapper.text()).toContain("Platform Lelang Online Modern");
  });

  it("renders login and register tabs", () => {
    const wrapper = mount(AuthLayout, {
      global: {
        plugins: [router],
        stubs: { RouterView: true },
      },
    });
    expect(wrapper.text()).toContain("Masuk Akun");
    expect(wrapper.text()).toContain("Daftar Baru");
  });

  // ✅ Test tambahan untuk cover baris 20-21 (yang tadinya uncovered)
  it("renders RouterView outlet", () => {
    const wrapper = mount(AuthLayout, {
      global: {
        plugins: [router],
        stubs: { RouterView: { template: '<div data-testid="outlet">Outlet</div>' } },
      },
    });
    expect(wrapper.find('[data-testid="outlet"]').exists()).toBe(true);
  });
});