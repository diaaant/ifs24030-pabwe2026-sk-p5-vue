import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import ModalShell from "./ModalShell.vue";

describe("ModalShell", () => {
  it("renders title prop correctly", () => {
    const wrapper = mount(ModalShell, {
      props: { title: "Judul Modal" },
    });
    expect(wrapper.text()).toContain("Judul Modal");
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true);
  });

  it("renders slot content", () => {
    const wrapper = mount(ModalShell, {
      props: { title: "Test" },
      slots: { default: "<p>Isi Slot</p>" },
    });
    expect(wrapper.text()).toContain("Isi Slot");
  });

  it("emits close event when close button clicked", async () => {
    const wrapper = mount(ModalShell, {
      props: { title: "Test" },
    });
    await wrapper.find('[data-testid="modal-close"]').trigger("click");
    expect(wrapper.emitted()).toHaveProperty("close");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});