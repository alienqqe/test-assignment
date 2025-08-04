import { create } from 'zustand'

interface csvItem {
  experiment_id: string
  metric_name: string
  step: string
  value: string
}

interface CsvStore {
  csvData: csvItem[]
  setCsvData: (data: csvItem[]) => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

const useCsv = create<CsvStore>((set) => {
  return {
    isLoading: false,
    csvData: [],
    setCsvData: (data: csvItem[]) => set({ csvData: data }),
    setLoading: (loading) => set({ isLoading: loading }),
  }
})

export default useCsv
