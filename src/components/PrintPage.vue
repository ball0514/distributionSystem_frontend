<template>
  <!-- <teleport to="body"> -->
  <div class="print-container">
    <v-row v-for="(rowGroup, rowIndex) in printRows" :key="rowIndex" class="print-row gap-2">
      <v-col cols="4" v-for="item in rowGroup" :key="item.id" class="print-col">
        <div class="print-card">
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
        </div>
      </v-col>
    </v-row>
  </div>
  <!-- </teleport> -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const printRows = computed(() => {
  const items = printItemsStore.selectPrintItems ?? []
  const chunkSize = 3
  const chunks = []

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }

  return chunks
})
</script>

<style scoped></style>
