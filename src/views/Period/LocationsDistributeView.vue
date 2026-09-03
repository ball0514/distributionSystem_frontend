<template>
  <StatusDialog
    v-model="statusDialog.show"
    :type="statusDialog.type"
    :message="statusDialog.message"
  />

  <v-app-bar app fixed class="px-8">
    <h2>
      據點配送模式
      <small class="font-weight-regular text-grey-lighten-1">目前期別：{{ period.name }}</small>
    </h2>
    <v-spacer> </v-spacer>
    <v-btn color="grey-darken-1" variant="text" :to="`/periods/${periodId}/locations`">
      回清單
    </v-btn>
    <v-btn color="grey-darken-1" variant="outlined" elevation="1" @click="goBack"> 上一頁 </v-btn>
  </v-app-bar>

  <v-main>
    <p>
      目前據點：<span class="text-display-small font-weight-bold text-primary">{{
        locationsList[0]?.name
      }}</span>
    </p>
    <v-tabs v-model="tab" color="primary">
      <v-tab value="one">一欄快速點擊</v-tab>
      <v-tab value="two">兩欄分類資料</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="one">
        <v-data-table
          :headers="headers"
          :items="recordsList"
          :items-per-page="-1"
          item-value="record_id"
          :row-props="getRowClass"
          hide-default-footer
          no-data-text="無"
          class="border"
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
              :model-value="item.status"
              :label="`${item.status ? 'OK' : 'NO'}`"
              :color="`${item.status ? 'green' : ''}`"
              :true-value="1"
              :false-value="0"
              @update:model-value="openCancelDialog($event, item)"
              hide-details
            >
            </v-checkbox>
          </template>

          <template v-slot:[`item.date`]="{ item }">
            {{ twDateString(item.date) }}
          </template>
        </v-data-table>
      </v-tabs-window-item>
      <v-tabs-window-item value="two">
        <p class="text-red-darken-1 font-weight-bold text-center">未放</p>
        <v-data-table
          :headers="headers"
          :items="recordsList.filter((item) => item.status === 0)"
          :items-per-page="-1"
          item-value="record_id"
          :row-props="getRowClass"
          hide-default-footer
          no-data-text="無"
          class="border"
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
              :model-value="item.status"
              :label="`${item.status ? 'OK' : 'NO'}`"
              :color="`${item.status ? 'green' : ''}`"
              :true-value="1"
              :false-value="0"
              @update:model-value="openCancelDialog($event, item)"
              hide-details
            >
            </v-checkbox>
          </template>

          <template v-slot:[`item.date`]="{ item }">
            {{ twDateString(item.date) }}
          </template>
        </v-data-table>

        <p class="text-green-darken-1 font-weight-bold text-center">已放</p>
        <v-data-table
          :headers="headers"
          :items="recordsList.filter((item) => item.status === 1)"
          :items-per-page="-1"
          item-value="record_id"
          :row-props="getRowClass"
          hide-default-footer
          no-data-text="無"
          class="border"
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
              :model-value="item.status"
              :label="`${item.status ? 'OK' : 'NO'}`"
              :color="`${item.status ? 'green' : ''}`"
              :true-value="1"
              :false-value="0"
              @update:model-value="openCancelDialog($event, item)"
              hide-details
            >
            </v-checkbox>
          </template>

          <template v-slot:[`item.date`]="{ item }">
            {{ twDateString(item.date) }}
          </template>
        </v-data-table>
      </v-tabs-window-item>
    </v-tabs-window>

    <v-dialog v-model="dialogCancel" width="360" persistent>
      <template v-slot:default>
        <v-card title="取消">
          <v-divider></v-divider>

          <v-card-text class="px-4">
            <p>確定要取消品項【{{ cancelItem.code }}】嗎？</p>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn @click="dialogCancel = false">取消</v-btn>

            <v-spacer></v-spacer>

            <v-btn color="red-darken-1" variant="flat" @click="cancel()">確認</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../api'

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

const tab = ref('one')

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
  {
    title: '完成時間',
    value: 'date',
    sortable: true,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 120px;',
    },
  },
]

const typeClass = (type: string) => {
  switch (type) {
    case '信':
      return 'brown'
    case '箱':
      return 'amber'
    case '單':
      return 'teal'
    case '釘':
      return 'grey'
    case '摺':
      return 'indigo'
    case '糊':
      return 'pink'
    case '圖':
      return 'blue'
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
    const now = new Date()

    record.date = record.status ? record.date || now : null

    await apiClient.put('/api/records/edit', {
      id: record.record_id,
      status: record.status,
      date: record.status ? record.date || now : null,
    })

    // loadRecords()
    dialogCancel.value = false
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('編輯狀態失敗:', msg)
  }
}

const dialogCancel = ref(false)
const cancelItem = ref<Records>({
  record_id: 0,
  item_id: 0,
  location_id: 0,
  code: '',
  type: '',
  item_name: '',
  location_name: '',
  quantity: 0,
  status: 0,
  date: null,
})

function openCancelDialog(newVal: number | null, record: Records) {
  if (newVal) {
    record.status = 1

    recordEdit(record)
  } else {
    cancelItem.value = record
    dialogCancel.value = true
  }
}

function cancel() {
  cancelItem.value.status = 0
  cancelItem.value.date = null

  recordEdit(cancelItem.value)
}

function twDateString(dateStr: Date | string | null) {
  if (dateStr) {
    const date = new Date(dateStr)

    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .format(date)
      .replace(/\//g, '-')
  }
}
</script>

<style scoped></style>
