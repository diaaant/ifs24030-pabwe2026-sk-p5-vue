import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mockFetchUsers = vi.fn(() => Promise.resolve());
const mockUsers = [
  { id: 1, name: "Dian", email: "dian@test.com", photo: null },
  { id: 2, name: "Rafael", email: "rafael@test.com", photo: "http://example.com/photo.jpg" },
];

vi.mock("../states/usersStore.js", () => ({
  useUsersStore: () => ({
    users: mockUsers,
    isUsers: false,
    fetchUsers: mockFetchUsers,
  }),
}));

import UsersPage from "./UsersPage.vue";

describe("UsersPage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("calls fetchUsers on mount", () => {
    mount(UsersPage);
    expect(mockFetchUsers).toHaveBeenCalled();
  });

  it("renders page title", () => {
    const wrapper = mount(UsersPage);
    expect(wrapper.text()).toContain("Daftar Pengguna");
  });

  it("renders list of users", async () => {
    const wrapper = mount(UsersPage);
    await flushPromises();
    expect(wrapper.text()).toContain("Dian");
    expect(wrapper.text()).toContain("Rafael");
    expect(wrapper.text()).toContain("dian@test.com");
  });
});