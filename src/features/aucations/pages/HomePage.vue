<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { RouterLink } from "vue-router";
import { Clock, Plus, Search, Trash2 } from "lucide-vue-next";
import AddModal from "../modals/AddModal.vue";
import { useAucationsStore } from "../states/aucationsStore.js";
import { countdownText, formatRupiah, getHighestBid, isAucationClosed, showConfirmDialog } from "../../../helpers/toolsHelper.js";

const store = useAucationsStore();
const route = useRoute();
const tabs = [
  { key: "all", label: "Semua Lelang", params: {} },
  { key: "mine", label: "Lelang Saya", params: { is_me: 1 } },
  { key: "ongoing", label: "Lelang Berlangsung", params: { is_closed: 0 } },
  { key: "closed", label: "Lelang Ditutup", params: { is_closed: 1 } },
];
const tab = ref(route.query.mine ? "mine" : "all");
const keyword = ref("");
const showAdd = ref(false);

const load = () => store.fetchAucations(tabs.find((t) => t.key === tab.value).params);
const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase();
  return store.aucations.filter((a) => !k || `${a.title} ${a.description || ""}`.toLowerCase().includes(k));
});

onMounted(load);
watch(tab, load);

async function added() {
  showAdd.value = false;
  await load();
}
async function removeAll() {
  if (await showConfirmDialog("Hapus SEMUA lelang milikmu?")) {
    await store.deleteAllAucations();
    await load();
  }
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h1 class="text-2xl font-extrabold">Dashboard Lelang</h1>
      <div class="flex gap-2">
        <button class="flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600" data-testid="btn-delete-all" @click="removeAll"><Trash2 :size="16" /> Hapus Semua</button>
        <button class="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-sm font-semibold text-white" data-testid="btn-add" @click="showAdd = true"><Plus :size="16" /> Tambah Lelang</button>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button v-for="t in tabs" :key="t.key" :class="['rounded-full px-4 py-1.5 text-sm font-semibold', tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 shadow-sm']" :data-testid="`tab-${t.key}`" @click="tab = t.key">{{ t.label }}</button>
    </div>

    <label class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <Search :size="16" class="text-slate-400" />
      <input v-model="keyword" placeholder="Cari judul atau deskripsi..." class="w-full text-sm outline-none" data-testid="search" />
    </label>

    <p v-if="store.isAucation" class="text-slate-500">Memuat lelang...</p>
    <p v-else-if="!filtered.length" class="text-slate-500" data-testid="empty">Belum ada lelang.</p>

    <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="a in filtered" :key="a.id" class="overflow-hidden rounded-2xl bg-white shadow-sm">
        <img v-if="a.cover" :src="a.cover" :alt="a.title" class="h-40 w-full object-cover" />
        <div v-else class="grid h-40 place-items-center bg-slate-100 text-slate-400">Tanpa cover</div>
        <div class="space-y-1.5 p-4">
          <RouterLink :to="`/aucations/${a.id}`" class="line-clamp-1 font-bold hover:text-indigo-600">{{ a.title }}</RouterLink>
          <p class="text-xs text-slate-500">Harga awal: {{ formatRupiah(a.start_bid) }}</p>
          <p class="text-sm font-bold text-indigo-600">Tertinggi: {{ formatRupiah(getHighestBid(a)) }}</p>
          <p :class="['flex items-center gap-1 text-xs font-semibold', isAucationClosed(a) ? 'text-red-500' : 'text-emerald-600']"><Clock :size="12" /> {{ countdownText(a.closed_at) }}</p>
        </div>
      </li>
    </ul>

    <AddModal v-if="showAdd" @close="showAdd = false" @done="added" />
  </section>
</template>
