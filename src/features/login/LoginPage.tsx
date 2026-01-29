import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import './LoginPage.css'

export function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const success = await login(password)
    if (success) {
      navigate('/viewer')
    } else {
      setError('Mot de passe incorrect')
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">ServerMetaPark</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="login-input"
          autoFocus
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" className="login-button">Entrer</button>
      </form>
    </div>
  )
}
