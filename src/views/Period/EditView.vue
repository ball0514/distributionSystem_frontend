<template>
  <LoadingLayout :active="isLoading" text="匯入中..." />
  <StatusDialog
    v-model="statusDialog.show"
    :type="statusDialog.type"
    :message="statusDialog.message"
  />

  <div class="d-flex align-center">
    <h2>新增品項&據點</h2>
    <v-spacer> </v-spacer>
    <v-btn color="grey-darken-1" variant="outlined" elevation="1" :to="`/`"> 上一頁 </v-btn>
  </div>

  <h3>目前期別：{{ period.name }}</h3>

  <div class="mb-6">
    <v-row align="center">
      <v-col cols="8">
        <v-file-input
          v-model="fileInput"
          label="json檔"
          type="file"
          accept=".json"
          @change="handleFileUpload"
          hide-details
        ></v-file-input>
      </v-col>
      <v-col cols="4">
        <v-btn @click="periodEdit" :disabled="periodData.length === 0">送出</v-btn>
      </v-col>
    </v-row>
  </div>

  <template v-if="periodData.length > 0">
    <v-row class="ga-1" v-for="(type, index) in typeArray" :key="index">
      <v-col cols="12" class="font-weight-bold">{{ type.name }}</v-col>
      <template v-for="(item, index) in periodData" :key="index">
        <v-col cols="2" align-self="center">
          <v-checkbox
            v-model="item.type"
            :label="item.code"
            :true-value="type.value"
            :false-value="null"
            density="compact"
            hide-details
            @change="packSize(item)"
          />
        </v-col>
      </template>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="periodData"
      :items-per-page="-1"
      :row-props="getRowClass"
      v-if="periodData.length > 0"
      hide-default-footer
    >
      <template v-slot:[`item.type`]="{ item }">
        <v-chip variant="flat" v-if="item.type" :color="typeClass(item.type)">
          {{ item.type }}
        </v-chip>
      </template>

      <template
        v-for="hd in headers.filter(
          (hd) =>
            hd.value !== 'code' &&
            hd.value !== 'name' &&
            hd.value !== 'unit' &&
            hd.value !== 'type',
        )"
        :key="hd.value"
        v-slot:[`item.${hd.value}`]="{ item }"
      >
        <span> {{ item[hd.value] === 0 ? '' : item[hd.value] }} </span>
      </template>
    </v-data-table>
  </template>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '../../api';

// 狀態彈窗
const statusDialog = ref({
  show: false,
  type: 'success', // 'success' 或 'error',
  message: '',
})

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

const periodData = ref<DistributionList[]>([])
const typeArray = ref([
  { name: '信封', value: '信' },
  { name: '單張', value: '單' },
  { name: '釘裝', value: '釘' },
  { name: '對摺', value: '摺' },
  { name: '糊頭', value: '糊' },
])

function packSize(item: DistributionList) {
  item.pack = {
    size: 1,
  }

  switch (item.type) {
    case '信':
      item.pack.size = 50
      break
    case '單':
      item.pack.size = 1
      break
    case '釘':
      item.pack.size = 50
      break
    case '摺':
      item.pack.size = 100
      break
    case '糊':
      item.pack.size = 1
      break
    default:
      item.pack.size = 1
      break
  }
}

type PeriodHeader = {
  title: string
  value: string
  sortable: boolean
  headerProps: {
    class: string
    style?: string
  }
  cellProps?: {
    class: string
  }
}

const headers: PeriodHeader[] = [
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
      style: 'width: 300px;',
    },
  },
  {
    title: '單位',
    value: 'unit',
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
      style: 'width: 160px;',
    },
  },
]

const getRowClass = ({ index, item }: { index: number; item: Items }) => {
  if (!item.type) {
    return { class: 'bg-red-lighten-4' }
  } else if (index % 2 === 0) {
    return { class: 'bg-grey-lighten-3' }
  }

  return {}
}

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

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 使用網頁標準的 FileReader 來讀取檔案內容
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const rawText = e.target?.result as string
      // 將文字解析為 JavaScript 陣列並存入 ref
      periodData.value = JSON.parse(rawText)

      Object.keys(periodData.value[0] ?? {}).forEach((key) => {
        if (key !== 'code' && key !== 'name' && key !== 'unit' && key !== 'type') {
          headers.push({
            title: key,
            value: key,
            sortable: false,
            headerProps: {
              class: 'border border-t-0 border-e-0 bg-surface-variant text-white font-weight-bold',
            },
            cellProps: {
              class: 'border border-t-0 border-e-0',
            },
          })
        }
      })
    } catch (error) {
      alert('JSON 格式解析失敗，請檢查檔案內容是否正確！')
      console.log(error)
      target.value = '' // 清空選擇的檔案
      periodData.value = []
    }
  }

  // 以文字格式讀取檔案
  reader.readAsText(file)
}

const fileInput = ref<File | null>(null)
const isLoading = ref(false)

const periodEdit = async () => {
  try {
    isLoading.value = true
    const formattedData = periodData.value.map((data) => ({
      ...data,
      pack: JSON.stringify(data.pack),
    }))
    await apiClient.put('/api/periods/edit', {
      periodId: period.value.id,
      data: formattedData, // 剛剛讀取出來的大陣列
    })
    statusDialog.value.type = 'success'
    statusDialog.value.message = '上傳成功'
    fileInput.value = null
    periodData.value = []
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('新增期別失敗:', msg)

    statusDialog.value.type = 'error'
    statusDialog.value.message = '上傳失敗'
  } finally {
    isLoading.value = false
    statusDialog.value.show = true
  }
}
</script>

<style scoped></style>
