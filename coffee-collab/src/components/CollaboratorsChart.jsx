// Collaborators ranking chart component
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export function CollaboratorsChart({ data }) {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return

    // Initialize chart
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current)
    }

    const chart = chartInstanceRef.current

    // Prepare data for chart
    const sortedData = [...data].sort((a, b) => b.totalKg - a.totalKg)
    const names = sortedData.map(d => d.name)
    const values = sortedData.map(d => d.totalKg)
    const maxValue = Math.max(...values, 1) // Avoid division by zero

    // Chart configuration
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params) => {
          const param = params[0]
          return `${param.name}<br/>${param.value.toFixed(2)} kg`
        }
      },
      grid: {
        left: '15%',
        right: '10%',
        top: '10%',
        bottom: '10%'
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} kg'
        }
      },
      yAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          fontSize: 12
        }
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#8B4513' },
              { offset: 1, color: '#D2691E' }
            ])
          },
          label: {
            show: true,
            position: 'right',
            formatter: '{c} kg'
          }
        }
      ]
    }

    chart.setOption(option)

    // Handle resize
    const handleResize = () => {
      chart.resize()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
      chartInstanceRef.current = null
    }
  }, [data])

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
        Sem dados disponíveis
      </div>
    )
  }

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '300px',
        minHeight: '200px'
      }}
    />
  )
}
