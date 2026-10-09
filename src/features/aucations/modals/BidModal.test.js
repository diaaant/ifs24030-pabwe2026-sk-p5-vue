import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mockAddBid = vi.fn(() => Promise.resolve(true));
vi.mock("../states/aucationsStore.js", () => ({
  useAucationsStore: () => ({
    addBid: mockAddBid,
    isBidAdd: false,
  }),
}));

vi.mock("../../../helpers/toolsHelper.js", () => ({
  formatRupiah: vi.fn((v) => `Rp ${v}`),
  getHighestBid: vi.fn((a) => a?.highest_bid || 0),
  showWarningDialog: vi.fn(() => Promise.resolve()),
}));

import BidModal from "./BidModal.vue";
import { showWarningDialog } from "../../../helpers/toolsHelper.js";

describe("BidModal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mockAucation = {
    id: 1,
    title: "Test",
    highest_bid: 500000,
  };

  it("renders highest bid display", () => {
    const wrapper = mount(BidModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    expect(wrapper.find('[data-testid="highest"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="bid-input"]').exists()).toBe(true);
  });

  it("shows warning when bid is empty", async () => {
    const wrapper = mount(BidModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalled();
  });

  it("shows warning when bid not higher than current highest", async () => {
    const wrapper = mount(BidModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find('[data-testid="bid-input"]').setValue("100000");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalled();
  });

  it("calls addBid when bid is valid", async () => {
    const wrapper = mount(BidModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find('[data-testid="bid-input"]').setValue("600000");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(mockAddBid).toHaveBeenCalledWith(1, 600000);
  });
});