<template>
  <teleport to="body">
    <v-btn
      icon
      color="surface-variant"
      class="position-fixed ma-4 ma-md-8 right-0 bottom-12"
      @click="dialogFirstBox = true"
    >
      <v-icon>mdi-package-variant-closed-check</v-icon>
    </v-btn>
  </teleport>

  <v-dialog v-model="dialogFirstBox" scrollable persistent>
    <v-card class="text-center pa-6 rounded-lg">
      <template v-slot:title>
        <div class="d-flex align-center w-100">
          <span>第一箱</span>
          <v-spacer></v-spacer>
          <v-btn variant="text" icon="mdi-close" @click="dialogFirstBox = false"></v-btn>
        </div>
      </template>

      <v-divider></v-divider>

      <v-card-item>
        <v-row>
          <v-col cols="12" md="6">
            <p class="text-red-darken-1 font-weight-bold">未放</p>
            <v-data-table
              :headers="headers"
              :items="locationsList.filter((location) => location.status_firstBox === 0)"
              :items-per-page="-1"
              :row-props="getRowClass"
              hide-default-footer
              no-data-text="無"
            >
              <template v-slot:no-data v-if="locationsList.length !== 0">
                <div class="py-8 text-center text-green-darken-1">
                  <v-icon size="48" color="green-lighten-1" class="mb-2">
                    mdi-package-variant-closed-check
                  </v-icon>
                  <div class="text-h6 font-weight-bold">DONE</div>
                </div>
              </template>

              <template v-slot:[`item.name`]="{ item }">
                <div class="d-flex text-start">
                  {{ item.name }}
                </div>
              </template>

              <template v-slot:[`item.status_firstBox`]="{ item }">
                <v-checkbox
                  v-model="item.status_firstBox"
                  :true-value="1"
                  :false-value="0"
                  hide-details
                  @update:model-value="editStatusFirstBox(item)"
                ></v-checkbox>
              </template> </v-data-table
          ></v-col>

          <v-col cols="12" md="6">
            <p class="text-green-darken-1 font-weight-bold">已放</p>
            <v-data-table
              :headers="headers"
              :items="locationsList.filter((location) => location.status_firstBox === 1)"
              :items-per-page="-1"
              :row-props="getRowClass"
              hide-default-footer
              no-data-text="無"
            >
              <template v-slot:[`item.name`]="{ item }">
                <div class="d-flex text-start">
                  {{ item.name }}
                </div>
              </template>

              <template v-slot:[`item.status_firstBox`]="{ item }">
                <v-checkbox
                  v-model="item.status_firstBox"
                  :true-value="1"
                  :false-value="0"
                  hide-details
                  @update:model-value="editStatusFirstBox(item)"
                ></v-checkbox>
              </template> </v-data-table
          ></v-col>
        </v-row>
      </v-card-item>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../api';

const route = useRoute()

const periodId = route.params.id

const locationsList = ref<Locations[]>([])

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

const dialogFirstBox = ref<boolean>(false)

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
    title: '第一箱',
    value: 'status_firstBox',
    sortable: false,
    headerProps: {
      class: 'bg-surface-variant text-white font-weight-bold',
      style: 'width: 100px;',
    },
  },
]

const getRowClass = ({ index, item }: { index: number; item: Locations }) => {
  if (item.status_firstBox === 1) {
    return { class: 'bg-green-lighten-4' }
  } else if (index % 2 === 0) {
    return { class: 'bg-grey-lighten-3' }
  }

  return {}
}

async function editStatusFirstBox(location: Locations) {
  try {
    await apiClient.put('/api/locations/edit', {
      id: location.id,
      status_firstBox: location.status_firstBox,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('編輯狀態失敗:', msg)
  }
}
</script>

<style scoped>
.bottom-12 {
  bottom: 64px;
}
</style>
