/**
 * Monta a linha do tempo de saldo (bolos) para auditoria de um usuário.
 * Ordena por createdAt (contribuições e compensações), com fallback documentado.
 */

function toDate(ts) {
  if (!ts) return null
  if (typeof ts.toDate === 'function') return ts.toDate()
  return new Date(ts)
}

export function nearlyEqual(a, b, eps = 0.02) {
  return Math.abs((a || 0) - (b || 0)) <= eps
}

export function getUserShareFromContribution(contribution, userId) {
  if (contribution.isDivided && contribution.details?.length) {
    const d = contribution.details.find((x) => x.userId === userId)
    if (!d) return null
    const cakes = d.quantityCakes ?? d.quantityKg ?? 0
    return { cakes, value: d.value ?? 0 }
  }
  if (contribution.userId === userId) {
    const cakes = contribution.quantityCakes ?? contribution.quantityKg ?? 0
    return { cakes, value: contribution.value ?? 0 }
  }
  return null
}

export function contributionSortTime(contribution) {
  return toDate(contribution.createdAt) || toDate(contribution.purchaseDate)
}

export function compensationSortTime(compensation) {
  return toDate(compensation.createdAt) || toDate(compensation.date)
}

export function compensationCakesAmount(detail) {
  return detail.compensationCakes ?? detail.compensationKg ?? 0
}

/**
 * @param {object} params
 * @param {object} params.user — perfil com id, createdAt
 * @param {Array} params.contributions — todas as contribuições (com details se isDivided)
 * @param {Array} params.compensations — todas as compensações com details
 * @returns {{ points: Array, summary: { anyCompensationError: boolean } }}
 */
export function buildUserAuditTimeline({ user, contributions, compensations }) {
  const userId = user?.id
  if (!userId) {
    return { points: [], summary: { anyCompensationError: false, finalAuditedBalance: 0 } }
  }

  const originDate = toDate(user.createdAt) || new Date(0)

  const events = []

  for (const c of contributions) {
    const share = getUserShareFromContribution(c, userId)
    if (!share) continue
    const t = contributionSortTime(c)
    if (!t) continue
    events.push({
      kind: 'contribution',
      t: new Date(t.getTime()),
      contribution: c,
      share
    })
  }

  for (const comp of compensations) {
    const detail = comp.details?.find((d) => d.userId === userId)
    if (!detail) continue
    const t = compensationSortTime(comp)
    if (!t) continue
    events.push({
      kind: 'compensation',
      t: new Date(t.getTime()),
      compensation: comp,
      detail
    })
  }

  events.sort((a, b) => {
    const ta = a.t.getTime()
    const tb = b.t.getTime()
    if (ta !== tb) return ta - tb
    if (a.kind !== b.kind) return a.kind === 'contribution' ? -1 : 1
    const ida = a.contribution?.id || a.compensation?.id || ''
    const idb = b.contribution?.id || b.compensation?.id || ''
    return ida.localeCompare(idb)
  })

  let lastMs = originDate.getTime()
  for (const e of events) {
    let ms = e.t.getTime()
    if (ms <= lastMs) ms = lastMs + 1
    e.t = new Date(ms)
    lastMs = ms
  }

  let running = 0
  const points = []
  let anyCompensationError = false

  points.push({
    kind: 'origin',
    t: originDate.getTime(),
    balance: 0,
    label: 'Início do cadastro'
  })

  for (const e of events) {
    if (e.kind === 'contribution') {
      const add = e.share.cakes
      running += add
      points.push({
        kind: 'contribution',
        t: e.t.getTime(),
        balance: running,
        contribution: e.contribution,
        share: e.share,
        cakesAdded: add
      })
    } else {
      const detail = e.detail
      const compAmount = compensationCakesAmount(detail)
      const expectedBefore = running
      const expectedAfter = expectedBefore - compAmount

      const beforeOk = nearlyEqual(detail.balanceBefore, expectedBefore)
      const formulaOk = nearlyEqual(
        detail.balanceAfter,
        (detail.balanceBefore ?? 0) - compAmount
      )
      const afterOk = nearlyEqual(detail.balanceAfter, expectedAfter)
      const valid = beforeOk && formulaOk && afterOk
      if (!valid) anyCompensationError = true

      running = expectedAfter

      points.push({
        kind: 'compensation',
        t: e.t.getTime(),
        balance: running,
        compensation: e.compensation,
        detail,
        expectedBefore,
        expectedAfter,
        compensationCakes: compAmount,
        beforeOk,
        formulaOk,
        afterOk,
        valid
      })
    }
  }

  const endT = Date.now()
  if (points.length === 0 || points[points.length - 1].t < endT) {
    points.push({
      kind: 'end',
      t: endT,
      balance: running,
      label: 'Hoje (projeção auditada)'
    })
  }

  return {
    points,
    summary: { anyCompensationError, finalAuditedBalance: running }
  }
}

export function computeUserTotalsFromContributions(contributions, userId) {
  let totalCakes = 0
  let totalValue = 0
  for (const c of contributions) {
    const share = getUserShareFromContribution(c, userId)
    if (!share) continue
    totalCakes += share.cakes
    totalValue += share.value
  }
  return { totalCakes, totalValue }
}
