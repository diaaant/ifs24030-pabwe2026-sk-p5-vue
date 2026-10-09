import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @toast-ui/editor (karena library ini butuh DOM kompleks)
vi.mock("@toast-ui/editor", () => ({
  default: {
    factory: vi.fn(() => ({
      setMarkdown: vi.fn(),
    })),
  },
}));

// Mock CSS imports
vi.mock("@toast-ui/editor/dist/toastui-editor-viewer.css", () => ({}));

import MarkdownViewer from "./MarkdownViewer.vue";

describe("MarkdownViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    const wrapper = mount(MarkdownViewer, {
      props: { value: "# Hello" },
    });
    expect(wrapper.find('[data-testid="markdown-viewer"]').exists()).toBe(true);
  });

  it("renders with default empty value", () => {
    const wrapper = mount(MarkdownViewer);
    expect(wrapper.exists()).toBe(true);
  });
});