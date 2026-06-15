<template>
  <div class="d-flex align-center">
    <h3>目前期別：{{ period.name }}</h3>
    <v-spacer> </v-spacer>
    <v-btn color="grey-darken-1" variant="outlined" elevation="1" :to="`/`"> 上一頁 </v-btn>
  </div>

  <v-tabs color="primary">
    <v-tab :to="`/periods/${period.id}/items`">品項清單</v-tab>
    <v-tab :to="`/periods/${period.id}/locations`">據點清單</v-tab>
  </v-tabs>

  <RouterView />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import { RouterView } from 'vue-router'

import { usePeriodStore } from '@/stores/usePeriodStore'

const periodStore = usePeriodStore()

const period = ref<Periods>({
  id: 0,
  name: '',
  created_at: '',
})

onMounted(() => {
  period.value = periodStore.currentPeriod
})
</script>
