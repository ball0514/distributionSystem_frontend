<template>
  <v-overlay
    :model-value="active"
    :contained="contained"
    persistent
    class="align-center justify-center app-loading-overlay"
    :scrim="scrimColor"
  >
    <div class="text-center pa-6 rounded-lg d-flex flex-column align-center ga-3">
      <v-progress-circular
        :color="color"
        indeterminate
        :size="size"
        :width="width"
      ></v-progress-circular>

      <span v-if="text" :class="`text-body-1 font-weight-bold text-${color}`">
        {{ text }}
      </span>
    </div>
  </v-overlay>
</template>

<script lang="ts" setup>
// 定義組件接收的參數（Props）
withDefaults(
  defineProps<{
    active: boolean // 是否顯示 Loading
    text?: string // 顯示的文字（例如：資料載入中...）
    contained?: boolean // 是否只在局部區塊（預設 false 為全螢幕）
    color?: string // 進度條與文字顏色
    size?: number // 進度條大小
    width?: number // 進度條線條粗細
    scrimColor?: string // 背景遮罩顏色
  }>(),
  {
    active: false,
    text: '資料載入中...',
    contained: false,
    color: 'primary',
    size: 50,
    width: 5,
    scrimColor: 'rgba(255, 255, 255, 0.7)', // 預設淡淡的白底遮罩
  },
)
</script>

<style scoped>
/* 🌟 質感加分：加上現代網頁最愛的毛玻璃（模糊）背景特效 */
.app-loading-overlay :deep(.v-overlay__scrim) {
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(4px);
  transition: backdrop-filter 0.3s ease;
}
.app-loading-overlay :deep(.v-overlay__content) {
  position: static;
}
</style>
