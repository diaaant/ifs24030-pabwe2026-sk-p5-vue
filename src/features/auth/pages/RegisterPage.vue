<script setup>
import { useRouter } from "vue-router";
import { Lock, Mail, User, UserPlus } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore.js";
import { useInput } from "../../../hooks/useInput.js";
import { showWarningDialog } from "../../../helpers/toolsHelper.js";

const router = useRouter();
const auth = useAuthStore();
const [name, onName] = useInput("");
const [email, onEmail] = useInput("");
const [password, onPassword] = useInput("");

async function submit() {
  if (!name.value || !email.value || !password.value) {
    await showWarningDialog("Semua kolom wajib diisi");
    return;
  }
  if (password.value.length < 6) {
    await showWarningDialog("Kata sandi minimal 6 karakter");
    return;
  }
  if (await auth.register(name.value, email.value, password.value))
    router.replace("/auth/login");
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <label class="block text-xs font-bold uppercase text-slate-700">
      Nama Lengkap
      <span
        class="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 font-normal normal-case"
      >
        <User :size="16" class="text-slate-600" />
        <input
          id="register-name-input"
          type="text"
          :value="name"
          placeholder="Nama kamu"
          class="w-full outline-none text-sm text-slate-900 placeholder:text-slate-500"
          data-testid="register-name"
          @input="onName"
        />
      </span>
    </label>
    <label class="block text-xs font-bold uppercase text-slate-700">
      Alamat Email
      <span
        class="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 font-normal normal-case"
      >
        <Mail :size="16" class="text-slate-600" />
        <input
          id="register-email-input"
          type="email"
          :value="email"
          placeholder="nama@email.com"
          class="w-full outline-none text-sm text-slate-900 placeholder:text-slate-500"
          data-testid="register-email"
          @input="onEmail"
        />
      </span>
    </label>
    <label class="block text-xs font-bold uppercase text-slate-700">
      Kata Sandi
      <span
        class="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 font-normal normal-case"
      >
        <Lock :size="16" class="text-slate-600" />
        <input
          id="register-password-input"
          type="password"
          :value="password"
          placeholder="Minimal 6 karakter"
          class="w-full outline-none text-sm text-slate-900 placeholder:text-slate-500"
          data-testid="register-password"
          @input="onPassword"
        />
      </span>
    </label>
    <button
      id="register-submit-button"
      type="submit"
      :disabled="auth.isAuthRegister"
      class="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
    >
      <UserPlus :size="16" />
      {{ auth.isAuthRegister ? "Memproses..." : "Daftar Sekarang" }}
    </button>
  </form>
</template>
