import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LogOut, Flower2, LayoutDashboard, PlusCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 backdrop-blur-md shadow-sm"
      style={{ background: 'rgba(253,252,248,0.92)', borderBottom: '1px solid #c4a8d4aa' }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div whileHover={{ rotate: 20 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Flower2 size={26} style={{ color: '#c4a8d4' }} />
          </motion.div>
          <span className="font-playfair text-xl font-bold" style={{ color: '#3d4a3d' }}>
            Convites Maria Alice
          </span>
        </Link>

        {/* Links */}
        {user && (
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{ color: '#4a5568', hover: { background: '#f4a7b930' } }}
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link
              to="/eventos/novo"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium text-white shadow transition-all hover:scale-105 hover:shadow-md"
              style={{ background: 'linear-gradient(135deg, #c4a8d4, #7cb98a)' }}
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Novo Evento</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{ color: '#9b7ab5' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </motion.nav>
  )
}
