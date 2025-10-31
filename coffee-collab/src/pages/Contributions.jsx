// Contributions page
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { getAllContributions } from '../services/contributionService'
import { getActiveUsers } from '../services/userService'
import { getAllProducts, getProductById } from '../services/productService'
import { NewContributionModal } from '../components/NewContributionModal'
import { EditContributionModal } from '../components/EditContributionModal'

export function Contributions() {
  const { user } = useAuth()
  const [contributions, setContributions] = useState([])
  const [usersMap, setUsersMap] = useState({})
  const [productsMap, setProductsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [showNewContributionModal, setShowNewContributionModal] = useState(false)
  const [editingContributionId, setEditingContributionId] = useState(null)

  const loadContributions = async () => {
    try {
      const [contribs, usersList, productsList] = await Promise.all([
        getAllContributions(),
        getActiveUsers(),
        getAllProducts()
      ])
      
      setContributions(contribs)
      
      // Build users map for display names
      const usersMapObj = {}
      usersList.forEach(u => {
        usersMapObj[u.id] = u
      })
      setUsersMap(usersMapObj)
      
      // Build products map
      const productsMapObj = {}
      productsList.forEach(p => {
        productsMapObj[p.id] = p
      })
      setProductsMap(productsMapObj)
    } catch (error) {
      console.error('Error loading contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContributions()
  }, [])

  if (loading) {
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
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', color: '#FFF', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
            Contribuições
          </h1>
          <button
            onClick={() => setShowNewContributionModal(true)}
            style={{
              padding: '12px 24px',
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
            + Nova Contribuição
          </button>
        </div>

        {contributions.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '48px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '18px', color: '#666' }}>
              Nenhuma contribuição registrada ainda.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {contributions.map((contribution) => {
              const purchaseDate = contribution.purchaseDate?.toDate?.() || new Date(contribution.purchaseDate)
              const user = usersMap[contribution.userId]
              const product = productsMap[contribution.productId]
              const canEdit = user && (contribution.userId === user?.id || user?.isAdmin)
              
              return (
                <div
                  key={contribution.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        {user?.photoURL && (
                          <img
                            src={user.photoURL}
                            alt={user.name}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#8B4513' }}>
                            {user?.name || 'Usuário desconhecido'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#666' }}>
                            {purchaseDate.toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      
                      {product && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2d5016', marginBottom: '4px' }}>
                            {product.name}
                          </div>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                            <span>
                              R$ {product.averagePricePerKg?.toFixed(2) || '0.00'}/kg
                            </span>
                            <span>
                              {product.averageRating?.toFixed(1) || '0.0'} ⭐
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                        <div style={{ color: '#666', fontSize: '14px' }}>
                          Quantidade: <strong>{contribution.quantityKg?.toFixed(2) || 0} kg</strong>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d5016' }}>
                          R$ {contribution.value?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
                    {canEdit && (
                      <button
                        onClick={() => setEditingContributionId(contribution.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#FFF',
                          color: '#8B4513',
                          border: '2px solid #8B4513',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <NewContributionModal
        isOpen={showNewContributionModal}
        onClose={() => setShowNewContributionModal(false)}
        onSuccess={() => {
          // Reload contributions
          loadContributions()
        }}
      />

      {editingContributionId && (
        <EditContributionModal
          isOpen={!!editingContributionId}
          contributionId={editingContributionId}
          onClose={() => setEditingContributionId(null)}
          onSuccess={() => {
            // Reload contributions
            loadContributions()
            setEditingContributionId(null)
          }}
        />
      )}
    </Layout>
  )
}

