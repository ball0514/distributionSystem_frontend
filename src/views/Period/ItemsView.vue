<template>
  <v-container fluid class="no-print">
    <v-row class="my-3">
      <v-col cols="12" md="4">
        <v-select
          v-model="filterType"
          label="類型"
          :items="typeOptions"
          item-title="text"
          item-value="val"
          hide-details
        >
        </v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="filterCount"
          label="數量模式"
          :items="countOptions"
          item-title="text"
          item-value="val"
          hide-details
        >
        </v-select>
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="filterDistribute"
          label="配送模式"
          :items="distributeOptions"
          item-title="text"
          item-value="val"
          hide-details
        >
        </v-select>
      </v-col>
    </v-row>

    <div class="d-flex align-center">
      <v-switch label="選取列印模式" v-model="showSelect" hide-details />
      <v-spacer />
      <v-btn @click="print('notDelivered')" v-if="showSelect" class="ms-2">列印未送達</v-btn>
      <v-btn @click="print('needToCount')" v-if="showSelect" class="ms-2">列印零數表</v-btn>
    </div>

    <v-data-table
      :show-select="showSelect"
      v-model="selectedItems"
      return-object
      :headers="headers"
      :items="itemsListFilter"
      :items-per-page="-1"
      item-value="id"
      :row-props="getRowClass"
      hide-default-footer
      no-data-text="無"
      class="border custom-table"
    >
      <template v-slot:[`item.type`]="{ item }">
        <v-chip variant="flat" v-if="item.type" :color="typeClass(item.type)">
          {{ item.type }}
        </v-chip>
        <span class="ml-4 justify-end">{{ item.pack?.size }}</span>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex">
          <div class="mr-4 d-flex align-center">
            <v-btn variant="text" :to="`/periods/${periodId}/items/${item.id}/count`">
              <v-icon>mdi-pencil</v-icon>
              數量模式
            </v-btn>
            <v-checkbox
              :model-value="isPackDone(item.pack?.detail)"
              :color="`${isPackDone(item.pack?.detail) ? 'green' : ''}`"
              hide-details
              disabled
            ></v-checkbox>
          </div>
          <div class="d-flex align-center">
            <v-btn variant="text" :to="`/periods/${periodId}/items/${item.id}/distribute`">
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
        </div>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../api'

const route = useRoute()
const router = useRouter()

const periodId = route.params.id

const itemsList = ref<Items[]>([])

const loadItems = async () => {
  try {
    const result = await apiClient.post('/api/items/get', {
      periodId: periodId,
    })

    if (result.data.success) {
      const dataList = result.data.data

      itemsList.value = dataList.map((data: Items) => ({
        ...data,
        pack: typeof data.pack === 'string' && data.pack ? JSON.parse(data.pack) : data.pack,
      }))

      const queryType = route.query.type
      if (typeof queryType === 'string') {
        filterType.value = queryType
      }

      const queryCount = route.query.count
      if (typeof queryCount === 'string') {
        filterCount.value = JSON.parse(queryCount)
      }

      const queryDistribute = route.query.distribute
      if (typeof queryDistribute === 'string') {
        filterDistribute.value = JSON.parse(queryDistribute)
      }
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}

onMounted(() => {
  if (periodId) {
    loadItems()
  }
})

const filterType = ref<string | undefined>('')
const typeOptions = ref([
  { text: '全部', val: '' },
  { text: '信封', val: '信' },
  { text: '封箱', val: '箱' },
  { text: '單張', val: '單' },
  { text: '釘裝', val: '釘' },
  { text: '對摺', val: '摺' },
  { text: '糊頭', val: '糊' },
  { text: '地圖', val: '圖' },
])

const filterCount = ref<string | boolean | undefined>('')
const countOptions = ref([
  { text: '全部', val: '' },
  { text: '未點', val: false },
  { text: '已點', val: true },
])

const filterDistribute = ref<string | boolean | undefined>('')
const distributeOptions = ref([
  { text: '全部', val: '' },
  { text: '未配', val: false },
  { text: '已配', val: true },
])

const itemsListFilter = computed(() => {
  return itemsList.value.filter((item) => {
    const matchType = !filterType.value || item.type === filterType.value
    const matchCount =
      filterCount.value === '' ||
      Boolean(isPackDone(item.pack?.detail)) === Boolean(filterCount.value)
    const matchDistribute =
      filterDistribute.value === '' || Boolean(item.status) === Boolean(filterDistribute.value)

    return matchType && matchCount && matchDistribute
  })
})

const toQueryVal = (val: string | boolean | undefined) =>
  val !== '' && val !== null && val !== undefined ? String(val) : undefined

watch([filterType, filterCount, filterDistribute], ([type, count, distribute]) => {
  router.replace({
    // 在 router.replace 時如果不傳 path，Vue Router 預設就會停留在當前路徑。
    query: {
      ...route.query, // 🛡️ 保留原本網址就有的其他參數（例如原本的頁數或其它條件）
      type: toQueryVal(type),
      count: toQueryVal(count),
      distribute: toQueryVal(distribute), // 🎯 加上或覆蓋新選的參數
    },
  })
  selectedItems.value = []
})

const showSelect = ref(false)
const selectedItems = ref<Items[]>([])

const headers = [
  {
    title: '編號',
    value: 'code',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 100px;',
    },
    fixed: true,
  },
  {
    title: '名稱',
    value: 'name',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
    },
  },
  {
    title: '類型',
    value: 'type',
    sortable: true,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 120px;',
    },
  },
  {
    title: '總數',
    value: 'total',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 100px;',
    },
  },
  {
    title: '操作',
    value: 'actions',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 400px;',
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

const isPackDone = (obj: PackDetail | undefined) => {
  if (!obj) {
    return false
  }

  try {
    return (
      Object.keys(obj).length === 0 || Object.values(obj).every((detail) => detail.status === 1)
    )
  } catch {
    return false
  }
}

const getRowClass = ({ index, item }: { index: number; item: Items }) => {
  if (isPackDone(item.pack?.detail) && item.status) {
    return { class: 'bg-green-lighten-4' }
  } else if (isPackDone(item.pack?.detail) || item.status) {
    return { class: 'bg-yellow-lighten-4' }
  } else if (index % 2 === 0) {
    return { class: 'bg-grey-lighten-3' }
  } else {
    return { class: 'bg-white' }
  }
}

import { usePrintItemsStore } from '@/stores/usePrintItemsStore'

const printItemsStore = usePrintItemsStore()

async function print(type: string) {
  printItemsStore.changePrintStatus(true)
  printItemsStore.setPrintItems(type, selectedItems.value)

  await nextTick()

  // 觸發瀏覽器列印
  setTimeout(() => {
    let isHandled = false

    // 定義統一的還原函式
    const handlePrintDone = () => {
      if (isHandled) return
      isHandled = true

      printItemsStore.changePrintStatus(false)
      window.removeEventListener('afterprint', handlePrintDone)
    }

    // 1. 針對 Safari / 支援 afterprint 的非同步瀏覽器
    window.addEventListener('afterprint', handlePrintDone, { once: true })

    // 2. 觸發列印
    window.print()

    // 3. 針對 Chrome / Edge 等同步阻塞的瀏覽器
    // 當 print() 視窗關閉後，JS 才會走到這裡立即觸發
    handlePrintDone()
  }, 300)
}
</script>

<style scoped>
.custom-table :deep(th.v-data-table__th) {
  background-color: #424242 !important;
}

.custom-table :deep(th.v-data-table-column--fixed) {
  background-color: #424242 !important;
}

.custom-table :deep(tbody tr td.v-data-table-column--fixed) {
  background-color: inherit !important;
}
</style>
