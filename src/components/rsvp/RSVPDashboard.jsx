import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Navbar from '../shared/Navbar'
import LoadingSpinner from '../shared/LoadingSpinner'
import Papa from 'papaparse'
import {
  ArrowLeft, Users, Baby, Heart, Download, AlertTriangle,
  Trash2, CheckCircle, XCircle
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
}

export default function RSVPDashboard() {
  const { id } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [rsvps, setRsvps] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    const [{ data: eventData }, { data: rsvpData }] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).eq('user_id', user.id).single(),
      supabase.from('rsvps').select('*').eq('event_id', id).order('created_at', { ascending: false }),
    ])
    setEvent(eventData)
    setRsvps(rsvpData || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id, user])

  const handleDelete = async (rsvpId) => {
    setDeletingId(rsvpId)
    await supabase.from('rsvps').delete().eq('id', rsvpId)
    setRsvps(prev => prev.filter(r => r.id !== rsvpId))
    setDeletingId(null)
  }

  const exportCSV = () => {
    const data = rsvps.map(r => ({
      Nome: r.nome_convidado,
      Adultos: r.qtd_adultos,
      Crianças: r.qtd_criancas,
      'Idades das Crianças': Array.isArray(r.idades_criancas) ? r.idades_criancas.join(', ') : '',
      'Bebê de Colo': r.bebe_colo ? 'Sim' : 'Não',
      Restrições: r.restricoes || '',
      Alergias: r.alergias || '',
      'Data de Confirmação': new Date(r.created_at).toLocaleDateString('pt-BR'),
    }))
    const csv = Papa.unparse(data)
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rsvp-${event?.slug || 'evento'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <LoadingSpinner text="Carregando RSVPs..." />

  // Totais
  const totalAdultos = rsvps.reduce((sum, r) => sum + (r.qtd_adultos || 0), 0)
  const totalCriancas = rsvps.reduce((sum, r) => sum + (r.qtd_criancas || 0), 0)
  const totalBebes = rsvps.filter(r => r.bebe_colo).length
  const totalPessoas = totalAdultos + totalCriancas
  const comAlergias = rsvps.filter(r => r.alergias && r.alergias.trim())

  const stats = [
    { label: 'Total de Pessoas', value: totalPessoas, icon: '👥', color: '#c4a8d4' },
    { label: 'Adultos', value: totalAdultos, icon: '🧑', color: '#7cb98a' },
    { label: 'Crianças', value: totalCriancas, icon: '👧', color: '#f4a7b9' },
    { label: 'Bebês de Colo', value: totalBebes, icon: '👶', color: '#d4af37' },
    { label: 'Confirmações', value: rsvps.length, icon: '✅', color: '#7cb98a' },
    { label: 'Alertas Alergias', value: comAlergias.length, icon: '⚠️', color: '#e88fa5' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fce4ec 0%, #faf6ef 40%, #e8f5e9 100%)' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/" className="flex items-center gap-2 text-sm mb-4 hover:opacity-70" style={{ color: '#9b7ab5' }}>
            <ArrowLeft size={16} /> Voltar ao dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-playfair text-3xl font-bold" style={{ color: '#3d4a3d' }}>
                📊 RSVPs
              </h1>
              <p className="text-sm mt-1" style={{ color: '#9b7ab5' }}>
                {event?.nome_evento} — {event?.nome_aniversariante}
              </p>
            </div>
            {rsvps.length > 0 && (
              <motion.button
                onClick={exportCSV}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm font-semibold shadow-md"
                style={{ background: 'linear-gradient(135deg, #7cb98a, #4a8a5a)' }}
              >
                <Download size={16} /> Exportar CSV
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
        >
          {stats.map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 text-center shadow-sm"
              style={{
                background: 'rgba(253,252,248,0.9)',
                border: `1px solid ${stat.color}44`,
              }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="font-playfair text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs leading-tight mt-0.5" style={{ color: '#7c8c7c' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Alertas de alergias */}
        {comAlergias.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl p-4 mb-6 shadow-sm"
            style={{
              background: 'rgba(244,167,185,0.15)',
              border: '1.5px solid rgba(244,167,185,0.5)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} style={{ color: '#e88fa5' }} />
              <h2 className="font-semibold text-sm" style={{ color: '#e88fa5' }}>
                ⚠️ Atenção: {comAlergias.length} convidado{comAlergias.length > 1 ? 's' : ''} com alergias
              </h2>
            </div>
            <div className="space-y-1.5">
              {comAlergias.map(r => (
                <div key={r.id} className="flex items-start gap-2 text-sm" style={{ color: '#4a5568' }}>
                  <span className="font-medium" style={{ color: '#e88fa5' }}>{r.nome_convidado}:</span>
                  <span>{r.alergias}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Lista de convidados */}
        {rsvps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">📭</div>
            <h2 className="font-playfair text-xl font-bold mb-2" style={{ color: '#3d4a3d' }}>
              Nenhuma confirmação ainda
            </h2>
            <p className="text-sm" style={{ color: '#9b7ab5' }}>
              Compartilhe o link do convite para receber RSVPs ✨
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <h2 className="font-playfair text-xl font-bold mb-4" style={{ color: '#3d4a3d' }}>
              Lista de Convidados 🌸
            </h2>
            {rsvps.map(rsvp => (
              <motion.div
                key={rsvp.id}
                variants={itemVariants}
                layout
                className="rounded-2xl p-4 shadow-sm"
                style={{
                  background: 'rgba(253,252,248,0.92)',
                  border: rsvp.alergias ? '1px solid rgba(244,167,185,0.5)' : '1px solid rgba(196,168,212,0.25)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Nome e badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm" style={{ color: '#3d4a3d' }}>
                        {rsvp.nome_convidado}
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {rsvp.qtd_adultos > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(196,168,212,0.2)', color: '#9b7ab5' }}>
                            👥 {rsvp.qtd_adultos} adulto{rsvp.qtd_adultos > 1 ? 's' : ''}
                          </span>
                        )}
                        {rsvp.qtd_criancas > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,185,138,0.2)', color: '#4a8a5a' }}>
                            👧 {rsvp.qtd_criancas} criança{rsvp.qtd_criancas > 1 ? 's' : ''}
                          </span>
                        )}
                        {rsvp.bebe_colo && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.2)', color: '#a07820' }}>
                            👶 bebê de colo
                          </span>
                        )}
                        {rsvp.alergias && (
                          <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(244,167,185,0.25)', color: '#e88fa5' }}>
                            <AlertTriangle size={10} /> alergia
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detalhes extras */}
                    <div className="space-y-0.5">
                      {Array.isArray(rsvp.idades_criancas) && rsvp.idades_criancas.length > 0 && (
                        <p className="text-xs" style={{ color: '#7c8c7c' }}>
                          <span className="font-medium">Idades:</span> {rsvp.idades_criancas.join(', ')}
                        </p>
                      )}
                      {rsvp.restricoes && (
                        <p className="text-xs" style={{ color: '#7c8c7c' }}>
                          <span className="font-medium">Restrições:</span> {rsvp.restricoes}
                        </p>
                      )}
                      {rsvp.alergias && (
                        <p className="text-xs flex items-center gap-1" style={{ color: '#e88fa5' }}>
                          <AlertTriangle size={10} />
                          <span className="font-medium">Alergias:</span> {rsvp.alergias}
                        </p>
                      )}
                    </div>

                    <p className="text-xs mt-1.5" style={{ color: '#bbb' }}>
                      Confirmado em {new Date(rsvp.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Deletar */}
                  <motion.button
                    onClick={() => handleDelete(rsvp.id)}
                    disabled={deletingId === rsvp.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-xl flex-shrink-0 transition-all"
                    style={{ background: 'rgba(244,167,185,0.15)', color: '#e88fa5' }}
                  >
                    {deletingId === rsvp.id ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="w-4 h-4 border-2 border-pink-300 border-t-transparent rounded-full"
                      />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
