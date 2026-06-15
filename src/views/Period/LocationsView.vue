<template>
  <v-data-table
    :headers="headers"
    :items="locationsList"
    :items-per-page="-1"
    :row-props="getRowClass"
    hide-default-footer
    no-data-text="無"
  >
    <template v-slot:[`item.actions`]="{ item }">
      <div class="d-flex align-center">
        <v-btn variant="text" :to="`/periods/${periodId}/locations/${item.id}/distribute`">
          <v-icon>mdi-pencil</v-icon>
          配送模式
        </v-btn>
        <v-checkbox
          :model-value="item.status"
          :true-value="1"
          :false-value="0"
          hide-details
          disabled
        ></v-checkbox>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../../api';

const route = useRoute()

const periodId = route.params.id

const locationsList = ref<Items[]>([])

const loadLocations = async () => {
  try {
    const result = await apiClient.post('/api/locations/get', {
      periodId: periodId,
    })

    if (result.data.success) {
      locationsList.value = result.data.data
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}

onMounted(() => {
  if (periodId) {
    loadLocations()
  }
})

const headers = [
  {
    title: '名稱',
    value: 'name',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
    },
  },
  {
    title: '操作',
    value: 'actions',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 200px;',
    },
  },
]

const getRowClass = ({ index, item }: { index: number; item: Items }) => {
  if (item.status) {
    return { class: 'bg-green-lighten-4' }
  } else if (index % 2 === 0) {
    return { class: 'bg-grey-lighten-3' }
  }
}
</script>

<style scoped></style>
