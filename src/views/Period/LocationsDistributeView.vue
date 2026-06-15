<template>
  <StatusDialog
    v-model="statusDialog.show"
    :type="statusDialog.type"
    :message="statusDialog.message"
  />

  <div class="d-flex align-center">
    <h2>
      據點配送模式
      <small class="font-weight-regular text-grey-lighten-1">目前期別：{{ period.name }}</small>
    </h2>
    <v-spacer> </v-spacer>
    <v-btn color="grey-darken-1" variant="text" :to="`/periods/${periodId}/locations`">
      回清單
    </v-btn>
    <v-btn color="grey-darken-1" variant="outlined" elevation="1" @click="goBack"> 上一頁 </v-btn>
  </div>

  <p>
    目前據點：<span class="text-display-small font-weight-bold text-primary">{{
      locationsList[0]?.name
    }}</span>
  </p>

  <v-data-table
    :headers="headers"
    :items="recordsList"
    :items-per-page="-1"
    :row-props="getRowClass"
    hide-default-footer
    no-data-text="無"
  >
    <template v-slot:[`item.code`]="{ item }">
      <v-btn variant="text" :to="`/periods/${periodId}/items/${item.item_id}/distribute`">
        {{ item.code }}
      </v-btn>
    </template>

    <template v-slot:[`item.type`]="{ item }">
      <v-chip variant="flat" v-if="item.type" :color="typeClass(item.type)">
        {{ item.type }}
      </v-chip>
    </template>

    <template v-slot:[`item.actions`]="{ item }">
      <v-checkbox
        v-model="item.status"
        :label="`${item.status ? 'OK' : 'NO'}`"
        :color="`${item.status ? 'green' : ''}`"
        :true-value="1"
        :false-value="0"
        @update:model-value="recordEdit(item)"
        hide-details
      >
      </v-checkbox>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../api';

// 狀態彈窗
const statusDialog = ref({
  show: false,
  type: 'success', // 'success' 或 'error',
  message: '',
})

const route = useRoute()
const router = useRouter()

const goBack = () => {
  // 檢查瀏覽器的歷史紀錄長度
  // 如果大於 1，代表他是從別頁點過來的；如果小於等於 1，代表他是直接開這頁的
  if (window.history.length > 1) {
    router.back()
  } else {
    // 🛡️ 沒歷史紀錄時的安全防禦防線：彈回你的特定預設頁面
    router.push(`/periods/${periodId}/items`)
  }
}

const periodId = route.params.periodId
const locationId = route.params.locationId

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

const locationsList = ref<Items[]>([])
const recordsList = ref<Records[]>([])

const loadLocations = async () => {
  try {
    const result = await apiClient.post('/api/locations/get', {
      periodId: periodId,
      locationId: locationId,
    })

    if (result.data.success) {
      locationsList.value = result.data.data
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}

const loadRecords = async () => {
  try {
    const result = await apiClient.post('/api/records/search', {
      periodId: periodId,
      locationId: locationId,
    })

    if (result.data.success) {
      recordsList.value = result.data.data

      recordsList.value = recordsList.value.filter((record) => record.quantity > 0)
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}

onMounted(() => {
  if (periodId && locationId) {
    loadLocations()
    loadRecords()
  }
})

const headers = [
  {
    title: '品項',
    value: 'code',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 100px;',
    },
  },
  {
    title: '類型',
    value: 'type',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 120px;',
    },
  },
  {
    title: '數量',
    value: 'quantity',
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

const typeClass = (type: string) => {
  switch (type) {
    case '信':
      return 'brown'
    case '單':
      return 'teal'
    case '釘':
      return 'grey'
    case '摺':
      return 'indigo'
    case '糊':
      return 'pink'
    default:
      return ''
  }
}

const getRowClass = ({ index, item }: { index: number; item: Records }) => {
  if (item.status === 1) {
    return { class: 'bg-green-lighten-4' }
  } else if (index % 2 === 0) {
    return { class: 'bg-grey-lighten-3' }
  }

  return {}
}

async function recordEdit(record: Records) {
  try {
    await apiClient.put('/api/records/edit', {
      id: record.record_id,
      status: record.status,
    })

    // loadRecords()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('編輯狀態失敗:', msg)
  }
}
</script>

<style scoped></style>
