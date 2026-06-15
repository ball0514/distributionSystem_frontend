<template>
  <div class="my-3">
    <v-select
      v-model="filterType"
      label="類型"
      :items="typeOptions"
      item-title="text"
      item-value="val"
      hide-details
    >
    </v-select>
  </div>

  <v-data-table
    :headers="headers"
    :items="itemsListFilter"
    :items-per-page="-1"
    :row-props="getRowClass"
    hide-default-footer
    no-data-text="無"
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../../api';

const route = useRoute()
const router = useRouter()

const periodId = route.params.id

const itemsList = ref<Items[]>([])
const itemsListFilter = ref<Items[]>([])

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

      itemsListFilter.value = itemsList.value

      const queryType = route.query.type
      if (typeof queryType === 'string') {
        filterType.value = queryType
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
  { text: '單張', val: '單' },
  { text: '釘裝', val: '釘' },
  { text: '對摺', val: '摺' },
  { text: '糊頭', val: '糊' },
])

watch(filterType, (newVal) => {
  if (newVal) {
    itemsListFilter.value = itemsList.value.filter((item) => item.type === newVal)
    router.push({
      path: route.path, // 維持當前路徑
      query: {
        ...route.query, // 🛡️ 保留原本網址就有的其他參數（例如原本的頁數或其它條件）
        type: newVal, // 🎯 加上或覆蓋你新選的 type 參數
      },
    })
  } else {
    itemsListFilter.value = itemsList.value

    router.replace({
      path: route.path,
      query: {
        ...route.query,
        type: undefined,
      },
    })
  }
})

const headers = [
  {
    title: '編號',
    value: 'code',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 100px;',
    },
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
      style: 'width: 360px;',
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
  }
}
</script>

<style scoped></style>
