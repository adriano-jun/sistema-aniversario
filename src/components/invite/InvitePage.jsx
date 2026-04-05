import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import Butterfly from './Butterfly'
import RSVPForm from './RSVPForm'
import LoadingSpinner from '../shared/LoadingSpinner'
import { MapPin, Clock, Calendar, CreditCard, Gift, Copy, Check, ExternalLink } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

function InfoCard({ icon: Icon, label, value, action, actionIcon: ActionIcon, actionLabel, color = '#c4a8d4' }) {
  if (!value) return null
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl p-4 shadow-sm flex items-start gap-3"
      style={{ background: 'rgba(253,252,248,0.85)', border: `1px solid ${color}44` }}
    >
      <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${color}22` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium mb-0.5" style={{ color: '#9b7ab5' }}>{label}</p>
        <p className="text-sm font-semibold break-words" style={{ color: '#3d4a3d' }}>{value}</p>
      </div>
      {action && (
        <button
          onClick={action}
          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl flex-shrink-0 transition-all hover:scale-105"
          style={{ background: `${color}22`, color }}
        >
          {ActionIcon && <ActionIcon size={12} />}
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}

export default function InvitePage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showRSVP, setShowRSVP] = useState(false)
  const [pixCopied, setPixCopied] = useState(false)
  const [rsvpDone, setRsvpDone] = useState(false)

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true)
        } else {
          setEvent(data)
        }
        setLoading(false)
      })
  }, [slug])

  const copyPix = async () => {
    if (event?.chave_pix) {
      await navigator.clipboard.writeText(event.chave_pix)
      setPixCopied(true)
      setTimeout(() => setPixCopied(false), 3000)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    })
  }

  if (loading) return <LoadingSpinner text="Carregando convite..." />

  if (notFound) {
    return (
      <div
        className="min-h-screen flex items-center justify-center text-center px-4"
        style={{ background: 'linear-gradient(135deg, #fce4ec, #f3e5f5, #e8f5e9)' }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-playfair text-2xl font-bold mb-2" style={{ color: '#3d4a3d' }}>
            Convite não encontrado
          </h1>
          <p className="text-sm" style={{ color: '#9b7ab5' }}>
            Este link pode ter expirado ou estar incorreto.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #fce4ec 0%, #f9f3ff 35%, #e8f5e9 70%, #fdfcf8 100%)' }}
    >
      {/* BORBOLETAS — destaque visual */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        {Array.from({ length: 12 }).map((_, i) => (
          <Butterfly key={i} index={i} />
        ))}
      </div>

      {/* Flores decorativas de fundo */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0 overflow-hidden">
        {['🌸', '🌺', '🌼', '🌿', '🍃', '🌷', '💐', '🌻'].map((f, i) => (
          <motion.div
            key={i}
            className="absolute text-5xl select-none"
            style={{
              left: `${[3, 88, 5, 82, 15, 70, 45, 60][i]}%`,
              top: `${[85, 80, 10, 15, 50, 55, 92, 5][i]}%`,
            }}
            animate={{ rotate: [0, 8, -5, 0], scale: [1, 1.05, 0.98, 1] }}
            transition={{ duration: 7 + i, repeat: Infinity, ease: 'easeInOut' }}
          >
            {f}
          </motion.div>
        ))}
      </div>

      <div className="relative z-20 max-w-lg mx-auto px-4 py-10">

        {/* ===== HERO ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'backOut' }}
          className="text-center mb-10 relative"
        >
          {/* Moldura/card hero */}
          <div
            className="rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
            style={{
              background: 'rgba(253,252,248,0.88)',
              backdropFilter: 'blur(16px)',
              border: '2px solid rgba(196,168,212,0.4)',
            }}
          >
            {/* Gradiente decorativo topo */}
            <div
              className="absolute top-0 left-0 right-0 h-2"
              style={{ background: 'linear-gradient(90deg, #f4a7b9, #c4a8d4, #7cb98a, #d4af37, #f4a7b9)' }}
            />

            {/* Emoji de borboleta animado */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl mb-4"
            >
              🦋
            </motion.div>

            {/* Você está convidado */}
            <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: '#c4a8d4' }}>
              ✨ Você está convidado ✨
            </p>

            {/* Idade */}
            {event.idade && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #f4a7b9, #c4a8d4)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(196,168,212,0.4)',
                }}
              >
                🎂 {event.idade} aninho{event.idade > 1 ? 's' : ''}!
              </motion.div>
            )}

            {/* Nome do evento */}
            <h2 className="font-playfair text-xl font-semibold mb-2" style={{ color: '#7cb98a' }}>
              {event.nome_evento}
            </h2>

            {/* Tema */}
            {event.tema && (
              <p className="text-sm italic mb-4" style={{ color: '#9b7ab5' }}>
                🌿 {event.tema}
              </p>
            )}

            {/* Decoração de fundo no card */}
            <div className="absolute bottom-2 right-4 text-4xl opacity-15 select-none">🌸🦋🌺</div>
          </div>
        </motion.div>

        {/* ===== INFORMAÇÕES ===== */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-3 mb-8"
        >
          {/* Data */}
          <InfoCard
            icon={Calendar}
            label="Data"
            value={formatDate(event.data)}
            color="#c4a8d4"
          />

          {/* Horário */}
          {event.horario_inicio && (
            <InfoCard
              icon={Clock}
              label="Horário"
              value={`${event.horario_inicio}${event.horario_fim ? ` às ${event.horario_fim}` : ''}`}
              color="#7cb98a"
            />
          )}

          {/* Local */}
          {event.local_nome && (
            <InfoCard
              icon={MapPin}
              label="Local"
              value={`${event.local_nome}${event.endereco_completo ? ` — ${event.endereco_completo}` : ''}`}
              action={event.link_maps ? () => window.open(event.link_maps, '_blank') : null}
              actionIcon={ExternalLink}
              actionLabel="Ver mapa"
              color="#f4a7b9"
            />
          )}

          {/* PIX */}
          {event.chave_pix && (
            <InfoCard
              icon={CreditCard}
              label="Chave PIX (presente)"
              value={event.chave_pix}
              action={copyPix}
              actionIcon={pixCopied ? Check : Copy}
              actionLabel={pixCopied ? 'Copiado!' : 'Copiar'}
              color="#d4af37"
            />
          )}

          {/* Lista de presentes */}
          {event.link_presente && (
            <InfoCard
              icon={Gift}
              label="Lista de Presentes"
              value="Clique para ver a lista"
              action={() => window.open(event.link_presente, '_blank')}
              actionIcon={ExternalLink}
              actionLabel="Abrir lista"
              color="#7cb98a"
            />
          )}
        </motion.div>

        {/* ===== PRAZO ===== */}
        {event.data_limite_confirmacao && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl p-4 mb-8 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(244,167,185,0.2), rgba(196,168,212,0.2))',
              border: '1px solid rgba(196,168,212,0.4)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: '#9b7ab5' }}>
              ⏰ Confirme sua presença até:
            </p>
            <p className="font-playfair font-bold text-lg" style={{ color: '#3d4a3d' }}>
              {formatDate(event.data_limite_confirmacao)}
            </p>
          </motion.div>
        )}

        {/* ===== RSVP ===== */}
        <AnimatePresence mode="wait">
          {!rsvpDone ? (
            !showRSVP ? (
              <motion.div
                key="rsvp-btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <motion.button
                  onClick={() => setShowRSVP(true)}
                  whileHover={{ scale: 1.05, boxShadow: '0 12px 30px rgba(196,168,212,0.5)' }}
                  whileTap={{ scale: 0.97 }}
                  className="px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #c4a8d4 0%, #f4a7b9 50%, #7cb98a 100%)' }}
                >
                  🎉 Confirmar Presença
                </motion.button>
                <p className="text-xs mt-3" style={{ color: '#9b7ab5' }}>
                  Leva menos de 1 minuto ✨
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="rsvp-form"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <RSVPForm
                  eventId={event.id}
                  onSuccess={() => setRsvpDone(true)}
                  onCancel={() => setShowRSVP(false)}
                />
              </motion.div>
            )
          ) : (
            <motion.div
              key="rsvp-success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-center rounded-3xl p-8 shadow-xl"
              style={{
                background: 'rgba(253,252,248,0.92)',
                border: '2px solid rgba(124,185,138,0.5)',
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="font-playfair text-2xl font-bold mb-2" style={{ color: '#3d4a3d' }}>
                Presença confirmada!
              </h2>
              <p className="text-sm" style={{ color: '#7cb98a' }}>
                Mal podemos esperar para celebrar com você! 🌸
              </p>
              <div className="mt-4 text-2xl">🦋🌺🦋</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer do convite */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs mt-10 pb-6"
          style={{ color: '#c4a8d4' }}
        >
          🌸 Convite digital feito com amor 🌸
        </motion.p>
      </div>
    </div>
  )
}
