<template>
  <StatusDialog
    v-model="statusDialog.show"
    :type="statusDialog.type"
    :message="statusDialog.message"
  />

  <div class="d-flex align-center">
    <h2>
      品項數量模式
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
    <v-btn variant="text" icon @click="dialogEditTypePackSize = true">
      <v-icon>mdi-pencil</v-icon>
    </v-btn>
  </p>
  <p>總數：{{ itemsList[0]?.total }}</p>

  <v-dialog v-model="dialogEditTypePackSize" width="360" persistent>
    <template v-slot:default>
      <v-card title="編輯">
        <v-divider></v-divider>

        <v-card-text class="px-4">
          <v-select
            v-model="itemEditType"
            label="類型"
            :items="typeOptions"
            item-title="text"
            item-value="val"
          >
          </v-select>
          <v-text-field label="基本數量" v-model="itemEditPackSize"></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn @click="dialogEditTypePackSize = false">取消</v-btn>

          <v-spacer></v-spacer>

          <v-btn color="primary" variant="flat" @click="itemEdit('typePackSize')">確認</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>

  <v-row>
    <v-col cols="12" md="6">
      <v-data-table
        :headers="headersPack"
        :items="Object.entries(itemsListObj)"
        :items-per-page="-1"
        :row-props="getRowClass"
        hide-default-footer
        no-data-text="無"
      >
        <template v-slot:[`item.1.status`]="{ item }">
          <v-checkbox
            v-model="item[1].status"
            :label="`${item[1].status ? 'OK' : 'NO'}`"
            :color="`${item[1].status ? 'green' : ''}`"
            :true-value="1"
            :false-value="0"
            @update:model-value="itemEdit('packDetail', itemsListObj)"
            hide-details
          >
          </v-checkbox>
        </template>
      </v-data-table>
    </v-col>

    <v-col cols="12" md="6">
      <v-data-table
        :headers="headers"
        :items="recordsList"
        :items-per-page="-1"
        :row-props="getRowClass"
        hide-default-footer
        no-data-text="無"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn variant="text" icon @click="openEditQuantityDialog(item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-col>
  </v-row>

  <v-dialog v-model="dialogEditQuantity" width="360" persistent>
    <template v-slot:default>
      <v-card title="編輯">
        <v-divider></v-divider>

        <v-card-text class="px-4">
          <v-text-field
            label="數量"
            v-model="itemEditObject.quantity"
            style="width: 300px"
          ></v-text-field>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-btn @click="dialogEditQuantity = false">取消</v-btn>

          <v-spacer></v-spacer>

          <v-btn color="primary" variant="flat" @click="recordEdit()">確認</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
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

const periodId = Number(route.params.periodId) || 0
const itemId = Number(route.params.itemId) || 0

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

const itemsList = ref<Items[]>([])
const itemsListObj = ref<PackDetail>({})
const recordsList = ref<Records[]>([])

const itemEditType = ref<string>('')
const itemEditPackSize = ref<number>(0)

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

      itemEditType.value = itemsList.value[0]?.type || ''
      itemEditPackSize.value = itemsList.value[0]?.pack?.size || 1

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

      totalObj.value = {}

      recordsList.value.forEach((item) => {
        const divisor = itemsList.value[0]?.pack?.size ?? 1
        // 計算可以分出幾組
        const quotient = Math.floor(item.quantity / divisor)
        if (quotient > 0) {
          totalObj.value[divisor] = totalObj.value[divisor] || { quantity: 0, status: 0 }
          totalObj.value[divisor].quantity = (totalObj.value[divisor].quantity || 0) + quotient
        }

        // 計算剩下的餘數
        const remainder = item.quantity % divisor
        if (remainder > 0) {
          totalObj.value[remainder] = totalObj.value[remainder] || {
            quantity: 0,
            status: 0,
          }
          totalObj.value[remainder].quantity = (totalObj.value[remainder].quantity || 0) + 1
        }
      })

      Object.entries(totalObj.value).forEach(([key, value]) => {
        if (
          itemsListObj.value?.[key]?.quantity === value.quantity &&
          itemsListObj.value?.[key]?.status === 1
        ) {
          value.status = 1
        }
      })

      itemEdit('packDetail', totalObj.value)
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}

const typeOptions = ref([
  { text: '信封', val: '信' },
  { text: '單張', val: '單' },
  { text: '釘裝', val: '釘' },
  { text: '對摺', val: '摺' },
  { text: '糊頭', val: '糊' },
])

function packSize(type: string) {
  switch (type) {
    case '信':
      itemEditPackSize.value = 50
      break
    case '單':
      itemEditPackSize.value = 1
      break
    case '釘':
      itemEditPackSize.value = 50
      break
    case '摺':
      itemEditPackSize.value = 100
      break
    case '糊':
      itemEditPackSize.value = 1
      break
    default:
      itemEditPackSize.value = 1
      break
  }
}

watch(itemEditType, (newVal) => {
  packSize(newVal)
})

const dialogEditTypePackSize = ref(false)

async function itemEdit(content: string, obj?: PackDetail): Promise<void> {
  try {
    const payload: Record<string, string | number | Pack> = {
      id: itemId,
    }
    if (content === 'typePackSize') {
      payload.pack = {
        size: 1,
      }
      payload.type = itemEditType.value
      payload.pack.size = itemEditPackSize.value
    } else if (content === 'packDetail') {
      payload.pack = {
        size: itemEditPackSize.value,
        detail: {},
      }
      payload.pack.detail = obj
    }
    payload.pack = JSON.stringify(payload.pack)
    await apiClient.put('/api/items/edit', payload)

    if (itemsList.value[0] && itemsList.value[0].pack) {
      itemsList.value[0].pack.size = itemEditPackSize.value
    }

    statusDialog.value.type = 'success'
    statusDialog.value.message = '編輯成功'

    if (content === 'packDetail') {
      loadItems()
    } else {
      loadRecords()
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('編輯數量失敗:', msg)

    statusDialog.value.type = 'error'
    statusDialog.value.message = '編輯失敗'
  } finally {
    if (!obj) {
      dialogEditTypePackSize.value = false
      statusDialog.value.show = true
    }
  }
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
  {
    title: '狀態',
    value: '1.status',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 100px;',
    },
  },
]
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

const getRowClass = ({ index, item }: { index: number; item: PackDetail }) => {
  if (item[1]?.status === 1) {
    return { class: 'bg-green-lighten-4' }
  } else if (index % 2 === 0) {
    return { class: 'bg-grey-lighten-3' }
  }

  return {}
}

const itemEditObject = ref<Records>({
  record_id: 0,
  item_id: 0,
  location_id: 0,
  code: '',
  type: '',
  item_name: '',
  location_name: '',
  quantity: 0,
  status: 0,
})
const dialogEditQuantity = ref(false)

function openEditQuantityDialog(record: Records) {
  itemEditObject.value = { ...record }
  dialogEditQuantity.value = true
}

async function recordEdit() {
  try {
    await apiClient.put('/api/records/edit', {
      id: itemEditObject.value.record_id,
      quantity: itemEditObject.value.quantity,
      status: itemEditObject.value.quantity === 0 ? 1 : 0,
    })

    statusDialog.value.type = 'success'
    statusDialog.value.message = '編輯成功'

    loadRecords()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('編輯數量失敗:', msg)

    statusDialog.value.type = 'error'
    statusDialog.value.message = '編輯失敗'
  } finally {
    dialogEditQuantity.value = false
    statusDialog.value.show = true
  }
}
</script>
