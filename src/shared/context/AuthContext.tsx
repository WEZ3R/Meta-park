import { createContext, useContext, useState, ReactNode } from 'react'
import { api } from '../api/client'

interface AuthContextValue {
  isAuthenticated: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('authenticated') === 'true'
  })

  const login = async (password: string): Promise<boolean> => {
    try {
      const result = await api.login(password)
      if (result.success) {
        sessionStorage.setItem('authenticated', 'true')
        setIsAuthenticated(true)
        return true
      }
    } catch {
      // Login failed
    }
    return false
  }

  const logout = () => {
    sessionStorage.removeItem('authenticated')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
