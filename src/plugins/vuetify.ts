import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css' // 引入 MDI 圖標樣式

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const myCustomLightTheme = {
  dark: false, // 這是一套淺色主題
  colors: {
    background: '#FFFFFF', // 整個網站的背景色
    surface: '#F8F9FA', // 卡片、選單等元件的表面色
    primary: '#1A73E8', // 主要顏色（如：主按鈕、啟用狀態）
    'primary-darken-1': '#1557B0', // 主要顏色的深色調（可用於 Hover 效果）
    secondary: '#4285F4', // 次要顏色
    error: '#B00020', // 錯誤訊息顏色
    info: '#2196F3', // 一般資訊顏色
    success: '#4CAF50', // 成功狀態顏色
    warning: '#FB8C00', // 警告狀態顏色
    danger: '#D32F2F', // 危險狀態顏色
  },
}

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  // 你可以在這裡自訂主題 (Theme)
  theme: {
    defaultTheme: 'light', // 2. 指定預設使用哪一套主題
    themes: {
      myCustomLightTheme, // 3. 註冊你的自訂主題
    },
  },
})
