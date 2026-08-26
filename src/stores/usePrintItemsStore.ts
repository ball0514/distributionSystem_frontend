import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePrintItemsStore = defineStore('printItems', () => {
  // 1. 🌟 State：為變數加上 TypeScript 型別

  // 複雜物件建議明確指定型別，這樣前端在點選屬性時才會有完美的自動補完提示
  const printStatus = ref<boolean>(false)
  const selectPrintType = ref<string>('')
  const selectPrintItems = ref<Items[]>([])

  // 2. 🌟 Actions：為函式參數加上型別限制
  function changePrintStatus(value: boolean): void {
    printStatus.value = value
  }
  function setPrintItems(type: string, array: Items[]): void {
    selectPrintType.value = type
    selectPrintItems.value = array
  }

  return {
    printStatus,
    selectPrintType,
    selectPrintItems,
    changePrintStatus,
    setPrintItems,
  }
})
