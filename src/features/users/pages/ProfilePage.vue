<script setup>
import { ref, watch } from "vue";
import { KeyRound, ImagePlus, Save } from "lucide-vue-next";
import { useUsersStore } from "../states/usersStore.js";
import { useInput } from "../../../hooks/useInput.js";
import { showWarningDialog } from "../../../helpers/toolsHelper.js";

const store = useUsersStore();
const [name, onName, setName] = useInput("");
const [email, onEmail, setEmail] = useInput("");
const [oldPassword, onOldPassword, setOldPassword] = useInput("");
const [newPassword, onNewPassword, setNewPassword] = useInput("");
const photo = ref(null);

watch(
  () => store.profile,
  (p) => {
    setName(p?.name || "");
    setEmail(p?.email || "");
  },
  { immediate: true }
);

const onPhoto = (e) => {
  photo.value = e.target.files[0] || null;
};
const saveProfile = () => store.changeProfile({ name: name.value, email: email.value });
const savePhoto = async () => {
  if (!photo.value) return showWarningDialog("Pilih foto terlebih dahulu");
  await store.changePhoto(photo.value);
};
const savePassword = async () => {
  if (!oldPassword.value || !newPassword.value) return showWarningDialog("Isi kata sandi lama dan baru");
  if (await store.changePassword({ password: oldPassword.value, new_password: newPassword.value })) {
    setOldPassword("");
    setNewPassword("");
  }
};
const box = "rounded-2xl bg-white p-5 shadow-sm space-y-3";
const input = "w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500";
const btn = "flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60";
</script>

<template>
  <section class="max-w-2xl space-y-4">
    <h1 class="text-2xl font-extrabold">Profil Saya</h1>
    <form :class="box" @submit.prevent="saveProfile">
      <h2 class="font-bold">Data Akun</h2>
      <input :value="name" :class="input" placeholder="Nama" data-testid="profile-name" @input="onName" />
      <input :value="email" type="email" :class="input" placeholder="Email" data-testid="profile-email" @input="onEmail" />
      <button type="submit" :disabled="store.isProfileChange" :class="btn"><Save :size="16" /> Simpan</button>
    </form>
    <form :class="box" @submit.prevent="savePhoto">
      <h2 class="font-bold">Foto Profil</h2>
      <input type="file" accept="image/*" data-testid="profile-photo" @change="onPhoto" />
      <button type="submit" :disabled="store.isProfileChange" :class="btn"><ImagePlus :size="16" /> Unggah Foto</button>
    </form>
    <form :class="box" @submit.prevent="savePassword">
      <h2 class="font-bold">Ubah Kata Sandi</h2>
      <input :value="oldPassword" type="password" :class="input" placeholder="Kata sandi lama" data-testid="old-password" @input="onOldPassword" />
      <input :value="newPassword" type="password" :class="input" placeholder="Kata sandi baru" data-testid="new-password" @input="onNewPassword" />
      <button type="submit" :disabled="store.isProfileChange" :class="btn"><KeyRound :size="16" /> Ubah Kata Sandi</button>
    </form>
  </section>
</template>
