import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { createRouter, createMemoryHistory } from "vue-router";
import SidebarComponent from "./SidebarComponent.vue";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/users", component: { template: "<div>Users</div>" } },
    { path: "/profile", component: { template: "<div>Profile</div>" } },
  ],
});

describe("SidebarComponent", () => {
  it("renders navigation links", () => {
    const wrapper = mount(SidebarComponent, {
      props: { open: false },
      global: { plugins: [router] },
    });
    expect(wrapper.text()).toContain("Dashboard Lelang");
    expect(wrapper.text()).toContain("Daftar Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("emits close when backdrop clicked", async () => {
    const wrapper = mount(SidebarComponent, {
      props: { open: true },
      global: { plugins: [router] },
    });
    await wrapper.find('[data-testid="sidebar-backdrop"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("close");
  });

  it("emits close when close button clicked", async () => {
    const wrapper = mount(SidebarComponent, {
      props: { open: true },
      global: { plugins: [router] },
    });
    await wrapper.find('[data-testid="btn-close"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("close");
  });

  it("applies translate class when open", () => {
    const wrapper = mount(SidebarComponent, {
      props: { open: true },
      global: { plugins: [router] },
    });
    expect(wrapper.find("aside").classes()).toContain("translate-x-0");
  });
});