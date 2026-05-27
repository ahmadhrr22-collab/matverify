import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { ShieldCheck, Sparkles, AlertOctagon, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Login error:', err)
      const errMsg = err.response?.data?.message || err.message || 'Koneksi ke server gagal'
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100/80 to-indigo-50/30 relative overflow-hidden px-4 sm:px-6 md:px-8">

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      
      {/* Subtle high-tech grid mesh overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000002_1px,transparent_1px),linear-gradient(to_bottom,#00000002_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-md md:max-w-4xl lg:max-w-5xl h-auto md:h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-100/80 flex overflow-hidden">
        
        {/* Left panel (Dark High-Tech contained card side) */}
        <div className="hidden md:flex w-1/2 flex-col justify-center px-10 xl:px-14 bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden h-full">
          
          {/* Subtle grid mesh within dark panel */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]" />

          {/* Glowing Orbs within dark panel */}
          <div className="absolute -top-32 -right-32 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[80px] pointer-events-none" />

          <div className="relative z-10 w-full">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-inner text-white">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white leading-none block">MatVerify</span>
                <span className="text-[8px] text-blue-300 font-bold tracking-widest uppercase mt-0.5 block">QC Intelligence</span>
              </div>
            </div>

            <h1 className="text-2xl xl:text-3xl font-extrabold text-white mb-3 leading-tight tracking-tight">
              AI Material<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Verification</span><br />
              Intelligence
            </h1>
            <p className="text-xs text-slate-300/80 mb-6 leading-relaxed max-w-xs">
              Otomasi verifikasi bahan baku farmasi dengan kecerdasan buatan. Akurat, cepat, dan terdokumentasi secara digital.
            </p>

            {/* Feature list */}
            {[
              { 
                icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400 stroke-[2.2]" />, 
                label: 'AI Document Intelligence',
                desc: 'Ekstraksi dokumen otomatis berbasis AI' 
              },
              { 
                icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[2.2]" />,  
                label: 'Semantic Validation',
                desc: 'Verifikasi kecocokan spesifikasi material' 
              },
              { 
                icon: <AlertOctagon className="w-3.5 h-3.5 text-amber-400 stroke-[2.2]" />, 
                label: 'Auto NC Report',
                desc: 'Pembuatan laporan non-konformansi otomatis' 
              },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-3 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-xl p-3 mb-2.5 w-full max-w-xs xl:max-w-sm shadow-sm hover:bg-white/[0.06] hover:border-white/8 transition-all duration-300 group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                  {f.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-xs xl:text-sm text-slate-100 font-bold block mb-0.5 tracking-tight leading-tight">{f.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium block leading-tight">{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 md:px-14 xl:px-16 py-10 md:py-0 bg-white h-full">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-950 rounded-xl flex items-center justify-center text-white shadow-md shadow-slate-950/15 border border-white/10">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">MatVerify</p>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">QC Intelligence</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-1 tracking-tight">
              Selamat datang
            </h2>
            <p className="text-xs lg:text-sm text-slate-500 font-medium">
              Masuk ke sistem verifikasi material
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="nama@perusahaan.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none hover:border-slate-300 transition-all focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-100/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none hover:border-slate-300 transition-all focus:border-slate-800 focus:bg-white focus:ring-4 focus:ring-slate-100/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-gradient-to-tr from-slate-950 via-blue-950 to-indigo-950 text-white rounded-xl text-sm font-bold shadow-md shadow-slate-950/20 hover:shadow-lg hover:shadow-slate-950/30 hover:opacity-95 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Memverifikasi...
                </>
              ) : 'Masuk'}
            </button>

            {error && (
              <div className="mt-3.5 p-3.5 bg-rose-50/50 border border-rose-100/60 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-bold text-rose-600 animate-[pulse_2s_infinite]">
                <AlertOctagon className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          <p className="text-center text-[10px] text-slate-400/80 font-medium tracking-wide mt-10 leading-relaxed">
            Microsoft Elevate Training Center · Hackathon 2026
          </p>
        </div>
      </div>
    </div>
  )
}