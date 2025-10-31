// Users page - Admin only
import { useEffect, useState } from 'react'
import { Layout } from '../components/Layout'
import { useUserProfile } from '../hooks/useUserProfile'
import { getAllUsers, updateUserProfile } from '../services/userService'

export function Users() {
  const { profile } = useUserProfile()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadUsers = async () => {
    try {
      const usersList = await getAllUsers()
      setUsers(usersList)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleToggleFlag = async (userId, flagName, currentValue) => {
    if (saving) return
    
    setSaving(true)
    try {
      await updateUserProfile(userId, {
        [flagName]: !currentValue
      })
      // Reload users to reflect changes
      await loadUsers()
      alert(`${flagName === 'isAdmin' ? 'Status de administrador' : 'Status de ativo'} atualizado com sucesso!`)
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Erro ao atualizar usuário. Tente novamente.')
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

  // This page should be protected by route, but double-check
  if (!profile.isAdmin) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '48px', color: '#FFF' }}>
          <p>Acesso negado. Apenas administradores podem acessar esta página.</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', color: '#FFF', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)', marginBottom: '24px' }}>
          Usuários
        </h1>

        {users.length === 0 ? (
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
              Nenhum usuário encontrado.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                  {!user.photoURL && (
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #A0522D 0%, #D2691E 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFF',
                        fontSize: '24px'
                      }}
                    >
                      ☕
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8B4513', marginBottom: '4px' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {user.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: user.isAdmin ? 'rgba(139, 69, 19, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '8px',
                      flex: 1,
                      minWidth: '200px'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: saving ? 'not-allowed' : 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={user.isAdmin || false}
                        onChange={() => handleToggleFlag(user.id, 'isAdmin', user.isAdmin)}
                        disabled={saving}
                        style={{ width: '20px', height: '20px', cursor: saving ? 'not-allowed' : 'pointer' }}
                      />
                      <span style={{ fontWeight: 'bold', color: '#8B4513' }}>Administrador</span>
                    </label>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: user.isActive ? 'rgba(34, 139, 34, 0.1)' : 'rgba(220, 20, 60, 0.1)',
                      borderRadius: '8px',
                      flex: 1,
                      minWidth: '200px'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: saving ? 'not-allowed' : 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={user.isActive || false}
                        onChange={() => handleToggleFlag(user.id, 'isActive', user.isActive)}
                        disabled={saving}
                        style={{ width: '20px', height: '20px', cursor: saving ? 'not-allowed' : 'pointer' }}
                      />
                      <span style={{ fontWeight: 'bold', color: user.isActive ? '#228B22' : '#DC143C' }}>
                        Ativo
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
