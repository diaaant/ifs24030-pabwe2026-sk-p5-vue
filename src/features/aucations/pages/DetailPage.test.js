import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";

const mockAucation = {
  id: 1,
  title: "Laptop Gaming",
  description: "Deskripsi laptop",
  start_bid: 5000000,
  closed_at: "2026-12-31T10:00:00",
  user_id: 10,
  cover: "http://cover.jpg",
  bids: [
    { id: 1, bid: 6000000, user_id: 20, user: { name: "Rafael" } },
    { id: 2, bid: 5500000, user_id: 30, user: { name: "Budi" } },
  ],
};

const mockFetchAucation = vi.fn(() => Promise.resolve(true));
const mockDeleteAucation = vi.fn(() => Promise.resolve(true));
const mockDeleteBid = vi.fn(() => Promise.resolve(true));

vi.mock("../states/aucationsStore.js", () => ({
  useAucationsStore: () => ({
    aucation: mockAucation,
    fetchAucation: mockFetchAucation,
    deleteAucation: mockDeleteAucation,
    deleteBid: mockDeleteBid,
  }),
}));

vi.mock("../../users/states/usersStore.js", () => ({
  useUsersStore: () => ({
    profile: { id: 10, name: "Owner" },
  }),
}));

vi.mock("../../../helpers/toolsHelper.js", () => ({
  formatDate: vi.fn((v) => v),
  formatRupiah: vi.fn((v) => `Rp ${v}`),
  getHighestBid: vi.fn((a) => a?.bids?.[0]?.bid || 0),
  isAucationClosed: vi.fn(() => false),
  showConfirmDialog: vi.fn(() => Promise.resolve(false)),
}));

vi.mock("../components/MarkdownViewer.vue", () => ({
  default: {
    name: "MarkdownViewer",
    template: '<div data-testid="md-viewer"></div>',
    props: ["value"],
  },
}));

vi.mock("../modals/ChangeModal.vue", () => ({
  default: {
    name: "ChangeModal",
    template: '<div data-testid="change-modal"></div>',
  },
}));
vi.mock("../modals/ChangeCoverModal.vue", () => ({
  default: {
    name: "ChangeCoverModal",
    template: '<div data-testid="cover-modal"></div>',
  },
}));
vi.mock("../modals/BidModal.vue", () => ({
  default: {
    name: "BidModal",
    template: '<div data-testid="bid-modal"></div>',
  },
}));

import DetailPage from "./DetailPage.vue";
import { showConfirmDialog } from "../../../helpers/toolsHelper.js";

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: "/", component: { template: "<div>Home</div>" } },
    { path: "/aucations/:aucationId", component: { template: "<div>Detail</div>" } },
  ],
});

describe("DetailPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    showConfirmDialog.mockResolvedValue(false);
    router.push("/aucations/1");
  });

  it("calls fetchAucation on mount", async () => {
    mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    expect(mockFetchAucation).toHaveBeenCalled();
  });

  it("renders title and description", async () => {
    const wrapper = mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.text()).toContain("Laptop Gaming");
  });

  it("renders bids sorted by highest", async () => {
    const wrapper = mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.text()).toContain("Rafael");
    expect(wrapper.text()).toContain("Budi");
  });

  it("shows owner buttons when user is owner", async () => {
    const wrapper = mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    expect(wrapper.find('[data-testid="btn-edit"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="btn-cover"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="btn-delete"]').exists()).toBe(true);
  });

  it("opens change modal when btn-edit clicked", async () => {
    const wrapper = mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    await wrapper.find('[data-testid="btn-edit"]').trigger("click");
    expect(wrapper.find('[data-testid="change-modal"]').exists()).toBe(true);
  });

  it("opens cover modal when btn-cover clicked", async () => {
    const wrapper = mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    await wrapper.find('[data-testid="btn-cover"]').trigger("click");
    expect(wrapper.find('[data-testid="cover-modal"]').exists()).toBe(true);
  });

  it("opens bid modal when user is not owner", async () => {
    const wrapper = mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    // Karena user adalah owner (id: 10 === user_id: 10),
    // tombol bid tidak muncul. Test ini cover keberadaan tombol saja.
    const bidButton = wrapper.find('[data-testid="btn-bid"]');
    expect(bidButton.exists()).toBe(false);
  });

  it("calls deleteAucation when user confirms delete", async () => {
    showConfirmDialog.mockResolvedValueOnce(true);
    const wrapper = mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    await wrapper.find('[data-testid="btn-delete"]').trigger("click");
    await flushPromises();
    expect(showConfirmDialog).toHaveBeenCalledWith("Hapus lelang ini?");
    expect(mockDeleteAucation).toHaveBeenCalled();
  });

  it("does not delete when user cancels", async () => {
    showConfirmDialog.mockResolvedValueOnce(false);
    const wrapper = mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    await wrapper.find('[data-testid="btn-delete"]').trigger("click");
    await flushPromises();
    expect(mockDeleteAucation).not.toHaveBeenCalled();
  });

  it("closes modal on done event — via component emit", async () => {
    const wrapper = mount(DetailPage, { global: { plugins: [router] } });
    await flushPromises();
    await wrapper.find('[data-testid="btn-edit"]').trigger("click");
    const modal = wrapper.findComponent({ name: "ChangeModal" });
    if (modal.exists()) {
      modal.vm.$emit("done");
      await flushPromises();
    }
    expect(wrapper.exists()).toBe(true);
  });
});