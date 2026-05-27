const store: Record<string, { data: any; ts: number }> = {}
const TTL = 30_000 // 30 detik

export const cache = {
  get: (key: string) => {
    const entry = store[key]
    if (!entry) return null
    if (Date.now() - entry.ts > TTL) {
      delete store[key]
      return null
    }
    return entry.data
  },
  set: (key: string, data: any) => {
    store[key] = { data, ts: Date.now() }
  },
  clear: (key: string) => {
    delete store[key]
  },
  clearAll: () => {
    Object.keys(store).forEach(k => delete store[k])
  }
}