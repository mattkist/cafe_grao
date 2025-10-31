// Votes page
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { getAllProducts } from '../services/productService'
import { getVotesByUser, createOrUpdateVote } from '../services/voteService'
import { ensureImageUrl } from '../services/googleDriveService'

export function Votes() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [userVotes, setUserVotes] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsList, votes] = await Promise.all([
          getAllProducts(),
          user ? getVotesByUser(user.uid) : Promise.resolve([])
        ])
        
        setProducts(productsList)
        
        const votesMap = {}
        votes.forEach(vote => {
          votesMap[vote.productId] = vote.rating
        })
        setUserVotes(votesMap)
      } catch (error) {
        console.error('Error loading votes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleVote = async (productId, rating) => {
    if (!user) return
    
    try {
      await createOrUpdateVote(user.uid, productId, rating)
      
      // Update local state
      setUserVotes(prev => ({
        ...prev,
        [productId]: rating
      }))
      
      // Refresh products to update average rating
      const updatedProducts = await getAllProducts()
      setProducts(updatedProducts)
    } catch (error) {
      console.error('Error voting:', error)
      alert('Erro ao votar')
    }
  }

  const renderStars = (productId, currentRating) => {
    const stars = []
    for (let i = 0.5; i <= 5; i += 0.5) {
      stars.push(
        <span
          key={i}
          onClick={() => handleVote(productId, i)}
          style={{
            fontSize: '24px',
            cursor: 'pointer',
            color: i <= currentRating ? '#FFD700' : '#DDD',
            transition: 'transform 150ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.2)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {i % 1 === 0 ? '⭐' : '✦'}
        </span>
      )
    }
    return stars
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '48px', color: '#FFF' }}>
          <p>Carregando...</p>
        </div>
      </Layout>
    )
  }

  const productsWithoutVote = products.filter(p => !userVotes[p.id])
  const sortedProducts = [...productsWithoutVote, ...products.filter(p => userVotes[p.id])]

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', color: '#FFF', marginBottom: '24px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
          Votações
        </h1>

        {sortedProducts.length === 0 ? (
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
              Nenhum produto cadastrado ainda.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {sortedProducts.map((product) => {
              const userVote = userVotes[product.id] || 0
              const hasVoted = userVote > 0
              
              return (
                <div
                  key={product.id}
                  style={{
                    background: hasVoted 
                      ? 'rgba(255, 255, 255, 0.95)'
                      : 'rgba(255, 248, 231, 0.95)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: hasVoted 
                      ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                      : '0 4px 12px rgba(218, 165, 32, 0.3)',
                    border: hasVoted ? 'none' : '2px solid #DAA520'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    {product.photoURL && (
                      <img
                        src={ensureImageUrl(product.photoURL)}
                        alt={product.name}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          console.error('Error loading image:', product.photoURL)
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '20px', color: '#8B4513', marginBottom: '4px' }}>
                        {product.name}
                      </h3>
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                        Média: {product.averageRating.toFixed(1)} ⭐ | R$ {product.averagePricePerKg.toFixed(2)}/kg
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {renderStars(product.id, userVote)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

