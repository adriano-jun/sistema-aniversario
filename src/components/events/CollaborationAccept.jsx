import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner from '../shared/LoadingSpinner'
import { UserPlus, Check, LogIn } from 'lucide-react'

export default function CollaborationAccept() {
  const { eventId } = useParams()
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || 'viewer'
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('events')
      .select('nome_evento, nome_aniversariante, data, local_nome')
      .eq('id', eventId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError('Evento não encontrado.')
        else setEvent(data)
        setLoading(false)
      })
  }, [eventId])

  const handleAccept = async () => {
    if (!user) return
    setJoining(true)
    setError('')

    const { error } = await supabase
      .from('event_collaborators')
      .insert({
        event_id: eventId,
        invited_email: user.email,
        role,
      })

    if (error) {
      if (error.code === '23505') {
        setError('Você já é colaborador deste evento!')
        setJoined(true)
      } else {
        setError(`Erro: ${error.message}`)
      }
    } else {
      setJoined(true)
    }
    setJoining(false)
  }

  if (authLoading || loading) return <LoadingSpinner text="Carregando..." />

  const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : ''

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8f5e9 100%)' }}>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        className="w-full max-w-md rounded-3xl p-8 shadow-2xl text-center"
        style={{
          background: 'rgba(253,252,248,0.95)',
          border: '2px solid rgba(196,168,212,0.4)',
        }}
      >
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-5xl mb-4"
        >
          🦋
        </motion.div>

        <h1 className="font-playfair text-2xl font-bold mb-2" style={{ color: '#3d4a3d' }}>
          Convite de Colaboração
        </h1>

        {event && (
          <div className="rounded-2xl p-4 mb-6"
            style={{ background: 'rgba(196,168,212,0.12)', border: '1px solid rgba(196,168,212,0.3)' }}>
            <p className="font-playfair text-lg font-semibold" style={{ color: '#3d4a3d' }}>
              {event.nome_evento}
            </p>
            {event.nome_aniversariante && (
              <p className="text-sm" style={{ color: '#9b7ab5' }}>🎂 {event.nome_aniversariante}</p>
            )}
            {event.data && (
              <p className="text-xs mt-1" style={{ color: '#7c8c7c' }}>{formatDate(event.data)}</p>
            )}
            {event.local_nome && (
              <p className="text-xs" style={{ color: '#7c8c7c' }}>📍 {event.local_nome}</p>
            )}
          </div>
        )}

        <p className="text-sm mb-6" style={{ color: '#4a5568' }}>
          Você foi convidado como{' '}
          <strong style={{ color: role === 'editor' ? '#c4a8d4' : '#7cb98a' }}>
            {role === 'editor' ? '✏️ Editor' : '👁️ Visualizador'}
          </strong>{' '}
          neste evento.
        </p>

        {error && (
          <p className="text-sm p-3 rounded-xl mb-4"
            style={{ background: joined ? 'rgba(124,185,138,0.15)' : 'rgba(244,167,185,0.2)', color: joined ? '#4a8a5a' : '#e88fa5' }}>
            {error}
          </p>
        )}

        {!user ? (
          <div>
            <p className="text-sm mb-4" style={{ color: '#9b7ab5' }}>
              Faça login para aceitar o convite.
            </p>
            <Link to={`/login?redirect=/colaborar/${eventId}?role=${role}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold shadow-lg"
                style={{ background: 'linear-gradient(135deg, #c4a8d4, #7cb98a)' }}
              >
                <LogIn size={18} /> Fazer login para aceitar
              </motion.button>
            </Link>
          </div>
        ) : joined ? (
          <div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              className="text-4xl mb-3">✅</motion.div>
            <p className="font-semibold mb-4" style={{ color: '#4a8a5a' }}>
              Você agora é colaborador deste evento!
            </p>
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-2xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #c4a8d4, #7cb98a)' }}
              >
                Ir para o Dashboard
              </motion.button>
            </Link>
          </div>
        ) : (
          <motion.button
            onClick={handleAccept}
            disabled={joining}
            whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(196,168,212,0.4)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold shadow-lg"
            style={{ background: joining ? '#c4a8d4' : 'linear-gradient(135deg, #c4a8d4, #7cb98a)' }}
          >
            {joining ? (
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <><UserPlus size={18} /> Aceitar e colaborar</>
            )}
          </motion.button>
        )}

        <p className="text-xs mt-4" style={{ color: '#c4a8d4' }}>🌸 Convites Maria Alice</p>
      </motion.div>
    </div>
  )
}
