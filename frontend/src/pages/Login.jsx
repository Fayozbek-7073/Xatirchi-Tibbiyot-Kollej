import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/auth'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await login(username, password)
      signIn(data.token, data.user)
      navigate(data.user.role === 'director' ? '/director' : '/admin')
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login yoki parol noto\'g\'ri'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-100 opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-200 opacity-30" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#0D2B52] px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Xatirchi-tibbiyot.uz</h1>
            <p className="text-blue-200 text-sm mt-1">Talabalar boshqaruv tizimi</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Tizimga kirish</h2>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Foydalanuvchi nomi
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="username"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Parol
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1A4A8A] hover:bg-[#153D75] disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Kirish...' : 'Kirish'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2026 Xatirchi tibbiyot kolleji
        </p>
      </div>
    </div>
  )
}
