import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mockChangeAucation = vi.fn(() => Promise.resolve(true));
vi.mock("../states/aucationsStore.js", () => ({
  useAucationsStore: () => ({
    changeAucation: mockChangeAucation,
    isAucationChange: false,
  }),
}));

vi.mock("../../../helpers/toolsHelper.js", () => ({
  showWarningDialog: vi.fn(() => Promise.resolve()),
  toApiDate: vi.fn((v) => v),
}));

vi.mock("../components/MarkdownEditor.vue", () => ({
  default: {
    name: "MarkdownEditor",
    template: '<div data-testid="markdown-editor-mock"></div>',
    props: ["modelValue"],
  },
}));

import ChangeModal from "./ChangeModal.vue";
import { showWarningDialog } from "../../../helpers/toolsHelper.js";

const mockAucation = {
  id: 1,
  title: "Barang Lama",
  description: "Deskripsi lama",
  start_bid: 100000,
  closed_at: "2026-12-31 10:00:00",
};

describe("ChangeModal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockChangeAucation.mockResolvedValue(true);
  });

  it("renders form inputs with pre-filled values", () => {
    const wrapper = mount(ChangeModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    expect(wrapper.find('[data-testid="change-title"]').element.value).toBe("Barang Lama");
    expect(wrapper.find('[data-testid="change-start-bid"]').element.value).toBe("100000");
  });

  it("shows warning when required fields empty", async () => {
    const wrapper = mount(ChangeModal, {
      props: { aucation: { ...mockAucation, title: "" } },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find('[data-testid="change-title"]').setValue("");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalled();
  });

  it("calls changeAucation when form valid", async () => {
    const wrapper = mount(ChangeModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find('[data-testid="change-title"]').setValue("Barang Baru");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(mockChangeAucation).toHaveBeenCalled();
  });

  it("emits done when changeAucation succeeds", async () => {
    const wrapper = mount(ChangeModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find('[data-testid="change-title"]').setValue("Barang Baru");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(wrapper.emitted()).toHaveProperty("done");
  });

  it("does not emit done when changeAucation returns false", async () => {
    mockChangeAucation.mockResolvedValueOnce(false);
    const wrapper = mount(ChangeModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find('[data-testid="change-title"]').setValue("Barang Baru");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(wrapper.emitted("done")).toBeUndefined();
  });

  it("updates startBid input value on typing", async () => {
    const wrapper = mount(ChangeModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    const input = wrapper.find('[data-testid="change-start-bid"]');
    await input.setValue("200000");
    expect(input.element.value).toBe("200000");
  });

  it("updates closedAt input value on typing", async () => {
    const wrapper = mount(ChangeModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    const input = wrapper.find('[data-testid="change-closed-at"]');
    await input.setValue("2026-12-31T15:00");
    expect(input.element.value).toBe("2026-12-31T15:00");
  });
});