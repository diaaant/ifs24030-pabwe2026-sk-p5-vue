import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";

const mockChangeProfile = vi.fn(() => Promise.resolve(true));
const mockChangePhoto = vi.fn(() => Promise.resolve(true));
const mockChangePassword = vi.fn(() => Promise.resolve(true));

vi.mock("../states/usersStore.js", () => ({
  useUsersStore: () => ({
    profile: { name: "Dian", email: "dian@test.com" },
    isProfileChange: false,
    changeProfile: mockChangeProfile,
    changePhoto: mockChangePhoto,
    changePassword: mockChangePassword,
  }),
}));

vi.mock("../../../helpers/toolsHelper.js", () => ({
  showWarningDialog: vi.fn(() => Promise.resolve()),
}));

import ProfilePage from "./ProfilePage.vue";
import { showWarningDialog } from "../../../helpers/toolsHelper.js";

describe("ProfilePage", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("renders page title", () => {
    const wrapper = mount(ProfilePage);
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("renders profile form fields", () => {
    const wrapper = mount(ProfilePage);
    expect(wrapper.find('[data-testid="profile-name"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="profile-email"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="profile-photo"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="old-password"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="new-password"]').exists()).toBe(true);
  });

  it("pre-fills name and email from store", async () => {
    const wrapper = mount(ProfilePage);
    await flushPromises();
    expect(wrapper.find('[data-testid="profile-name"]').element.value).toBe("Dian");
    expect(wrapper.find('[data-testid="profile-email"]').element.value).toBe("dian@test.com");
  });

  it("calls changeProfile on form submit", async () => {
    const wrapper = mount(ProfilePage);
    await flushPromises();
    await wrapper.find("form").trigger("submit.prevent");
    expect(mockChangeProfile).toHaveBeenCalled();
  });

  it("shows warning when saving photo without file", async () => {
    const wrapper = mount(ProfilePage);
    const forms = wrapper.findAll("form");
    await forms[1].trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu");
  });

  it("shows warning when password fields empty", async () => {
    const wrapper = mount(ProfilePage);
    const forms = wrapper.findAll("form");
    await forms[2].trigger("submit.prevent");
    await flushPromises();
    expect(showWarningDialog).toHaveBeenCalledWith("Isi kata sandi lama dan baru");
  });

  it("calls changePassword when both password fields filled", async () => {
    const wrapper = mount(ProfilePage);
    await wrapper.find('[data-testid="old-password"]').setValue("oldpass");
    await wrapper.find('[data-testid="new-password"]').setValue("newpass");
    const forms = wrapper.findAll("form");
    await forms[2].trigger("submit.prevent");
    await flushPromises();
    expect(mockChangePassword).toHaveBeenCalled();
  });
});