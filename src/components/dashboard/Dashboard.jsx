import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Navbar from '../shared/Navbar'
import EventCard from './EventCard'
import { PlusCircle, Flower2, Sparkles, Users } from 'lucide-react'
import LoadingSpinner from '../shared/LoadingSpinner'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
}

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [collabEvents, setCollabEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    setLoading(true)

    // Eventos que o usuário É DONO
    const { data: ownedData } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Eventos em que o usuário É COLABORADOR
    const { data: collabData } = await supabase
      .from('event_collaborators')
      .select('events(*)')
      .eq('invited_email', user.email)

    setEvents(ownedData || [])
    // Extrair os eventos da resposta aninhada e excluir os que ele já é dono
    const collaborated = (collabData || [])
      .map(c => c.events)
      .filter(Boolean)
      .filter(e => e.user_id !== user.id)
    setCollabEvents(collaborated)
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

  const totalEvents = events.length + collabEvents.length

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
              <span className="text-sm font-medium" style={{ color: '#9b7ab5' }}>Seus Eventos</span>
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
        {totalEvents > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Meus Eventos', value: events.length, icon: '🎉', color: '#c4a8d4' },
              { label: 'Colaborando', value: collabEvents.length, icon: '👥', color: '#7cb98a' },
              { label: 'Este Mês', value: events.filter(e => new Date(e.created_at).getMonth() === new Date().getMonth()).length, icon: '📅', color: '#f4a7b9' },
              { label: 'Próximos', value: [...events, ...collabEvents].filter(e => e.data && new Date(e.data + 'T00:00:00') >= new Date()).length, icon: '✨', color: '#d4af37' },
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

        {/* ===== MEUS EVENTOS ===== */}
        {events.length === 0 && collabEvents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
          <>
            {/* Meus eventos */}
            {events.length > 0 && (
              <div className="mb-10">
                <h2 className="font-playfair text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#3d4a3d' }}>
                  <Flower2 size={18} style={{ color: '#c4a8d4' }} /> Meus Eventos
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {events.map(event => (
                    <motion.div key={event.id} variants={itemVariants}>
                      <EventCard event={event} onDelete={handleDelete} isOwner />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* Eventos colaborados */}
            {collabEvents.length > 0 && (
              <div>
                <h2 className="font-playfair text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#3d4a3d' }}>
                  <Users size={18} style={{ color: '#7cb98a' }} /> Eventos que Colaboro
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,185,138,0.2)', color: '#4a8a5a' }}>
                    Colaborador
                  </span>
                </h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {collabEvents.map(event => (
                    <motion.div key={event.id} variants={itemVariants}>
                      <EventCard event={event} onDelete={null} isOwner={false} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
