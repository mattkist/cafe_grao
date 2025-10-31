// Settings page
import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { useAuth } from '../hooks/useAuth'
import { useUserProfile } from '../hooks/useUserProfile'
import { updateUserProfile } from '../services/userService'
import { getCalculationBaseMonths, setCalculationBaseMonths } from '../services/configurationService'

export function Settings() {
  const { user } = useAuth()
  const { profile, refreshProfile } = useUserProfile()
  const [calculationMonths, setCalculationMonths] = useState(6)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const months = await getCalculationBaseMonths()
        setCalculationMonths(months)
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSaveMonths = async () => {
    setSaving(true)
    try {
      await setCalculationBaseMonths(calculationMonths)
      alert('Configuração salva com sucesso!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Erro ao salvar configuração')
    } finally {
      setSaving(false)
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
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', color: '#FFF', marginBottom: '24px', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)' }}>
          Settings
        </h1>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            marginBottom: '24px'
          }}
        >
          <h2 style={{ fontSize: '24px', color: '#8B4513', marginBottom: '24px' }}>
            Seus Dados
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
                Nome
              </label>
              <input
                type="text"
                value={profile.name || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #DDD',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: '#F5F5F5'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
                Email
              </label>
              <input
                type="email"
                value={profile.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #DDD',
                  borderRadius: '8px',
                  fontSize: '16px',
                  background: '#F5F5F5'
                }}
              />
            </div>
            {profile.photoURL && (
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
                  Foto
                </label>
                <img
                  src={profile.photoURL}
                  alt={profile.name}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    border: '3px solid #D2691E',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {profile.isAdmin && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h2 style={{ fontSize: '24px', color: '#8B4513', marginBottom: '24px' }}>
              Configurações do Sistema
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#666', fontWeight: 'bold' }}>
                  Quantidade de Meses para Base de Cálculo
                </label>
                <input
                  type="number"
                  value={calculationMonths}
                  onChange={(e) => setCalculationMonths(parseInt(e.target.value) || 6)}
                  min="1"
                  max="24"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #DDD',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <button
                onClick={handleSaveMonths}
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
        )}
      </div>
    </Layout>
  )
}

