<template>
  <v-dialog v-model="visible" height="160" width="350" persistent>
    <v-card class="text-center pa-6 rounded-lg">
      <div class="d-flex justify-center align-center">
        <v-avatar size="40">
          <v-icon
            :icon="type === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'"
            :color="type === 'success' ? 'success' : 'error'"
            size="32"
          ></v-icon>
        </v-avatar>
        <h2 class="text-h2 font-weight-bold">
          {{ message }}
        </h2>
      </div>

      <v-spacer></v-spacer>

      <v-btn
        :color="type === 'success' ? 'success' : 'error'"
        variant="flat"
        @click="visible = false"
      >
        確定
      </v-btn>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

// 定義父元件傳進來的資料
const props = defineProps({
  modelValue: Boolean, // 控制顯示/隱藏 (v-model)
  type: {
    type: String,
    default: 'success', // 'success' 或 'error'
  },
  message: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

// 使用 computed 雙向綁定 v-model，當元件內點擊確定時，會通知父元件將狀態改為 false
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>
