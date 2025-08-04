'use client'
import React, { useEffect, useState } from 'react'
import useCsv from '../zustandStore'
import { useRouter } from 'next/navigation'

const ReadCSV = () => {
  const csvData = useCsv((state) => state.csvData)
  const isLoading = useCsv((state) => state.isLoading)
  const [checked, setChecked] = useState<string[]>([])

  const router = useRouter()

  const uniqueData = Array.from(
    new Set(csvData.map((item) => item.experiment_id))
  )

  const handleOnCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked: isChecked } = e.target

    if (isChecked) {
      setChecked((prev) => [...prev, value])
    } else {
      setChecked((prev) => prev.filter((id) => id !== value))
    }
  }

  const handleVisualize = () => {
    if (checked.length > 0) {
      router.push(`/experiments/${checked.join(',')}`)
    }
  }

  useEffect(() => {
    if (isLoading) {
      setChecked([])
    }
  }, [isLoading])

  if (csvData.length === 0) {
    return <></>
  }

  return (
    <>
      {isLoading ? (
        ''
      ) : (
        <>
          <div
            className='shadow-lg bg-white text-black mt-5 text-center overflow-auto'
            style={{ minWidth: '20rem', maxHeight: '40vh' }}
          >
            <ul
              className='d-flex flex-column justify-content-start align-items-start'
              style={{ listStyleType: 'none' }}
            >
              {uniqueData.map((item) => (
                <li className='d-flex p-3' key={item}>
                  <h4 className='p-3'>{item}</h4>
                  <input
                    className='p-4'
                    type='checkbox'
                    style={{ cursor: 'pointer' }}
                    onChange={handleOnCheck}
                    checked={checked.includes(item)}
                    value={item}
                  />
                </li>
              ))}
            </ul>
          </div>
          <button
            className='btn btn-primary mt-5'
            onClick={handleVisualize}
            disabled={checked.length === 0}
          >
            Visualize
          </button>
        </>
      )}
    </>
  )
}

export default ReadCSV
