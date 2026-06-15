export {}

declare global {
  interface DistributionList {
    code: string
    name: string
    unit: string
    type: string | null
    pack: Pack | null
    [locationName: string]: number | null
  }

  interface Periods {
    id: number
    name: string
    created_at: string
  }

  interface Items {
    id: number
    code?: string
    name?: string
    unit?: string
    type?: string
    pack?: Pack
    status?: number
    total?: number
  }

  interface Pack {
    size: number
    detail?: PackDetail
  }

  interface PackDetail {
    [amount: string]: {
      quantity: number
      status: number
    }
  }

  interface Locations {
    id: number
    name?: string
    status?: number
    status_firstBox?: number
  }

  interface Records {
    record_id: number
    item_id: number
    location_id: number
    code: string
    type: string
    item_name: string
    location_name: string
    quantity: number
    status: number
  }

  // 未來也可以加其他全域型別
  // interface UserInfo { ... }
}
