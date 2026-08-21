<template>
  <teleport to="body">
    <div class="w-a4">
      <v-row class="gap-2">
        <v-col cols="4" v-for="item in printItemsStore.selectPrintItems" :key="item.id">
          <p class="text-center">{{ item.code }}</p>
          <v-data-table
            :headers="headers"
            :items="Object.entries(item.pack?.detail ?? {})"
            :items-per-page="-1"
            item-value="id"
            hide-default-footer
            no-data-text="無"
            class="border custom-table"
          >
          </v-data-table>
        </v-col>
      </v-row>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { usePrintItemsStore } from '@/stores/usePrintItemsStore'

const printItemsStore = usePrintItemsStore()

const headers = [
  {
    title: '單位',
    value: '0',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
    },
  },
  {
    title: '數量',
    value: '1.quantity',
    sortable: true,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 120px;',
    },
  },
]
</script>

<style scoped>
.w-a4 {
  width: 18cm;
}

.z-9999 {
  z-index: 9999;
}
</style>
