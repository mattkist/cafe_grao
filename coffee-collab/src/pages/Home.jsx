// Home page (Dashboard) - Most complex page
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { getUserProfile } from '../services/userService'
import { getAllContributions, getContributionsByUser } from '../services/contributionService'
import { getAllProducts } from '../services/productService'
import { getAllVotes, getVotesByUser } from '../services/voteService'
import { getActiveUsers } from '../services/userService'
import { getCalculationBaseMonths } from '../services/configurationService'
import { NewContributionModal } from '../components/NewContributionModal'
import { NewProductModal } from '../components/NewProductModal'
import { CollaboratorsChart } from '../components/CollaboratorsChart'
import { TimelineChart } from '../components/TimelineChart'

export function Home() {
  const { user, signOut } = useAuth()
  const { profile } = useUserProfile()
  const navigate = useNavigate()
  const [userStats, setUserStats] = useState({ totalValue: 0, totalKg: 0 })
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewContributionModal, setShowNewContributionModal] = useState(false)
  const [showNewProductModal, setShowNewProductModal] = useState(false)
  const [collaboratorsData, setCollaboratorsData] = useState([])
  const [indicators, setIndicators] = useState({
    totalValue: 0,
    totalKg: 0,
    avgMonthlyKg: 0,
    avgMonthlyValue: 0,
    avgPerCollaborator: 0
  })
  const [allContributions, setAllContributions] = useState([])
  const [calculationBaseMonths, setCalculationBaseMonths] = useState(6)

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      const [contributions, allContribs, users, baseMonths] = await Promise.all([
        getContributionsByUser(user.uid),
        getAllContributions(),
        getActiveUsers(),
        getCalculationBaseMonths()
      ])

      setCalculationBaseMonths(baseMonths || 6)

      // User stats
      const totalValue = contributions.reduce((sum, c) => sum + (c.value || 0), 0)
      const totalKg = contributions.reduce((sum, c) => sum + (c.quantityKg || 0), 0)
      setUserStats({ totalValue, totalKg })

      // Calculate date range for ranking
      const endDate = new Date()
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - baseMonths)

      // Calculate collaborators ranking
      const collaboratorsRanking = users.map(user => {
        const userContribs = allContribs.filter(c => {
          const contribDate = c.purchaseDate?.toDate?.() || new Date(c.purchaseDate)
          return c.userId === user.id && contribDate >= startDate && contribDate <= endDate
        })
        
        const totalKg = userContribs.reduce((sum, c) => sum + (c.quantityKg || 0), 0)
        
        return {
          name: user.name,
          totalKg
        }
      }).filter(c => c.totalKg > 0)

      setCollaboratorsData(collaboratorsRanking)

      // Calculate indicators
      const allKg = allContribs.reduce((sum, c) => sum + (c.quantityKg || 0), 0)
      const allValue = allContribs.reduce((sum, c) => sum + (c.value || 0), 0)
      
      // Calculate months with contributions
      const monthsSet = new Set()
      allContribs.forEach(c => {
        const date = c.purchaseDate?.toDate?.() || new Date(c.purchaseDate)
        monthsSet.add(`${date.getFullYear()}-${date.getMonth()}`)
      })
      const monthsCount = Math.max(monthsSet.size, 1)

      setIndicators({
        totalValue: allValue,
        totalKg: allKg,
        avgMonthlyKg: allKg / monthsCount,
        avgMonthlyValue: allValue / monthsCount,
        avgPerCollaborator: users.length > 0 ? allValue / users.length : 0
      })

      setAllContributions(allContribs)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

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
        {/* Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{ fontSize: '32px', color: '#8B4513', margin: 0 }}>CAFÉ GRÃO</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'background 150ms ease'
              }}
              onClick={() => navigate('/settings')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 69, 19, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <img
                src={profile.photoURL || user.photoURL || 'https://via.placeholder.com/48?text=☕'}
                alt={profile.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid #D2691E'
                }}
              />
              <div>
                <div style={{ fontWeight: 'bold', color: '#8B4513' }}>{profile.name}</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Total: R$ {userStats.totalValue.toFixed(2)} | {userStats.totalKg.toFixed(2)} kg
                </div>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                style={{
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                + Novo
              </button>

              {showAddMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: '#FFF',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    padding: '8px',
                    minWidth: '200px',
                    zIndex: 100
                  }}
                >
                  <button
                    onClick={() => {
                      setShowAddMenu(false)
                      setShowNewContributionModal(true)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F5F5F5'
                    }}
                  >
                    📝 Nova Contribuição
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMenu(false)
                      navigate('/votes')
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F5F5F5'
                    }}
                  >
                    ⭐ Votação
                  </button>
                  <button
                    onClick={() => {
                      setShowAddMenu(false)
                      setShowNewProductModal(true)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F5F5F5'
                    }}
                  >
                    🏷️ Novo Produto
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '12px 20px',
                background: '#FFF',
                color: '#8B4513',
                border: '2px solid #8B4513',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Sair
            </button>
          </div>
        </div>

        {/* Avisos section - TODO: Implement alerts logic */}
        <div style={{ marginBottom: '24px' }}>
          {/* Alerts will be implemented here */}
        </div>

        {/* Dashboard Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h2 style={{ fontSize: '20px', color: '#8B4513', marginBottom: '16px' }}>
              Colaboradores
            </h2>
            <CollaboratorsChart data={collaboratorsData} />
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h2 style={{ fontSize: '20px', color: '#8B4513', marginBottom: '16px' }}>
              Indicadores
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(139, 69, 19, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Valor Total Investido</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8B4513' }}>
                  R$ {indicators.totalValue.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(139, 69, 19, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>KGs Total Consumido</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8B4513' }}>
                  {indicators.totalKg.toFixed(2)} kg
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(139, 69, 19, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Média Consumo Mensal</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B4513' }}>
                  {indicators.avgMonthlyKg.toFixed(2)} kg
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(139, 69, 19, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Média Investimento Mensal</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B4513' }}>
                  R$ {indicators.avgMonthlyValue.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(139, 69, 19, 0.05)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Média Custo por Colaborador</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B4513' }}>
                  R$ {indicators.avgPerCollaborator.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h2 style={{ fontSize: '20px', color: '#8B4513', marginBottom: '16px' }}>
              Linha do Tempo
            </h2>
            <TimelineChart contributions={allContributions} />
          </div>
        </div>
      </div>

      <NewContributionModal
        isOpen={showNewContributionModal}
        onClose={() => setShowNewContributionModal(false)}
        onSuccess={() => {
          // Reload all data
          loadData()
        }}
      />

      <NewProductModal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
        onSuccess={() => {
          // Optionally reload data if needed
        }}
      />
    </Layout>
  )
}

