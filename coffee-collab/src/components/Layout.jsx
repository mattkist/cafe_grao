// Layout component with sidebar
import { Sidebar } from './Sidebar'

export function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main
        style={{
          marginLeft: '64px',
          flex: 1,
          padding: '24px',
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 25%, #D2691E 50%, #DEB887 75%, #F5DEB3 100%)',
          minHeight: '100vh'
        }}
      >
        {children}
      </main>
    </div>
  )
}

