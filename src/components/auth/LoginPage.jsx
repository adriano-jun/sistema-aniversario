import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Flower2, Mail, Lock, Eye, EyeOff, Sparkles } from 'lucide-react'

// Mini borboleta decorativa para o login
function MiniButterfly({ x, y, delay, size = 24 }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${x}%`, top: `${y}%`, fontSize: size }}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.7, 0],
        y: [0, -30, -60],
        x: [0, 10, -5],
        rotate: [0, 15, -10],
      }}
      transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      🦋
    </motion.div>
  )
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) {
        setError('E-mail ou senha incorretos. Tente novamente.')
      } else {
        navigate('/')
      }
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
      }
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 40%, #e8f5e9 100%)',
      }}
    >
      {/* Borboletas decorativas */}
      <MiniButterfly x={10} y={20} delay={0} size={28} />
      <MiniButterfly x={85} y={15} delay={1.5} size={20} />
      <MiniButterfly x={20} y={70} delay={0.8} size={22} />
      <MiniButterfly x={75} y={65} delay={2} size={26} />
      <MiniButterfly x={50} y={10} delay={0.4} size={18} />
      <MiniButterfly x={5} y={50} delay={1.2} size={24} />
      <MiniButterfly x={90} y={45} delay={0.6} size={22} />

      {/* Flores decorativas de fundo */}
      {['🌸','🌺','🌼','🌿','🍃'].map((f, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl pointer-events-none select-none opacity-20"
          style={{
            left: `${[5,80,15,70,45][i]}%`,
            top: `${[80,75,10,20,90][i]}%`,
          }}
          animate={{ rotate: [0, 10, -5, 0], scale: [1, 1.05, 0.98, 1] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: 'easeInOut' }}
        >
          {f}
        </motion.div>
      ))}

      {/* Card de login */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'backOut' }}
        className="relative z-10 w-full max-w-md rounded-3xl p-8 shadow-2xl"
        style={{
          background: 'rgba(253,252,248,0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(196,168,212,0.4)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block text-5xl mb-3"
          >
            🦋
          </motion.div>
          <h1 className="font-playfair text-3xl font-bold mb-1" style={{ color: '#3d4a3d' }}>
            {isLogin ? 'Bem-vinda!' : 'Criar Conta'}
          </h1>
          <p className="text-sm" style={{ color: '#7cb98a' }}>
            Sistema de Convites Digitais ✨
          </p>
        </div>

        {/* Toggle Login / Cadastro */}
        <div
          className="flex rounded-2xl p-1 mb-6"
          style={{ background: 'rgba(196,168,212,0.2)' }}
        >
          {['Entrar', 'Cadastrar'].map((label, i) => (
            <button
              key={label}
              onClick={() => { setIsLogin(i === 0); setError(''); setSuccess('') }}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300"
              style={{
                background: (isLogin && i === 0) || (!isLogin && i === 1)
                  ? 'linear-gradient(135deg, #c4a8d4, #7cb98a)'
                  : 'transparent',
                color: (isLogin && i === 0) || (!isLogin && i === 1) ? 'white' : '#4a5568',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#c4a8d4' }} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(196,168,212,0.12)',
                border: '1.5px solid rgba(196,168,212,0.3)',
                color: '#3d4a3d',
              }}
              onFocus={e => e.target.style.borderColor = '#c4a8d4'}
              onBlur={e => e.target.style.borderColor = 'rgba(196,168,212,0.3)'}
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#c4a8d4' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              className="w-full pl-10 pr-10 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(196,168,212,0.12)',
                border: '1.5px solid rgba(196,168,212,0.3)',
                color: '#3d4a3d',
              }}
              onFocus={e => e.target.style.borderColor = '#c4a8d4'}
              onBlur={e => e.target.style.borderColor = 'rgba(196,168,212,0.3)'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: '#c4a8d4' }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Erros e Sucesso */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-center p-2 rounded-xl"
                style={{ background: '#fce4ec', color: '#e88fa5' }}
              >
                {error}
              </motion.p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-center p-2 rounded-xl"
                style={{ background: '#e8f5e9', color: '#7cb98a' }}
              >
                {success}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Botão */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all"
            style={{
              background: loading
                ? '#c4a8d4'
                : 'linear-gradient(135deg, #c4a8d4 0%, #7cb98a 100%)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                Aguarde...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles size={16} />
                {isLogin ? 'Entrar' : 'Criar conta'}
              </span>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center gap-2 justify-center">
            <Flower2 size={14} style={{ color: '#c4a8d4' }} />
            <span className="text-xs" style={{ color: '#9b7ab5' }}>
              Jardim Encantado — Maria Alice 🌸
            </span>
            <Flower2 size={14} style={{ color: '#c4a8d4' }} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
