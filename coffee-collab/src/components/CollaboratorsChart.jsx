// Collaborators ranking chart component - Bar Race with images
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export function CollaboratorsChart({ data, users }) {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (!chartRef.current || !data || !users) return

    // Initialize chart
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current)
    }

    const chart = chartInstanceRef.current

    // Create map of user data
    const userDataMap = {}
    data.forEach(d => {
      userDataMap[d.userId || d.name] = d.totalKg
    })

    // Include all users, even those with 0 contributions
    const allUsersData = users.map(user => ({
      id: user.id,
      name: user.name,
      photoURL: user.photoURL,
      totalKg: userDataMap[user.id] || 0
    }))

    // Sort by totalKg descending
    const sortedData = [...allUsersData].sort((a, b) => b.totalKg - a.totalKg)
    const names = sortedData.map(d => d.name)
    const values = sortedData.map(d => d.totalKg)
    const photoURLs = sortedData.map(d => d.photoURL)

    // Chart configuration for bar race
    const option = {
      animationDuration: 1000,
      animationEasing: 'elasticOut',
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
        left: '20%',
        right: '10%',
        top: '10%',
        bottom: '10%'
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value} kg'
        },
        max: (value) => Math.max(value.max * 1.1, 1) // Add some padding
      },
      yAxis: {
        type: 'category',
        data: names,
        inverse: true, // Top to bottom
        axisLabel: {
          fontSize: 12,
          margin: 50,
          rich: photoURLs.reduce((acc, photoURL, idx) => {
            // Use data URI or image URL format
            const imageUrl = photoURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTQiIGN5PSIxNCIgcj0iMTQiIGZpbGw9IiNERTZBOUI3Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOEY0NTEzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+4py9PC90ZXh0Pgo8L3N2Zz4='
            acc[`img${idx}`] = {
              height: 28,
              width: 28,
              backgroundColor: {
                image: imageUrl
              },
              borderRadius: 14
            }
            return acc
          }, {}),
          formatter: (value, index) => {
            return `{img${index}|} ${value}`
          }
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
            formatter: '{c} kg',
            fontSize: 12
          },
          barWidth: 40,
          animationDelay: (idx) => idx * 50
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
  }, [data, users])

  if (!data || !users || users.length === 0) {
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
        height: '400px',
        minHeight: '300px'
      }}
    />
  )
}
