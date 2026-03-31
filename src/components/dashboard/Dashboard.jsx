import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Navbar from '../shared/Navbar'
import EventCard from './EventCard'
import { PlusCircle, Flower2, Sparkles, Calendar } from 'lucide-react'
import LoadingSpinner from '../shared/LoadingSpinner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setEvents(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [user])

  const handleDelete = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (!error) fetchEvents()
  }

  if (loading) return <LoadingSpinner text="Carregando seus eventos..." />

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fce4ec 0%, #faf6ef 40%, #e8f5e9 100%)' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flower2 size={20} style={{ color: '#c4a8d4' }} />
              <span className="text-sm font-medium" style={{ color: '#9b7ab5' }}>
                Seus Eventos
              </span>
            </div>
            <h1 className="font-playfair text-4xl font-bold" style={{ color: '#3d4a3d' }}>
              Dashboard 🌸
            </h1>
            <p className="text-sm mt-1" style={{ color: '#7cb98a' }}>
              Gerencie seus convites digitais
            </p>
          </div>

          <Link to="/eventos/novo">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(196,168,212,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-semibold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #c4a8d4, #7cb98a)' }}
            >
              <PlusCircle size={20} />
              Criar novo evento
            </motion.button>
          </Link>
        </motion.div>

        {/* Estatísticas rápidas */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: 'Total de Eventos', value: events.length, icon: '🎉', color: '#c4a8d4' },
              { label: 'Este Mês', value: events.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).length, icon: '📅', color: '#7cb98a' },
              { label: 'Próximos', value: events.filter(e => e.data && new Date(e.data) >= new Date()).length, icon: '✨', color: '#f4a7b9' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 shadow-sm"
                style={{ background: 'rgba(253,252,248,0.8)', border: `1px solid ${stat.color}44` }}
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="font-playfair text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs" style={{ color: '#7c8c7c' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Lista de eventos */}
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl mb-4"
            >
              🦋
            </motion.div>
            <h2 className="font-playfair text-2xl font-bold mb-2" style={{ color: '#3d4a3d' }}>
              Nenhum evento ainda
            </h2>
            <p className="mb-6 text-sm" style={{ color: '#9b7ab5' }}>
              Crie seu primeiro convite digital encantado! ✨
            </p>
            <Link to="/eventos/novo">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl text-white font-semibold shadow-lg"
                style={{ background: 'linear-gradient(135deg, #c4a8d4, #7cb98a)' }}
              >
                <Sparkles size={18} />
                Criar primeiro evento
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map(event => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard event={event} onDelete={handleDelete} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
