'use client'
import React, { useState } from 'react'
import Papa from 'papaparse'
import useCsv from '../zustandStore'
import { MoonLoader } from 'react-spinners'

interface csvItem {
  experiment_id: string
  metric_name: string
  step: string
  value: string
}

interface resultsInterface {
  data: csvItem[]
}

const LoadCSV = () => {
  const [data, setData] = useState({})
  const setCsvData = useCsv((state) => state.setCsvData)
  const setLoading = useCsv((state) => state.setLoading)
  const isLoading = useCsv((state) => state.isLoading)

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    // save file
    const file = e.target.files?.[0]

    if (!file) return
    setLoading(true)

    setTimeout(() => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function (results: resultsInterface) {
          console.log('Parsed Data:', results.data)
          setData(results.data)
          setCsvData(results.data)
          setLoading(false)
        },
        error: function (err) {
          console.error('CSV parsing error:', err.message)
          setLoading(false)
        },
      })
    }, 0)
  }

  return (
    <div className='d-flex flex-column align-items-center justify-content-center p-4'>
      <input
        type='file'
        accept='.csv'
        className='form-control-file ms-5'
        onChange={handleFileLoad}
        disabled={isLoading}
      />
      {isLoading && (
        <div className='mt-5 me-4'>
          <MoonLoader color='#fff' size={32} />
        </div>
      )}
    </div>
  )
}

export default LoadCSV
