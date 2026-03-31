import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { UserPlus, Trash2, Mail, Shield, Eye, AlertCircle, Copy, Check, Link2 } from 'lucide-react'

export default function CollaboratorsPanel({ eventId, isOwner }) {
  const [collaborators, setCollaborators] = useState([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('editor')
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [linkCopied, setLinkCopied] = useState(null)

  const fetchCollaborators = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('event_collaborators')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (error) {
      if (error.code === '42P01') {
        setError('⚠️ Execute o SQL de migração no Supabase (supabase/migration_collaborators.sql)')
      } else {
        setError(`Erro ao carregar colaboradores: ${error.message}`)
      }
    } else {
      setCollaborators(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (eventId) fetchCollaborators()
  }, [eventId])

  const addCollaborator = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim()) return

    setAdding(true)
    const { error } = await supabase
      .from('event_collaborators')
      .insert({ event_id: eventId, invited_email: email.trim().toLowerCase(), role })

    if (error) {
      if (error.code === '23505') {
        setError('Este e-mail já é colaborador deste evento.')
      } else if (error.code === '42P01') {
        setError('⚠️ Tabela não encontrada. Execute supabase/migration_collaborators.sql no Supabase.')
      } else {
        setError(`Erro: ${error.message}`)
      }
    } else {
      setSuccess(`✅ ${email.trim()} adicionado como ${role === 'editor' ? 'Editor' : 'Visualizador'}!`)
      setEmail('')
      await fetchCollaborators()
      setTimeout(() => setSuccess(''), 4000)
    }
    setAdding(false)
  }

  const removeCollaborator = async (id) => {
    const { error } = await supabase.from('event_collaborators').delete().eq('id', id)
    if (!error) setCollaborators(prev => prev.filter(c => c.id !== id))
  }

  const copyInviteLink = async (roleParam) => {
    const url = `${window.location.origin}/colaborar/${eventId}?role=${roleParam}`
    await navigator.clipboard.writeText(url)
    setLinkCopied(roleParam)
    setTimeout(() => setLinkCopied(null), 2500)
  }

  if (!isOwner) return null

  return (
    <div
      className="rounded-3xl p-6 shadow-sm"
      style={{
        background: 'rgba(253,252,248,0.92)',
        border: '1px solid rgba(196,168,212,0.25)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <UserPlus size={18} style={{ color: '#c4a8d4' }} />
        <h2 className="font-playfair text-lg font-semibold" style={{ color: '#3d4a3d' }}>
          👥 Colaboradores
        </h2>
      </div>
      <p className="text-xs mb-5" style={{ color: '#9b7ab5' }}>
        Convide por e-mail (conta necessária) ou compartilhe um link de acesso direto.
      </p>

      {/* ===== CONVIDAR POR E-MAIL ===== */}
      <p className="text-xs font-medium mb-2" style={{ color: '#4a5568' }}>Convidar por e-mail</p>
      <form onSubmit={addCollaborator} className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#c4a8d4' }} />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            required
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: 'rgba(196,168,212,0.12)',
              border: '1.5px solid rgba(196,168,212,0.3)',
              color: '#3d4a3d',
            }}
          />
        </div>
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(196,168,212,0.12)',
            border: '1.5px solid rgba(196,168,212,0.3)',
            color: '#3d4a3d',
          }}
        >
          <option value="editor">✏️ Editor</option>
          <option value="viewer">👁️ Visualizador</option>
        </select>
        <motion.button
          type="submit"
          disabled={adding}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #c4a8d4, #7cb98a)', minWidth: '90px' }}
        >
          {adding ? (
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <><UserPlus size={14} /> Convidar</>
          )}
        </motion.button>
      </form>

      {/* ===== CONVIDAR POR LINK ===== */}
      <p className="text-xs font-medium mb-2" style={{ color: '#4a5568' }}>Convidar por link (sem e-mail)</p>
      <div className="flex gap-2 mb-5">
        {[
          { role: 'editor', label: '✏️ Link Editor', color: '#c4a8d4' },
          { role: 'viewer', label: '👁️ Link Visualizador', color: '#7cb98a' },
        ].map(item => (
          <motion.button
            key={item.role}
            onClick={() => copyInviteLink(item.role)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium text-white"
            style={{ background: linkCopied === item.role ? '#4a8a5a' : item.color }}
          >
            {linkCopied === item.role ? <><Check size={12} /> Copiado!</> : <><Link2 size={12} /> {item.label}</>}
          </motion.button>
        ))}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-xs p-2.5 rounded-xl flex items-center gap-1.5 mb-3"
            style={{ background: 'rgba(244,167,185,0.2)', color: '#e88fa5' }}>
            <AlertCircle size={12} /> {error}
          </motion.p>
        )}
        {success && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-xs p-2.5 rounded-xl mb-3"
            style={{ background: 'rgba(124,185,138,0.2)', color: '#4a8a5a' }}>
            {success}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Lista de colaboradores */}
      {loading ? (
        <p className="text-xs text-center py-4" style={{ color: '#c4a8d4' }}>Carregando...</p>
      ) : collaborators.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: '#bbb' }}>
          Nenhum colaborador ainda. Convide alguém acima! 🌸
        </p>
      ) : (
        <motion.div className="space-y-2">
          {collaborators.map(c => (
            <motion.div key={c.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(196,168,212,0.1)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ background: c.role === 'editor' ? 'linear-gradient(135deg,#c4a8d4,#7cb98a)' : '#f4a7b9' }}>
                  {c.role === 'editor' ? <Shield size={13} /> : <Eye size={13} />}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#3d4a3d' }}>{c.invited_email}</p>
                  <p className="text-xs" style={{ color: '#9b7ab5' }}>
                    {c.role === 'editor' ? '✏️ Editor' : '👁️ Visualizador'}
                  </p>
                </div>
              </div>
              <motion.button onClick={() => removeCollaborator(c.id)}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg"
                style={{ color: '#e88fa5', background: 'rgba(244,167,185,0.15)' }}>
                <Trash2 size={13} />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Legenda */}
      <div className="mt-4 pt-4 grid grid-cols-2 gap-2" style={{ borderTop: '1px solid rgba(196,168,212,0.2)' }}>
        {[
          { icon: <Shield size={12} />, label: 'Editor', desc: 'Edita e vê RSVPs', color: '#c4a8d4' },
          { icon: <Eye size={12} />, label: 'Visualizador', desc: 'Apenas vê RSVPs', color: '#f4a7b9' },
        ].map(item => (
          <div key={item.label} className="flex items-start gap-1.5">
            <span style={{ color: item.color }}>{item.icon}</span>
            <div>
              <p className="text-xs font-medium" style={{ color: item.color }}>{item.label}</p>
              <p className="text-xs" style={{ color: '#aaa' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
