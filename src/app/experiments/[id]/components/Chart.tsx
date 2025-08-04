'use client'
import useCsv from '@/app/zustandStore'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { MoonLoader } from 'react-spinners'

interface PropsType {
  params: {
    value: string
  }
}

interface MetricChartProps {
  metricKey: string
  values: { value: number; step: number }[]
  metricName: string
  onRender: (key: string) => void
}

const MetricChart = ({
  metricKey,
  values,
  metricName,
  onRender,
}: MetricChartProps) => {
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDone(false)
  }, [metricKey])

  useEffect(() => {
    if (!done) {
      onRender(metricKey)
      setDone(true)
    }
  }, [done, metricKey, onRender])

  const handleAnimationEnd = () => {
    if (!done) {
      setDone(true)
      onRender(metricKey)
    }
  }

  return (
    <>
      <h3>{metricName}</h3>
      <ResponsiveContainer width={500} height={400}>
        <LineChart data={values}>
          <CartesianGrid />
          <Line
            type='monotone'
            dataKey='value'
            stroke='purple'
            strokeWidth={2}
            name='Value'
            onAnimationEnd={handleAnimationEnd}
          />
          <XAxis
            dataKey='step'
            label={{ value: 'step', position: 'center', dy: 20 }}
          />
          <YAxis
            width='auto'
            label={{ value: 'value', position: 'insideLeft', angle: -90 }}
          />
          <Legend align='right' />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const step = payload[0].payload.step
                const value = payload[0].payload.value
                return (
                  <div className='bg-white text-black border rounded p-2 shadow'>
                    <p>
                      <strong>Step:</strong> {step}
                    </p>
                    <p>
                      <strong>Value:</strong> {value}
                    </p>
                  </div>
                )
              }
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  )
}

const Chart = ({ params }: PropsType) => {
  const [renderedCharts, setRenderedCharts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const indexes = JSON.parse(params.value).id.split('%2C')
  console.log(JSON.parse(params.value).id.split('%2C'))
  const csvData = useCsv((state) => state.csvData)

  const selectedExperiments = useMemo(
    () => csvData.filter((item) => indexes.includes(item.experiment_id)),
    [csvData, indexes]
  )
  const experimentsNames = useMemo(() => {
    return Array.from(
      new Set(selectedExperiments.map((item) => item.experiment_id))
    )
  }, [selectedExperiments])

  console.log(selectedExperiments)
  useEffect(() => {
    if (!selectedExperiments.length) {
      router.push('/')
    }
  }, [selectedExperiments, router])

  // Map<experiment_id, Map<metric_value, value[]>>
  const experimentMetricMap = useMemo(() => {
    const map = new Map<
      string,
      Map<string, { value: number; step: number }[]>
    >()

    selectedExperiments.forEach(
      ({ experiment_id, metric_name, step, value }) => {
        const stepNum = parseInt(step)
        const val = parseFloat(value)

        if (isNaN(val) || isNaN(stepNum)) return

        if (!map.has(experiment_id)) {
          map.set(experiment_id, new Map())
        }

        const metricMap = map.get(experiment_id)!
        if (!metricMap.has(metric_name)) {
          metricMap.set(metric_name, [])
        }

        const arr = metricMap.get(metric_name)!
        arr.push({ value: val, step: stepNum })
      }
    )

    for (const metricMap of map.values()) {
      for (const [metricName, arr] of metricMap) {
        arr.sort((a, b) => a.step - b.step)
        const downsampled = arr.filter((_, i) => i % 30 === 0)
        metricMap.set(metricName, downsampled)
      }
    }

    return map
  }, [selectedExperiments])

  const totalChartsCount = experimentMetricMap
    ? Array.from(experimentMetricMap.values()).reduce(
        (acc, metricMap) => acc + metricMap.size,
        0
      )
    : 0

  useEffect(() => {
    setLoading(renderedCharts.size < totalChartsCount)
  }, [renderedCharts, totalChartsCount])

  if (!csvData.length || !selectedExperiments.length) {
    if (!selectedExperiments.length && csvData.length) router.push('/')
    return (
      <div
        className='d-flex align-items-center justify-content-center'
        style={{ height: '100vh' }}
      >
        <MoonLoader color='#fff' />
      </div>
    )
  }

  const onChartRender = (metricKey: string) => {
    setRenderedCharts((prev) => {
      if (prev.has(metricKey)) return prev
      const newSet = new Set(prev)
      newSet.add(metricKey)
      return newSet
    })
  }

  return (
    <>
      {loading && (
        <div
          className='d-flex align-items-center justify-content-center'
          style={{ height: '100vh', width: '100vw' }}
        >
          <MoonLoader color='#fff' />
        </div>
      )}

      <div
        className='mt-5 overflow-auto'
        style={loading ? { display: 'none' } : { display: 'block' }}
      >
        {experimentsNames.map((experimentId) => {
          const metricMap = experimentMetricMap.get(experimentId)

          return (
            <div
              className='text-center overflowuto overflow-md-hidden'
              key={experimentId}
            >
              <h2 className='pb-4 '>{experimentId}</h2>
              {metricMap &&
                [...metricMap].map(([metricName, values]) => {
                  const metricKey = experimentId + '::' + metricName

                  return (
                    <MetricChart
                      key={metricKey}
                      metricKey={metricKey}
                      metricName={metricName}
                      values={values}
                      onRender={onChartRender}
                    />
                  )
                })}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default Chart
