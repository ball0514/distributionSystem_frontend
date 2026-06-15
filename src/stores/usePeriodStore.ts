import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePeriodStore = defineStore(
  'period',
  () => {
    // 1. 🌟 State：為變數加上 TypeScript 型別

    // 複雜物件建議明確指定型別，這樣前端在點選屬性時才會有完美的自動補完提示
    const currentPeriod = ref<Periods>({
      id: 0,
      name: '',
      created_at: '',
    })

    // 2. 🌟 Actions：為函式參數加上型別限制
    function setPeriod(obj: Periods): void {
      currentPeriod.value = obj
    }

    return {
      currentPeriod,
      setPeriod,
    }
  },
  {
    persist: true, // 🌟 就是這行！加了這行，Pinia 就學會自動存檔了，重新整理再也不會漏拍！
  },
)
