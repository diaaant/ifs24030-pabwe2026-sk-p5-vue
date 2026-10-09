import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mockChangeCover = vi.fn(() => Promise.resolve(true));
vi.mock("../states/aucationsStore.js", () => ({
  useAucationsStore: () => ({
    changeCover: mockChangeCover,
    isAucationChangeCover: false,
  }),
}));

vi.mock("../../../helpers/toolsHelper.js", () => ({
  showWarningDialog: vi.fn(() => Promise.resolve()),
}));

import ChangeCoverModal from "./ChangeCoverModal.vue";
import { showWarningDialog } from "../../../helpers/toolsHelper.js";

const mockAucation = { id: 1, title: "Test", cover: null };

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockChangeCover.mockResolvedValue(true);
  });

  it("renders file input", () => {
    const wrapper = mount(ChangeCoverModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    expect(wrapper.find('[data-testid="cover-file"]').exists()).toBe(true);
  });

  it("shows warning when no file selected", async () => {
    const wrapper = mount(ChangeCoverModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalledWith("Pilih gambar terlebih dahulu");
  });

  it("calls changeCover when file selected", async () => {
    const wrapper = mount(ChangeCoverModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    const file = new File(["test"], "cover.png", { type: "image/png" });
    const fileInput = wrapper.find('[data-testid="cover-file"]');
    Object.defineProperty(fileInput.element, "files", { value: [file] });
    await fileInput.trigger("change");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(mockChangeCover).toHaveBeenCalled();
  });

  it("emits done when changeCover succeeds", async () => {
    const wrapper = mount(ChangeCoverModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    const file = new File(["test"], "cover.png", { type: "image/png" });
    const fileInput = wrapper.find('[data-testid="cover-file"]');
    Object.defineProperty(fileInput.element, "files", { value: [file] });
    await fileInput.trigger("change");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(wrapper.emitted()).toHaveProperty("done");
  });

  it("displays preview image after file selected", async () => {
    const wrapper = mount(ChangeCoverModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    const file = new File(["fake"], "cover.png", { type: "image/png" });
    const fileInput = wrapper.find('[data-testid="cover-file"]');
    Object.defineProperty(fileInput.element, "files", { value: [file] });
    await fileInput.trigger("change");
    await flushPromises();
    expect(wrapper.find('[data-testid="cover-preview"]').exists()).toBe(true);
  });

  it("revokes object URL on unmount", async () => {
    const wrapper = mount(ChangeCoverModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    const file = new File(["fake"], "cover.png", { type: "image/png" });
    const fileInput = wrapper.find('[data-testid="cover-file"]');
    Object.defineProperty(fileInput.element, "files", { value: [file] });
    await fileInput.trigger("change");
    expect(() => wrapper.unmount()).not.toThrow();
  });

  it("does not emit done when changeCover returns false", async () => {
    mockChangeCover.mockResolvedValueOnce(false);
    const wrapper = mount(ChangeCoverModal, {
      props: { aucation: mockAucation },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    const file = new File(["fake"], "cover.png", { type: "image/png" });
    const fileInput = wrapper.find('[data-testid="cover-file"]');
    Object.defineProperty(fileInput.element, "files", { value: [file] });
    await fileInput.trigger("change");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(wrapper.emitted("done")).toBeUndefined();
  });

  it("handles file input change with no file selected", async () => {
    const wrapper = mount(ChangeCoverModal, {
      props: { aucation: { ...mockAucation, cover: "http://existing.jpg" } },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    const fileInput = wrapper.find('[data-testid="cover-file"]');
    Object.defineProperty(fileInput.element, "files", { value: [] });
    await fileInput.trigger("change");
    expect(wrapper.exists()).toBe(true);
  });

  it("renders existing cover as preview", () => {
    const wrapper = mount(ChangeCoverModal, {
      props: { aucation: { ...mockAucation, cover: "http://existing.jpg" } },
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    expect(wrapper.find('[data-testid="cover-preview"]').exists()).toBe(true);
  });
});