// Gráfico de linha do tempo do saldo (auditoria) — ECharts, estilo alinhado ao restante do app
import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

function esc(s) {
  if (s == null || s === '') return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatPtDate(ms) {
  return new Date(ms).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function tooltipHtml(point, productMap) {
  if (point.kind === 'origin') {
    return [
      '<div style="font-weight:bold;color:#8B4513;margin-bottom:8px;">Início do cadastro</div>',
      `<div style="font-size:13px;">${esc(formatPtDate(point.t))}</div>`,
      '<div style="margin-top:8px;">Saldo: <strong>0 🍰</strong></div>'
    ].join('')
  }

  if (point.kind === 'end') {
    return [
      '<div style="font-weight:bold;color:#8B4513;margin-bottom:8px;">Projeção auditada</div>',
      `<div style="font-size:13px;">${esc(formatPtDate(point.t))}</div>`,
      `<div style="margin-top:8px;">Saldo após eventos: <strong>${point.balance.toFixed(2)} 🍰</strong></div>`
    ].join('')
  }

  if (point.kind === 'contribution') {
    const c = point.contribution
    const pname =
      point.productName ||
      (c.productId && productMap?.[c.productId]?.name) ||
      null
    const totalCakes = c.quantityCakes ?? c.quantityKg ?? 0
    const totalVal = c.value ?? 0
    const homemade = !!c.isHomemadeCake
    let participants = ''
    if (c.isDivided && c.details?.length) {
      participants = c.details
        .map(
          (d) =>
            `${esc(d.userName || d.userId)}: ${(d.quantityCakes ?? d.quantityKg ?? 0).toFixed(2)} 🍰`
        )
        .join('<br/>')
    } else {
      participants = 'Contribuição individual (comprador recebe o total).'
    }
    const evid =
      c.purchaseEvidence || c.arrivalEvidence
        ? '<div style="margin-top:8px;color:#8B4513;font-size:12px;">📎 Selecione o ponto no gráfico e use o botão <strong>Evidências</strong> abaixo do gráfico.</div>'
        : ''

    return [
      '<div style="font-weight:bold;color:#8B4513;margin-bottom:8px;">Contribuição</div>',
      `<div style="font-size:12px;color:#666;">${esc(formatPtDate(point.t))}</div>`,
      `<div style="margin-top:10px;">Sua parte: <strong>+${point.cakesAdded.toFixed(2)} 🍰</strong> → saldo <strong>${point.balance.toFixed(2)} 🍰</strong></div>`,
      `<div style="margin-top:8px;font-size:13px;">Total na compra: <strong>${totalCakes.toFixed(2)} 🍰</strong> · Preço: <strong>R$ ${totalVal.toFixed(2)}</strong></div>`,
      `<div style="margin-top:6px;">${homemade ? '<strong>Bolo caseiro</strong>' : 'Bolo comprado'}</div>`,
      pname
        ? `<div style="margin-top:6px;font-size:13px;">Produto: <strong>${esc(pname)}</strong></div>`
        : '',
      '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #E0E0E0;font-size:12px;line-height:1.5;"><strong>Participantes / divisão</strong><br/>',
      participants,
      '</div>',
      evid
    ].join('')
  }

  if (point.kind === 'compensation') {
    const d = point.detail
    const ok = point.valid
    const statusColor = ok ? '#2E7D32' : '#C62828'
    const statusText = ok ? 'Registro consistente' : 'Inconsistência detectada'
    const compCakes = point.compensationCakes
    return [
      `<div style="font-weight:bold;color:${statusColor};margin-bottom:8px;">Compensação — ${esc(statusText)}</div>`,
      `<div style="font-size:12px;color:#666;">${esc(formatPtDate(point.t))}</div>`,
      `<div style="margin-top:10px;">Bolos compensados (você): <strong>${compCakes.toFixed(2)} 🍰</strong></div>`,
      `<div style="margin-top:6px;">Saldo antes (registrado): <strong>${(d.balanceBefore ?? 0).toFixed(2)} 🍰</strong> · esperado pelo audit: <strong>${point.expectedBefore.toFixed(2)} 🍰</strong></div>`,
      `<div style="margin-top:6px;">Saldo depois (registrado): <strong>${(d.balanceAfter ?? 0).toFixed(2)} 🍰</strong> · esperado: <strong>${point.expectedAfter.toFixed(2)} 🍰</strong></div>`,
      !ok
        ? `<div style="margin-top:10px;padding:8px;background:#FFEBEE;border-radius:6px;font-size:12px;color:#B71C1C;">O saldo inicial da compensação deveria coincidir com o saldo auditado até ali, e o final com (inicial − bolos compensados).</div>`
        : ''
    ].join('')
  }

  return ''
}

export function AuditBalanceChart({ points, productMap, onPointClick }) {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const pointsRef = useRef(points)
  const onPointClickRef = useRef(onPointClick)
  const productMapRef = useRef(productMap)

  useEffect(() => {
    pointsRef.current = points
  }, [points])

  useEffect(() => {
    onPointClickRef.current = onPointClick
  }, [onPointClick])

  useEffect(() => {
    productMapRef.current = productMap
  }, [productMap])

  useEffect(() => {
    if (!points || points.length === 0) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose()
        chartInstanceRef.current = null
      }
      return
    }

    if (!chartRef.current) return

    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current)
    }
    const chart = chartInstanceRef.current

    const lineData = points.map((p) => {
      let color = '#8B4513'
      let symbol = 'circle'
      let symbolSize = 8
      if (p.kind === 'origin') {
        color = '#6D4C41'
        symbol = 'circle'
        symbolSize = 7
      } else if (p.kind === 'end') {
        color = '#5D4037'
        symbol = 'emptyCircle'
        symbolSize = 7
      } else if (p.kind === 'contribution') {
        color = '#A0522D'
        symbol = 'triangle'
        symbolSize = 11
      } else if (p.kind === 'compensation') {
        color = p.valid ? '#2E7D32' : '#C62828'
        symbol = 'diamond'
        symbolSize = 12
      }
      return {
        value: [p.t, p.balance],
        symbol,
        symbolSize,
        itemStyle: { color, borderColor: '#fff', borderWidth: 1 }
      }
    })

    const option = {
      animationDuration: 800,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        borderColor: '#8B4513',
        borderWidth: 2,
        textStyle: { color: '#333', fontSize: 13 },
        padding: [14, 18],
        extraCssText:
          'box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 380px; white-space: normal; word-wrap: break-word;',
        formatter: (param) => {
          const idx = param.dataIndex
          const pt = pointsRef.current[idx]
          if (!pt) return ''
          return tooltipHtml(pt, productMapRef.current)
        }
      },
      grid: { left: '12%', right: '8%', top: '14%', bottom: '18%' },
      xAxis: {
        type: 'value',
        scale: true,
        axisLabel: {
          formatter: (v) => {
            const d = new Date(v)
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
          },
          fontSize: 10,
          color: '#555'
        },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } }
      },
      yAxis: {
        type: 'value',
        name: 'Saldo 🍰',
        axisLabel: {
          formatter: (v) => `${Number(v).toFixed(1)} 🍰`,
          fontSize: 10
        },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } }
      },
      series: [
        {
          name: 'Saldo auditado',
          type: 'line',
          smooth: 0.25,
          showSymbol: true,
          symbolSize: 10,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#8B4513' },
              { offset: 0.5, color: '#D2691E' },
              { offset: 1, color: '#DEB887' }
            ])
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(160, 82, 45, 0.25)' },
              { offset: 1, color: 'rgba(222, 184, 135, 0.02)' }
            ])
          },
          data: lineData
        }
      ]
    }

    chart.setOption(option, true)

    const onClick = (params) => {
      if (params?.componentType !== 'series') return
      const idx = params.dataIndex
      const pt = pointsRef.current[idx]
      if (pt && onPointClickRef.current) onPointClickRef.current(pt)
    }
    chart.on('click', onClick)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      chart.off('click', onClick)
      window.removeEventListener('resize', handleResize)
      chart.dispose()
      chartInstanceRef.current = null
    }
  }, [points])

  if (!points || points.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
        Sem eventos para exibir nesta auditoria.
      </div>
    )
  }

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '420px',
        minHeight: '280px'
      }}
    />
  )
}
