// Sidebar navigation component
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUserProfile } from '../hooks/useUserProfile'

const menuItems = [
  { path: '/home', icon: '🏠', label: 'Home' },
  { path: '/contributions', icon: '📝', label: 'Contribuições' },
  { path: '/votes', icon: '⭐', label: 'Votações' },
  { path: '/products', icon: '🏷️', label: 'Produtos' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
  { path: '/users', icon: '👥', label: 'Usuários', adminOnly: true }
]

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const location = useLocation()
  const { profile } = useUserProfile()

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: isExpanded ? '200px' : '64px',
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #D2691E 100%)',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.15)',
        transition: 'width 300ms ease',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0'
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        style={{
          padding: '0 16px',
          marginBottom: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span style={{ fontSize: '24px' }}>☕</span>
        {isExpanded && (
          <span style={{ color: '#FFF', fontWeight: 'bold', fontSize: '14px' }}>
            CAFÉ GRÃO
          </span>
        )}
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => {
          // Hide admin-only items if user is not admin
          if (item.adminOnly && (!profile || !profile.isAdmin)) {
            return null
          }

          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                margin: '4px 8px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive ? '#FFF' : '#F5DEB3',
                background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                transition: 'all 150ms ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '20px', minWidth: '24px' }}>{item.icon}</span>
              {isExpanded && (
                <span style={{ fontWeight: isActive ? 'bold' : 'normal' }}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

