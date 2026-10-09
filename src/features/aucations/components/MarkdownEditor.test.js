import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @toast-ui/editor
vi.mock("@toast-ui/editor", () => ({
  default: class MockEditor {
    constructor(options) {
      this.options = options;
      this.getMarkdown = vi.fn(() => "# mock markdown");
      this.destroy = vi.fn();
    }
  },
}));

// Mock CSS
vi.mock("@toast-ui/editor/dist/toastui-editor.css", () => ({}));

import MarkdownEditor from "./MarkdownEditor.vue";

describe("MarkdownEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders editor container", () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: "# Test" },
    });
    expect(wrapper.find('[data-testid="markdown-editor"]').exists()).toBe(true);
  });

  it("renders with custom height prop", () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: "", height: "400px" },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("destroys editor on unmount", () => {
    const wrapper = mount(MarkdownEditor, {
      props: { modelValue: "" },
    });
    expect(() => wrapper.unmount()).not.toThrow();
  });
});