// Products page
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { getAllProducts } from '../services/productService'
import { NewProductModal } from '../components/NewProductModal'
import { ensureImageUrl } from '../services/googleDriveService'

export function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewProductModal, setShowNewProductModal] = useState(false)

  const loadProducts = async () => {
    try {
      const productsList = await getAllProducts()
      setProducts(productsList)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
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
            Produtos
          </h1>
          <button
            onClick={() => setShowNewProductModal(true)}
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
            + Novo Produto
          </button>
        </div>

        {products.length === 0 ? (
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'transform 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {product.photoURL && (
                  <img
                    src={ensureImageUrl(product.photoURL)}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}
                    onError={(e) => {
                      console.error('Error loading image:', product.photoURL)
                      e.target.style.display = 'none'
                    }}
                  />
                )}
                <h3 style={{ fontSize: '20px', color: '#8B4513', marginBottom: '8px' }}>
                  {product.name}
                </h3>
                {product.description && (
                  <p style={{ color: '#666', marginBottom: '12px', fontSize: '14px' }}>
                    {product.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#8B4513', fontWeight: 'bold' }}>
                      R$ {product.averagePricePerKg?.toFixed(2) || '0.00'}/kg
                    </div>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      {product.averageRating?.toFixed(1) || '0.0'} ⭐
                    </div>
                  </div>
                  <button
                    onClick={() => alert('Edição será implementada')}
                    style={{
                      padding: '8px 16px',
                      background: '#FFF',
                      color: '#8B4513',
                      border: '2px solid #8B4513',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewProductModal
        isOpen={showNewProductModal}
        onClose={() => setShowNewProductModal(false)}
        onSuccess={() => {
          // Reload products
          loadProducts()
        }}
      />
    </Layout>
  )
}

