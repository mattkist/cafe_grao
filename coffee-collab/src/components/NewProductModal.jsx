// Modal for creating a new product
import { useState } from 'react'
import { createProduct } from '../services/productService'
import { uploadProductPhoto } from '../services/storageService'

export function NewProductModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoLink, setPhotoLink] = useState('')
  const [saving, setSaving] = useState(false)

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
      // Create product first to get the ID
      const productId = await createProduct({
        name: name.trim(),
        description: description.trim() || null,
        photoURL: null // Will be updated after upload
      })

      // Upload photo if provided
      let photoURL = null
      if (photoLink || photoFile) {
        try {
          const photoInput = photoLink || photoFile
          photoURL = await uploadProductPhoto(photoInput, productId)
          // Update product with photo URL
          const { updateProduct } = await import('../services/productService')
          await updateProduct(productId, { photoURL })
        } catch (uploadError) {
          console.error('Error uploading product photo:', uploadError)
          alert(`Aviso: Produto criado, mas upload da foto falhou: ${uploadError.message}`)
        }
      }

      // Reset form
      setName('')
      setDescription('')
      setPhotoFile(null)
      setPhotoPreview(null)
      setPhotoLink('')

      if (onSuccess) onSuccess()
      onClose()
      alert('Produto criado com sucesso!')
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Erro ao criar produto. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

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
          <h2 style={{ fontSize: '24px', color: '#8B4513', margin: 0 }}>Novo Produto</h2>
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
            {photoLink && !photoPreview && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
                Link do Google Drive: {photoLink.substring(0, 50)}...
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
        </form>
      </div>
    </div>
  )
}

