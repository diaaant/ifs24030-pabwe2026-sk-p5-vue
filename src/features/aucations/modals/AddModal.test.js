import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

// Mock store
const mockAddAucation = vi.fn(() => Promise.resolve(true));
vi.mock("../states/aucationsStore.js", () => ({
  useAucationsStore: () => ({
    addAucation: mockAddAucation,
    isAucationAdd: false,
  }),
}));

// Mock tools
vi.mock("../../../helpers/toolsHelper.js", () => ({
  showWarningDialog: vi.fn(() => Promise.resolve()),
  toApiDate: vi.fn((v) => v),
}));

// Mock MarkdownEditor (biar tidak perlu load @toast-ui)
vi.mock("../components/MarkdownEditor.vue", () => ({
  default: {
    name: "MarkdownEditor",
    template: '<div data-testid="markdown-editor-mock"></div>',
    props: ["modelValue"],
  },
}));

import AddModal from "./AddModal.vue";
import { showWarningDialog } from "../../../helpers/toolsHelper.js";

describe("AddModal", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("renders form inputs", () => {
    const wrapper = mount(AddModal, {
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    expect(wrapper.find('[data-testid="add-title"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-start-bid"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="add-closed-at"]').exists()).toBe(true);
  });

  it("shows warning when required fields empty", async () => {
    const wrapper = mount(AddModal, {
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalledWith(
      "Judul, harga awal, dan batas waktu wajib diisi"
    );
  });

  it("calls addAucation when fields are filled", async () => {
    const wrapper = mount(AddModal, {
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find('[data-testid="add-title"]').setValue("Barang Test");
    await wrapper.find('[data-testid="add-start-bid"]').setValue("100000");
    await wrapper.find('[data-testid="add-closed-at"]').setValue("2026-12-31T10:00");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(mockAddAucation).toHaveBeenCalled();
  });

  it("emits done when addAucation succeeds", async () => {
    const wrapper = mount(AddModal, {
      global: { stubs: { ModalShell: { template: "<div><slot /></div>" } } },
    });
    await wrapper.find('[data-testid="add-title"]').setValue("Barang Test");
    await wrapper.find('[data-testid="add-start-bid"]').setValue("100000");
    await wrapper.find('[data-testid="add-closed-at"]').setValue("2026-12-31T10:00");
    await wrapper.find("form").trigger("submit.prevent");
    await flushPromises();
    expect(wrapper.emitted()).toHaveProperty("done");
  });
});