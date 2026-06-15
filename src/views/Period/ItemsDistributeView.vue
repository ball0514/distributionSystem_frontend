<template>
  <StatusDialog
    v-model="statusDialog.show"
    :type="statusDialog.type"
    :message="statusDialog.message"
  />

  <div class="d-flex align-center">
    <h2>
      品項配送模式
      <small class="font-weight-regular text-grey-lighten-1">目前期別：{{ period.name }}</small>
    </h2>
    <v-spacer> </v-spacer>
    <v-btn color="grey-darken-1" variant="text" :to="`/periods/${periodId}/items`"> 回清單 </v-btn>
    <v-btn color="grey-darken-1" variant="outlined" elevation="1" @click="goBack"> 上一頁 </v-btn>
  </div>

  <p>
    目前品項：<span class="text-display-small font-weight-bold text-primary">{{
      itemsList[0]?.code
    }}</span
    >_{{ itemsList[0]?.name }}
  </p>
  <p>
    類型：
    <v-chip variant="flat" v-if="itemsList[0]?.type" :color="typeClass(itemsList[0]?.type)">
      {{ itemsList[0]?.type }}
    </v-chip>
    <span class="ml-2">{{ itemsList[0]?.pack?.size }}</span>
  </p>
  <p>總數：{{ itemsList[0]?.total }}</p>

  <v-row>
    <v-col cols="12" md="6">
      <v-data-table
        :headers="headers"
        :items="recordsList"
        :items-per-page="-1"
        :row-props="getRowClass"
        hide-default-footer
        no-data-text="無"
      >
        <template v-slot:[`item.location_name`]="{ item }">
          <v-btn
            variant="text"
            :to="`/periods/${periodId}/locations/${item.location_id}/distribute`"
          >
            {{ item.location_name }}
          </v-btn>
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
    </v-col>

    <v-col cols="12" md="6">
      <v-data-table
        :headers="headersPack"
        :items="Object.entries(totalObj)"
        :items-per-page="-1"
        :row-props="getRowClass"
        hide-default-footer
        no-data-text="DONE"
      >
        <template v-slot:no-data>
          <div class="py-8 text-center text-green-darken-1">
            <v-icon size="48" color="green-lighten-1" class="mb-2">
              mdi-package-variant-closed-check
            </v-icon>
            <div class="text-h6 font-weight-bold">DONE</div>
          </div>
        </template>
      </v-data-table>
    </v-col>
  </v-row>
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
const itemId = route.params.itemId

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

const itemsList = ref<Items[]>([])
const itemsListObj = ref<PackDetail>({})
const recordsList = ref<Records[]>([])

const loadItems = async () => {
  try {
    const result = await apiClient.post('/api/items/get', {
      periodId: periodId,
      itemId: itemId,
    })

    if (result.data.success) {
      const dataList = result.data.data

      itemsList.value = dataList.map((data: Items) => ({
        ...data,
        pack: typeof data.pack === 'string' && data.pack ? JSON.parse(data.pack) : data.pack,
      }))

      itemsListObj.value = itemsList.value[0]?.pack?.detail ?? {}

      if (recordsList.value.length === 0) {
        loadRecords()
      }
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}

onMounted(() => {
  if (periodId && itemId) {
    loadItems()
  }
})

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

const totalObj = ref<PackDetail>({})

const loadRecords = async () => {
  try {
    const result = await apiClient.post('/api/records/search', {
      periodId: periodId,
      itemId: itemId,
    })

    if (result.data.success) {
      recordsList.value = result.data.data

      recordsList.value = recordsList.value.filter((record) => record.quantity > 0)

      totalObj.value = {}

      recordsList.value.forEach((record) => {
        if (record.status === 0) {
          const divisor = itemsList.value[0]?.pack?.size ?? 1
          // 計算可以分出幾組
          const quotient = Math.floor(record.quantity / divisor)
          if (quotient > 0) {
            totalObj.value[divisor] = totalObj.value[divisor] || { quantity: 0, status: 0 }
            totalObj.value[divisor].quantity = (totalObj.value[divisor].quantity || 0) + quotient
          }

          // 計算剩下的餘數
          const remainder = record.quantity % divisor
          if (remainder > 0) {
            totalObj.value[remainder] = totalObj.value[remainder] || {
              quantity: 0,
              status: 0,
            }
            totalObj.value[remainder].quantity = (totalObj.value[remainder].quantity || 0) + 1
          }
        }
      })
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}

const headers = [
  {
    title: '據點',
    value: 'location_name',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 100px;',
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
      style: 'width: 100px;',
    },
  },
]

const getRowClass = ({ index, item }: { index: number; item: Records }) => {
  if (item.status === 1) {
    return { class: 'bg-green-lighten-4' }
  } else if (index % 2 === 0) {
    return { class: 'bg-grey-lighten-3' }
  }

  return {}
}

const headersPack = [
  {
    title: '單位',
    value: '0',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 100px;',
    },
  },
  {
    title: '數量',
    value: '1.quantity',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
    },
  },
]

async function recordEdit(record: Records) {
  try {
    await apiClient.put('/api/records/edit', {
      id: record.record_id,
      status: record.status,
    })

    totalObj.value = {}

    recordsList.value.forEach((record) => {
      if (record.status === 0) {
        const divisor = itemsList.value[0]?.pack?.size ?? 1
        // 計算可以分出幾組
        const quotient = Math.floor(record.quantity / divisor)
        if (quotient > 0) {
          totalObj.value[divisor] = totalObj.value[divisor] || { quantity: 0, status: 0 }
          totalObj.value[divisor].quantity = (totalObj.value[divisor].quantity || 0) + quotient
        }

        // 計算剩下的餘數
        const remainder = record.quantity % divisor
        if (remainder > 0) {
          totalObj.value[remainder] = totalObj.value[remainder] || {
            quantity: 0,
            status: 0,
          }
          totalObj.value[remainder].quantity = (totalObj.value[remainder].quantity || 0) + 1
        }
      }
    })

    // loadRecords()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('編輯狀態失敗:', msg)
  }
}
</script>

<style scoped></style>
