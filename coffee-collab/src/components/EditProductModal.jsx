// Modal for editing a product
import { useState, useEffect } from 'react'
import { getProductById, updateProduct, deleteProduct } from '../services/productService'
import { getAllContributions } from '../services/contributionService'
import { uploadProductPhoto } from '../services/storageService'
import { ensureImageUrl } from '../services/googleDriveService'

export function EditProductModal({ isOpen, onClose, productId, onSuccess }) {
  const [product, setProduct] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoLink, setPhotoLink] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasContributions, setHasContributions] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return
      
      try {
        setLoading(true)
        const productData = await getProductById(productId)
        
        if (productData) {
          setProduct(productData)
          setName(productData.name || '')
          setDescription(productData.description || '')
          setPhotoLink(productData.photoURL || '')
          
          // Check if product has contributions
          const contributions = await getAllContributions()
          const hasContribs = contributions.some(c => c.productId === productId)
          setHasContributions(hasContribs)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        alert('Erro ao carregar produto')
        onClose()
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && productId) {
      loadProduct()
    }
  }, [isOpen, productId, onClose])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim()) {
      alert('Nome é obrigatório')
      return
    }

    setSaving(true)
    try {
      // Update product
      await updateProduct(productId, {
        name: name.trim(),
        description: description.trim() || null
      })

      // Upload photo if provided
      if (photoLink || photoFile) {
        try {
          const photoInput = photoLink || photoFile
          const photoURL = await uploadProductPhoto(photoInput, productId)
          await updateProduct(productId, { photoURL })
        } catch (uploadError) {
          console.error('Error uploading product photo:', uploadError)
          alert(`Aviso: Produto atualizado, mas upload da foto falhou: ${uploadError.message}`)
        }
      }

      if (onSuccess) onSuccess()
      onClose()
      alert('Produto atualizado com sucesso!')
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Erro ao atualizar produto. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (hasContributions) {
      alert('Não é possível deletar este produto pois ele possui contribuições vinculadas.')
      return
    }

    if (!confirm('Tem certeza que deseja deletar este produto?')) {
      return
    }

    setSaving(true)
    try {
      await deleteProduct(productId)
      if (onSuccess) onSuccess()
      onClose()
      alert('Produto deletado com sucesso!')
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Erro ao deletar produto. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  if (loading) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: '#FFF',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <p style={{ textAlign: 'center', color: '#666' }}>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', color: '#8B4513', margin: 0 }}>Editar Produto</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {product?.photoURL && !photoPreview && (
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>
            <img
              src={ensureImageUrl(product.photoURL)}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '8px'
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #DDD',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #DDD',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
              Foto
            </label>
            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
              Selecione um arquivo para upload automático (ou cole o link do Google Drive se preferir manual)
            </div>
            <input
              type="text"
              value={photoLink}
              onChange={(e) => {
                setPhotoLink(e.target.value)
                setPhotoFile(null)
                setPhotoPreview(null)
              }}
              placeholder="Cole aqui o link do Google Drive (ou selecione arquivo abaixo)"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #DDD',
                borderRadius: '8px',
                fontSize: '16px',
                marginBottom: '8px'
              }}
            />
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>OU</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                handlePhotoChange(e)
                setPhotoLink('')
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #DDD',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            />
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  marginTop: '12px',
                  borderRadius: '8px'
                }}
              />
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || hasContributions}
              style={{
                padding: '12px 24px',
                background: hasContributions ? '#CCC' : '#DC3545',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: (saving || hasContributions) ? 'not-allowed' : 'pointer',
                opacity: hasContributions ? 0.6 : 1
              }}
              title={hasContributions ? 'Produto possui contribuições vinculadas' : 'Deletar produto'}
            >
              Deletar
            </button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  background: '#FFF',
                  color: '#8B4513',
                  border: '2px solid #8B4513',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  background: saving ? '#CCC' : 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
                  color: '#FFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

