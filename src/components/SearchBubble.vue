<template>
  <teleport to="body">
    <v-btn icon class="position-fixed ma-4 ma-md-8 right-0 bottom-0" @click="openSearchItemDialog">
      <v-icon>mdi-magnify</v-icon>
    </v-btn>
  </teleport>

  <v-dialog v-model="dialogSearchItem" width="400" persistent>
    <v-card class="text-center pa-6 rounded-lg">
      <template v-slot:title>
        <div class="d-flex align-center w-100">
          <span>查詢</span>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            size="small"
            color="grey-darken-1"
            class="text-title-small"
            v-if="result.total"
            @click="openSearchLocationDialog"
          >
            進階查詢
          </v-btn>
          <v-btn variant="text" icon="mdi-close" @click="dialogSearchItem = false"></v-btn>
        </div>
      </template>

      <v-divider></v-divider>

      <v-card-item>
        <div class="mb-3 pa-1 d-flex align-center">
          <v-text-field
            label="編號"
            v-model="searchItemInput"
            style="width: 150px"
            density="compact"
            hide-details
            readonly
            clearable
          ></v-text-field>
          <v-btn color="surface-variant" class="ms-2" @click="searchItem">查詢</v-btn>
        </div>

        <div class="text-start">名稱：{{ result.name }}</div>
        <div class="text-start d-flex align-center">
          <p class="text-start d-flex align-center">
            類型：<v-chip variant="flat" v-if="result.type" :color="typeClass(result.type)">
              {{ result.type }}
            </v-chip>
            <span class="ml-2">{{ result.pack?.size }}</span>
          </p>

          <v-spacer> </v-spacer>

          <p class="text-start text-primary font-weight-bold">總數：{{ result.total }}</p>
        </div>

        <v-row class="mt-3 pa-1">
          <v-col cols="4" class="d-flex flex-column justify-space-between">
            <v-btn @click="buttonItemInputText('NO.')"> NO. </v-btn>
            <v-btn @click="buttonItemInputText('其')"> 其 </v-btn>
            <v-btn @click="buttonItemInputText('財')"> 財 </v-btn>
            <v-btn @click="buttonItemInputText('保')"> 保 </v-btn>
            <v-btn @click="buttonItemInputText('業')"> 業 </v-btn>
          </v-col>
          <v-col cols="8">
            <v-row class="ga-6">
              <v-col cols="4">
                <v-btn block @click="buttonItemInputNumber('1')">1</v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn block @click="buttonItemInputNumber('2')">2</v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn block @click="buttonItemInputNumber('3')">3</v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn block @click="buttonItemInputNumber('4')">4</v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn block @click="buttonItemInputNumber('5')">5</v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn block @click="buttonItemInputNumber('6')">6</v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn block @click="buttonItemInputNumber('7')">7</v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn block @click="buttonItemInputNumber('8')">8</v-btn>
              </v-col>
              <v-col cols="4">
                <v-btn block @click="buttonItemInputNumber('9')">9</v-btn>
              </v-col>
              <v-col cols="12">
                <v-btn block @click="buttonItemInputNumber('0')">0</v-btn>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-item>
    </v-card>
  </v-dialog>

  <v-dialog v-model="dialogSearchLocation" width="400" persistent>
    <v-card class="text-center pa-6 rounded-lg">
      <template v-slot:title>
        <div class="d-flex align-center w-100">
          <span>進階查詢</span>
          <v-spacer></v-spacer>
          <v-btn variant="text" icon="mdi-close" @click="dialogSearchLocation = false"></v-btn>
        </div>
      </template>

      <v-divider></v-divider>

      <v-card-item>
        <div class="mb-3 pa-1 d-flex align-center">
          <v-select
            v-model="searchLocationInput"
            label="據點"
            :items="LocationOptions"
            item-title="text"
            item-value="val"
            density="compact"
            hide-details
          >
          </v-select>
          <v-btn color="surface-variant" class="ms-2" @click="searchLocation">查詢</v-btn>
        </div>

        <div class="text-start">數量：{{ record.quantity }}</div>
      </v-card-item>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '../api';

const route = useRoute()

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
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}

const locationsList = ref<Locations[]>([])

const loadLocations = async () => {
  try {
    const result = await apiClient.post('/api/locations/get', {
      periodId: periodId,
    })

    if (result.data.success) {
      locationsList.value = result.data.data

      locationsList.value.forEach((location) => {
        LocationOptions.value.push({ text: location.name ?? '', val: location.id })
      })
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}

onMounted(() => {
  if (periodId) {
    loadItems()
    loadLocations()
  }
})

const dialogSearchItem = ref<boolean>(false)

const searchItemInput = ref<string>('') // 顯示用
const searchItemInput1 = ref<string>('')
const searchItemInput2 = ref<string>('')

function openSearchItemDialog() {
  searchItemInput.value = ''
  searchItemInput1.value = ''
  searchItemInput2.value = ''
  result.value = {
    id: 0,
  }
  dialogSearchItem.value = true
}

function buttonItemInputText(value: string) {
  searchItemInput.value = value
  searchItemInput1.value = value
  searchItemInput2.value = ''
}

function buttonItemInputNumber(value: string) {
  if (searchItemInput2.value.length >= 2) {
    searchItemInput2.value = value
  } else {
    searchItemInput2.value += value
  }
}

// 🌟 1. 專門負責「清空」邏輯
watch(searchItemInput, (newVal) => {
  if (!newVal) {
    searchItemInput1.value = ''
    searchItemInput2.value = ''
    searchItem()
  }
})

// 🌟 2. 專門負責「右邊數字按鈕」疊加
watch(searchItemInput2, (newVal) => {
  if (newVal !== '') {
    searchItemInput.value = searchItemInput1.value + newVal
  } else {
    searchItemInput.value = searchItemInput1.value
  }
})

const result = ref<Items>({
  id: 0,
})

function searchItem() {
  result.value = itemsList.value.find((item) => {
    let value = ''
    if (searchItemInput1.value.startsWith('NO.')) {
      value = searchItemInput1.value + searchItemInput2.value + '.封'
    } else if (searchItemInput1.value.startsWith('其')) {
      value = searchItemInput1.value + '他' + searchItemInput2.value.padStart(2, '0') + '表'
    } else if (searchItemInput1.value.startsWith('財')) {
      value = searchItemInput1.value + '務' + searchItemInput2.value.padStart(2, '0') + '表'
    } else if (searchItemInput1.value.startsWith('保')) {
      value = searchItemInput1.value + '全' + searchItemInput2.value.padStart(2, '0') + '表'
    } else if (searchItemInput1.value.startsWith('業')) {
      value = searchItemInput1.value + '務' + searchItemInput2.value.padStart(2, '0') + '表'
    } else {
      value = searchItemInput1.value
    }
    return item.code === value
  }) ?? { id: 0 }
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

const dialogSearchLocation = ref<boolean>(false)

const LocationOptions = ref<{ text: string; val: number }[]>([
  {
    text: '--- 請選擇據點 ---',
    val: 0,
  },
])

const searchLocationInput = ref<number>(0)

const record = ref<Records>({
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

function openSearchLocationDialog() {
  searchLocationInput.value = 0
  record.value = {
    record_id: 0,
    item_id: 0,
    location_id: 0,
    code: '',
    type: '',
    item_name: '',
    location_name: '',
    quantity: 0,
    status: 0,
  }
  dialogSearchLocation.value = true
}

async function searchLocation() {
  try {
    const locationResult = await apiClient.post('/api/records/search', {
      periodId: periodId,
      itemId: result.value.id,
      locationId: searchLocationInput.value,
    })

    if (locationResult.data.success) {
      record.value = locationResult.data.data[0]
    }
  } catch (error) {
    console.error('撈取明細失敗:', error)
  }
}
</script>
