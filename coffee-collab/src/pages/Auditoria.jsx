// Página de auditoria de saldo por usuário
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { AuditBalanceChart } from '../components/AuditBalanceChart'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { getAllContributions, getContributionDetails } from '../services/contributionService'
import { getAllCompensations } from '../services/compensationService'
import { getAllUsers } from '../services/userService'
import { getAllProducts } from '../services/productService'
import { ensureImageUrl } from '../services/googleDriveService'
import {
  buildUserAuditTimeline,
  computeUserTotalsFromContributions,
  nearlyEqual
} from '../utils/auditTimeline'

export function Auditoria() {
  const { user } = useAuth()
  const { profile } = useUserProfile()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [contributions, setContributions] = useState([])
  const [compensations, setCompensations] = useState([])
  const [productsMap, setProductsMap] = useState({})
  const [selectedUserId, setSelectedUserId] = useState('')
  const [evidenceContext, setEvidenceContext] = useState(null)
  const [previewContribution, setPreviewContribution] = useState(null)

  useEffect(() => {
    if (user?.uid) setSelectedUserId((prev) => prev || user.uid)
  }, [user?.uid])

  useEffect(() => {
    if (!users.length) return
    if (!users.some((u) => u.id === selectedUserId)) {
      setSelectedUserId(user?.uid && users.some((u) => u.id === user.uid) ? user.uid : users[0].id)
    }
  }, [users, selectedUserId, user?.uid])

  useEffect(() => {
    setPreviewContribution(null)
  }, [selectedUserId])

  const load = async () => {
    try {
      setLoading(true)
      const [contribs, comps, usersList, products] = await Promise.all([
        getAllContributions(),
        getAllCompensations(),
        getAllUsers(),
        getAllProducts()
      ])

      const withDetails = await Promise.all(
        contribs.map(async (c) => {
          if (c.isDivided) {
            try {
              const details = await getContributionDetails(c.id)
              return { ...c, details }
            } catch {
              return c
            }
          }
          return c
        })
      )

      const pmap = {}
      products.forEach((p) => {
        pmap[p.id] = p
      })

      setContributions(withDetails)
      setCompensations(comps)
      setUsers(usersList.sort((a, b) => (a.name || '').localeCompare(b.name || '')))
      setProductsMap(pmap)
    } catch (e) {
      console.error('Auditoria load error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId]
  )

  const { points, summary, totals } = useMemo(() => {
    if (!selectedUser) {
      return { points: [], summary: { anyCompensationError: false, finalAuditedBalance: 0 }, totals: { totalCakes: 0, totalValue: 0 } }
    }
    const totalsCalc = computeUserTotalsFromContributions(contributions, selectedUser.id)
    const { points: rawPoints, summary: s } = buildUserAuditTimeline({
      user: selectedUser,
      contributions,
      compensations
    })
    const pointsEnriched = rawPoints.map((p) => {
      if (p.kind !== 'contribution') return p
      const pid = p.contribution?.productId
      const productName = pid ? productsMap[pid]?.name : null
      return { ...p, productName: productName || null }
    })
    return { points: pointsEnriched, summary: s, totals: totalsCalc }
  }, [selectedUser, contributions, compensations, productsMap])

  const balanceMismatch = useMemo(() => {
    if (!selectedUser || points.length === 0) return false
    const profileBalance = selectedUser.balance ?? 0
    const audited = summary.finalAuditedBalance ?? 0
    return !nearlyEqual(profileBalance, audited)
  }, [selectedUser, summary, points.length])

  const handleChartClick = useCallback((pt) => {
    if (pt.kind !== 'contribution') {
      setPreviewContribution(null)
      return
    }
    setPreviewContribution(pt.contribution)
  }, [])

  if (loading || !profile) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '48px', color: '#FFF' }}>
          <p>Carregando...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <h1
            style={{
              fontSize: '32px',
              color: '#FFF',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
              margin: 0
            }}
          >
            Auditoria de saldo
          </h1>
          <Link
            to="/home"
            style={{
              color: '#FFF8DC',
              textDecoration: 'none',
              fontSize: '15px',
              borderBottom: '1px solid rgba(255,255,255,0.5)'
            }}
          >
            ← Voltar ao painel
          </Link>
        </div>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <label
            htmlFor="audit-user-select"
            style={{ display: 'block', fontWeight: 'bold', color: '#8B4513', marginBottom: '10px' }}
          >
            Usuário auditado
          </label>
          <select
            id="audit-user-select"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '2px solid #DEB887',
              fontSize: '16px',
              color: '#333',
              background: '#FFF'
            }}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email || u.id}
                {!u.isActive ? ' (inativo)' : ''}
              </option>
            ))}
          </select>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '10px', marginBottom: 0 }}>
            Todos os usuários autenticados podem auditar qualquer perfil. O gráfico reconstrói o saldo a partir do
            cadastro, contribuições (por data de criação do registro) e compensações.
          </p>
        </div>

        {selectedUser && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '24px',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img
                src={selectedUser.photoURL || 'https://via.placeholder.com/88?text=%F0%9F%8D%B0'}
                alt={selectedUser.name}
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #D2691E',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.12)'
                }}
              />
              <div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#8B4513' }}>{selectedUser.name}</div>
                <div style={{ fontSize: '15px', color: '#555', marginTop: '6px' }}>
                  Saldo atual (perfil):{' '}
                  <strong style={{ color: '#8B4513' }}>{(selectedUser.balance ?? 0).toFixed(2)} 🍰</strong>
                </div>
                <div style={{ fontSize: '15px', color: '#555', marginTop: '4px' }}>
                  Total de bolos (histórico suas participações):{' '}
                  <strong>{totals.totalCakes.toFixed(2)} 🍰</strong>
                </div>
                <div style={{ fontSize: '15px', color: '#555', marginTop: '4px' }}>
                  Total gasto (sua parte em R$): <strong>R$ {totals.totalValue.toFixed(2)}</strong>
                </div>
                {balanceMismatch && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 12px',
                      background: '#FFF3E0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#E65100',
                      maxWidth: '420px'
                    }}
                  >
                    O saldo auditado ao final da linha ({summary.finalAuditedBalance?.toFixed(2)} 🍰) difere do saldo
                    gravado no perfil. Pode indicar dados antigos, edição manual ou necessidade de reprocessar saldos em
                    Configurações.
                  </div>
                )}
                {summary.anyCompensationError && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      background: '#FFEBEE',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#B71C1C',
                      maxWidth: '480px'
                    }}
                  >
                    Há ao menos uma compensação com valores inconsistentes em relação à sequência auditada
                    (pontos vermelhos no gráfico).
                  </div>
                )}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
                color: '#666',
                minWidth: '200px'
              }}
            >
              <div>
                <span style={{ fontWeight: 'bold', color: '#8B4513' }}>Legenda</span>
              </div>
              <div>● Início / fim da linha</div>
              <div>▲ Contribuição (saldo sobe)</div>
              <div>◆ Compensação (verde ok · vermelho erro)</div>
            </div>
          </div>
        )}

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <h2 style={{ fontSize: '20px', color: '#8B4513', marginTop: 0, marginBottom: '16px' }}>
            Linha do tempo do saldo (reconstrução auditada)
          </h2>
          <AuditBalanceChart points={points} productMap={productsMap} onPointClick={handleChartClick} />
          {previewContribution && (
            <div
              style={{
                marginTop: '20px',
                padding: '16px 18px',
                background: 'rgba(139, 69, 19, 0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(160, 82, 45, 0.35)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '14px',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ fontSize: '14px', color: '#444' }}>
                <strong style={{ color: '#8B4513' }}>Contribuição selecionada</strong>
                <div style={{ marginTop: '6px' }}>
                  {(previewContribution.quantityCakes ?? previewContribution.quantityKg ?? 0).toFixed(2)} 🍰 · R${' '}
                  {(previewContribution.value ?? 0).toFixed(2)}
                  {previewContribution.isHomemadeCake ? ' · Caseiro' : ''}
                </div>
              </div>
              {previewContribution.purchaseEvidence || previewContribution.arrivalEvidence ? (
                <button
                  type="button"
                  onClick={() => setEvidenceContext({ contribution: previewContribution })}
                  style={{
                    padding: '10px 18px',
                    background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                >
                  Evidências
                </button>
              ) : (
                <span style={{ fontSize: '13px', color: '#888' }}>Sem imagens de evidência nesta contribuição.</span>
              )}
            </div>
          )}
        </div>

        {evidenceContext && (
          <div
            role="presentation"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
            onClick={() => setEvidenceContext(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              style={{
                background: '#fff',
                borderRadius: '16px',
                maxWidth: '720px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#8B4513' }}>Evidências</h3>
                <button
                  type="button"
                  onClick={() => setEvidenceContext(null)}
                  style={{
                    border: 'none',
                    background: '#EEE',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Fechar
                </button>
              </div>
              {evidenceContext.contribution.purchaseEvidence && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Comprovante / compra</div>
                  <img
                    src={ensureImageUrl(evidenceContext.contribution.purchaseEvidence)}
                    alt="Evidência de compra"
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                  />
                </div>
              )}
              {evidenceContext.contribution.arrivalEvidence && (
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Chegada</div>
                  <img
                    src={ensureImageUrl(evidenceContext.contribution.arrivalEvidence)}
                    alt="Evidência de chegada"
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
