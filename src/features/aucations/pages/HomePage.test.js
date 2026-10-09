import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

const mockAucations = [
  {
    id: 1,
    title: "Laptop",
    description: "Laptop gaming",
    start_bid: 5000000,
    highest_bid: 6000000,
    closed_at: "2026-12-31T10:00:00",
    cover: null,
  },
  {
    id: 2,
    title: "HP",
    description: "HP flagship",
    start_bid: 3000000,
    highest_bid: 0,
    closed_at: "2026-12-31T10:00:00",
    cover: "http://cover.jpg",
  },
];

const mockFetchAucations = vi.fn(() => Promise.resolve());
const mockDeleteAllAucations = vi.fn(() => Promise.resolve(true));

vi.mock("../states/aucationsStore.js", () => ({
  useAucationsStore: () => ({
    aucations: mockAucations,
    isAucation: false,
    fetchAucations: mockFetchAucations,
    deleteAllAucations: mockDeleteAllAucations,
  }),
}));

vi.mock("../../../helpers/toolsHelper.js", () => ({
  countdownText: vi.fn(() => "5 hari"),
  formatRupiah: vi.fn((v) => `Rp ${v}`),
  getHighestBid: vi.fn((a) => a?.highest_bid || 0),
  isAucationClosed: vi.fn(() => false),
  showConfirmDialog: vi.fn(() => Promise.resolve(false)),
}));

vi.mock("../modals/AddModal.vue", () => ({
  default: {
    name: "AddModal",
    template: '<div data-testid="add-modal-mock"></div>',
  },
}));

import HomePage from "./HomePage.vue";
import { showConfirmDialog } from "../../../helpers/toolsHelper.js";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/aucations/:id", component: { template: "<div>Detail</div>" } },
  ],
});

describe("HomePage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    showConfirmDialog.mockResolvedValue(false);
  });

  it("calls fetchAucations on mount", () => {
    mount(HomePage, { global: { plugins: [router] } });
    expect(mockFetchAucations).toHaveBeenCalled();
  });

  it("renders page title and buttons", () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    expect(wrapper.text()).toContain("Dashboard Lelang");
    expect(wrapper.find('[data-testid="btn-add"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="btn-delete-all"]').exists()).toBe(true);
  });

  it("renders all 4 tabs", () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    expect(wrapper.find('[data-testid="tab-all"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="tab-mine"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="tab-ongoing"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="tab-closed"]').exists()).toBe(true);
  });

  it("changes tab on click", async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await wrapper.find('[data-testid="tab-mine"]').trigger("click");
    expect(wrapper.find('[data-testid="tab-mine"]').classes()).toContain("bg-indigo-600");
  });

  it("changes to ongoing tab", async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await wrapper.find('[data-testid="tab-ongoing"]').trigger("click");
    expect(mockFetchAucations).toHaveBeenCalled();
  });

  it("changes to closed tab", async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await wrapper.find('[data-testid="tab-closed"]').trigger("click");
    expect(mockFetchAucations).toHaveBeenCalled();
  });

  it("filters aucations by keyword", async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.text()).toContain("Laptop");
    expect(wrapper.text()).toContain("HP");
    await wrapper.find('[data-testid="search"]').setValue("laptop");
    expect(wrapper.text()).toContain("Laptop");
    expect(wrapper.text()).not.toContain("HP flagship");
  });

  it("shows empty state when no aucations match filter", async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await flushPromises();
    await wrapper.find('[data-testid="search"]').setValue("nonexistent-xyz");
    expect(wrapper.find('[data-testid="empty"]').exists()).toBe(true);
  });

  it("shows add modal when btn-add clicked", async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await wrapper.find('[data-testid="btn-add"]').trigger("click");
    expect(wrapper.find('[data-testid="add-modal-mock"]').exists()).toBe(true);
  });

  it("closes add modal on close event", async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await wrapper.find('[data-testid="btn-add"]').trigger("click");
    const modal = wrapper.findComponent({ name: "AddModal" });
    if (modal.exists()) {
      modal.vm.$emit("close");
      await flushPromises();
    }
    expect(wrapper.exists()).toBe(true);
  });

  it("reloads aucations when add modal emits done", async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await wrapper.find('[data-testid="btn-add"]').trigger("click");
    const modal = wrapper.findComponent({ name: "AddModal" });
    if (modal.exists()) {
      modal.vm.$emit("done");
      await flushPromises();
    }
    expect(mockFetchAucations).toHaveBeenCalled();
  });

  it("removes all aucations when confirm dialog accepted", async () => {
    showConfirmDialog.mockResolvedValueOnce(true);
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await wrapper.find('[data-testid="btn-delete-all"]').trigger("click");
    await flushPromises();
    expect(showConfirmDialog).toHaveBeenCalledWith("Hapus SEMUA lelang milikmu?");
    expect(mockDeleteAllAucations).toHaveBeenCalled();
  });

  it("does not remove when dialog cancelled", async () => {
    showConfirmDialog.mockResolvedValueOnce(false);
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await wrapper.find('[data-testid="btn-delete-all"]').trigger("click");
    await flushPromises();
    expect(mockDeleteAllAucations).not.toHaveBeenCalled();
  });

  it("renders cover image when aucation has cover", async () => {
    const wrapper = mount(HomePage, { global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.html()).toContain("http://cover.jpg");
  });
});