<template>
  <StatusDialog
    v-model="statusDialog.show"
    :type="statusDialog.type"
    :message="statusDialog.message"
  />

  <div class="d-flex align-center">
    <h2>新立配送</h2>
    <v-spacer> </v-spacer>
    <v-dialog v-model="dialogAdd" width="auto" persistent>
      <template v-slot:activator="{ props: activatorPropsAdd }">
        <v-btn color="primary" variant="outlined" prepend-icon="mdi-plus" v-bind="activatorPropsAdd"
          >新增期別</v-btn
        >
      </template>

      <template v-slot:default>
        <v-card title="新增">
          <v-divider></v-divider>

          <v-card-text class="px-4">
            <v-text-field
              label="期別名稱"
              v-model="periodAddName"
              style="width: 300px"
            ></v-text-field>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn @click="dialogAdd = false">取消</v-btn>

            <v-spacer></v-spacer>

            <v-btn color="primary" variant="flat" @click="periodAdd">確認</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </div>

  <main>
    <!-- <TheWelcome /> -->

    <v-data-table
      :headers="headers"
      :items="periodsList"
      :items-per-page="-1"
      v-if="periodsList.length > 0"
      hide-default-footer
    >
      <template v-slot:[`item.name`]="{ item }">
        <RouterLink to="/" @click.prevent="goPeriod(item)">{{ item.name }}</RouterLink>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn variant="text" icon @click="goPeriod(item, 'edit')">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-btn variant="text" icon color="red-darken-1" @click="openDeleteDialog(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialogDelete" width="360" persistent>
      <template v-slot:default>
        <v-card title="刪除">
          <v-divider></v-divider>

          <v-card-text class="px-4">
            <p>確定要刪除【{{ periodDeleteObject.name }}】嗎？</p>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-btn @click="dialogDelete = false">取消</v-btn>

            <v-spacer></v-spacer>

            <v-btn color="red-darken-1" variant="flat" @click="periodDelete()">確認</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </main>
</template>

<script lang="ts" setup>
// import TheWelcome from '../components/TheWelcome.vue'

import { ref, onMounted } from 'vue'
import apiClient from '../api';

// 狀態彈窗
const statusDialog = ref({
  show: false,
  type: 'success', // 'success' 或 'error',
  message: '',
})

// 查詢期別
// 1. 宣告響應式變數
const periodsList = ref<Periods[]>([])

// 2. 撈取期別清單的函式
const loadPeriods = async () => {
  try {
    const result = await apiClient.post('/api/periods/get', {})

    if (result.data.success) {
      periodsList.value = result.data.data
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('無法取得期別清單:', msg)
  }
}

// 3. 生命週期：網頁一打開就自動載入
onMounted(() => {
  loadPeriods()
})

const headers = [
  {
    title: '期別名稱',
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
      style: 'width: 150px;',
    },
  },
]

// 新增期別
const periodAddName = ref<string>('')
const dialogAdd = ref(false)

async function periodAdd() {
  try {
    await apiClient.post('/api/periods/add', { periodName: periodAddName.value })

    statusDialog.value.type = 'success'
    statusDialog.value.message = '新增成功'

    loadPeriods()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('新增期別失敗:', msg)

    statusDialog.value.type = 'error'
    statusDialog.value.message = '新增失敗'
  } finally {
    dialogAdd.value = false
    statusDialog.value.show = true
  }
}

// 刪除期別
const periodDeleteObject = ref<Periods>({ id: 0, name: '', created_at: '' })
const dialogDelete = ref(false)

function openDeleteDialog(period: Periods) {
  periodDeleteObject.value = { ...period }
  dialogDelete.value = true
}

async function periodDelete() {
  try {
    await apiClient.delete(`/api/periods/delete/${periodDeleteObject.value.id}`)

    statusDialog.value.type = 'success'
    statusDialog.value.message = '刪除成功'

    loadPeriods()
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('刪除期別失敗:', msg)

    statusDialog.value.type = 'error'
    statusDialog.value.message = '刪除失敗'
  } finally {
    dialogDelete.value = false
    statusDialog.value.show = true
  }
}

import { RouterLink, useRouter } from 'vue-router'
import { usePeriodStore } from '@/stores/usePeriodStore'

const router = useRouter()
const periodStore = usePeriodStore()

function goPeriod(item: Periods, mode?: string) {
  periodStore.setPeriod(item)
  if (!mode) {
    router.push(`/periods/${item.id}`)
  } else {
    router.push(`/periodEdit/${item.id}`)
  }
}
</script>
