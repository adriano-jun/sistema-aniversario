import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Edit2, Users, Copy, Trash2, Calendar, MapPin, Check } from 'lucide-react'
import { useState } from 'react'

export default function EventCard({ event, onDelete, isOwner = true }) {
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const inviteUrl = `${window.location.origin}/convite/${event.slug}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Data não definida'
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(196,168,212,0.25)' }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl overflow-hidden shadow-md"
      style={{
        background: 'rgba(253,252,248,0.95)',
        border: '1px solid rgba(196,168,212,0.3)',
      }}
    >
      {/* Header colorido */}
      <div
        className="relative h-20 flex items-center px-5 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #f4a7b9 0%, #c4a8d4 50%, #7cb98a 100%)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-end px-4 opacity-20 text-4xl select-none">
          🦋🌸🦋
        </div>
        <div className="relative z-10">
          <h3 className="font-playfair text-white text-lg font-bold leading-tight">
            {event.nome_evento || 'Evento sem nome'}
          </h3>
          <p className="text-white text-xs opacity-80">
            🎂 {event.nome_aniversariante || '—'}
            {event.idade ? ` · ${event.idade} aninho${event.idade > 1 ? 's' : ''}` : ''}
          </p>
        </div>
      </div>

      {/* Corpo */}
      <div className="p-5">
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#4a5568' }}>
            <Calendar size={14} style={{ color: '#c4a8d4' }} />
            <span>{formatDate(event.data)}</span>
          </div>
          {event.horario_inicio && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#4a5568' }}>
              <span style={{ color: '#c4a8d4' }}>⏰</span>
              <span>{event.horario_inicio}{event.horario_fim ? ` – ${event.horario_fim}` : ''}</span>
            </div>
          )}
          {event.local_nome && (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#4a5568' }}>
              <MapPin size={14} style={{ color: '#7cb98a' }} />
              <span className="truncate">{event.local_nome}</span>
            </div>
          )}
        </div>

        {/* Slug badge + badge de colaborador */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex-1 text-xs rounded-xl px-3 py-1.5 font-mono truncate"
            style={{ background: 'rgba(196,168,212,0.15)', color: '#9b7ab5' }}
          >
            /convite/{event.slug}
          </div>
          {!isOwner && (
            <span className="text-xs px-2 py-1 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(124,185,138,0.2)', color: '#4a8a5a' }}>
              👥 Colaborador
            </span>
          )}
        </div>

        {/* Botões de ação */}
        <div className="grid grid-cols-2 gap-2">
          {isOwner && (
            <Link to={`/eventos/${event.id}/editar`}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'rgba(196,168,212,0.2)', color: '#9b7ab5' }}
              >
                <Edit2 size={13} /> Editar
              </motion.button>
            </Link>
          )}

          <Link to={`/eventos/${event.id}/rsvp`} className={isOwner ? '' : 'col-span-2'}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(124,185,138,0.2)', color: '#4a8a5a' }}
            >
              <Users size={13} /> Ver RSVP
            </motion.button>
          </Link>

          <motion.button
            onClick={copyLink}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="col-span-2 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all text-white"
            style={{
              background: copied
                ? 'linear-gradient(135deg, #7cb98a, #4a8a5a)'
                : 'linear-gradient(135deg, #c4a8d4, #7cb98a)',
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Link copiado!' : 'Copiar link do convite'}
          </motion.button>

          {/* Deletar — só para o dono */}
          {isOwner && (!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="col-span-2 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ color: '#e88fa5' }}
            >
              <Trash2 size={12} /> Excluir evento
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="col-span-2 flex gap-2"
            >
              <button
                onClick={() => onDelete(event.id)}
                className="flex-1 py-1.5 rounded-xl text-xs font-medium text-white"
                style={{ background: '#e88fa5' }}
              >
                Confirmar exclusão
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(196,168,212,0.2)', color: '#9b7ab5' }}
              >
                Cancelar
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

