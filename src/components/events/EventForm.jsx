import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { generateUniqueSlug } from '../../lib/slugify'
import Navbar from '../shared/Navbar'
import LoadingSpinner from '../shared/LoadingSpinner'
import {
  Save, ArrowLeft, Trash2, MapPin, Clock, Calendar,
  CreditCard, Gift, Hash, User, Flower2, AlertCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'
import CollaboratorsPanel from './CollaboratorsPanel'

const fields = [
  {
    section: '🎉 Sobre o Evento',
    fields: [
      { name: 'nome_evento', label: 'Nome do Evento', type: 'text', placeholder: 'Aniversário da Maria Alice', required: true, icon: Flower2 },
      { name: 'tema', label: 'Tema', type: 'text', placeholder: 'Jardim Encantado com Borboletas', icon: Hash },
      { name: 'nome_aniversariante', label: 'Nome do Aniversariante', type: 'text', placeholder: 'Maria Alice', required: true, icon: User },
      { name: 'idade', label: 'Idade (anos)', type: 'number', placeholder: '1', icon: Hash },
    ]
  },
  {
    section: '📅 Data e Horário',
    fields: [
      { name: 'data', label: 'Data do Evento', type: 'date', required: true, icon: Calendar },
      { name: 'horario_inicio', label: 'Horário de Início', type: 'time', icon: Clock },
      { name: 'horario_fim', label: 'Horário de Término', type: 'time', icon: Clock },
      { name: 'data_limite_confirmacao', label: 'Prazo para Confirmação', type: 'date', icon: Calendar },
    ]
  },
  {
    section: '📍 Local',
    fields: [
      { name: 'local_nome', label: 'Nome do Local', type: 'text', placeholder: 'Salão de Festas Paradise', icon: MapPin },
      { name: 'endereco_completo', label: 'Endereço Completo', type: 'text', placeholder: 'Rua das Flores, 123 — Jardim Primavera, SP', icon: MapPin },
      { name: 'link_maps', label: 'Link do Google Maps', type: 'url', placeholder: 'https://maps.google.com/...', icon: MapPin },
    ]
  },
  {
    section: '💝 Extras',
    fields: [
      { name: 'chave_pix', label: 'Chave PIX', type: 'text', placeholder: 'email@dominio.com ou CPF', icon: CreditCard },
      { name: 'link_presente', label: 'Link da Lista de Presentes', type: 'url', placeholder: 'https://listapresentes.com/...', icon: Gift },
    ]
  },
]

function FieldInput({ field, register, errors }) {
  const Icon = field.icon
  const hasError = errors[field.name]
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: '#4a5568' }}>
        {field.label}{field.required ? ' *' : ''}
      </label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#c4a8d4' }} />
        <input
          type={field.type}
          placeholder={field.placeholder}
          {...register(field.name, { required: field.required ? `${field.label} é obrigatório` : false })}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: hasError ? 'rgba(244,167,185,0.12)' : 'rgba(196,168,212,0.12)',
            border: `1.5px solid ${hasError ? 'rgba(244,167,185,0.6)' : 'rgba(196,168,212,0.3)'}`,
            color: '#3d4a3d',
          }}
        />
      </div>
      {hasError && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#e88fa5' }}>
          <AlertCircle size={11} /> {hasError.message}
        </p>
      )}
    </div>
  )
}

export default function EventForm() {
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  useEffect(() => {
    if (isEditing) {
      supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) {
            navigate('/')
            return
          }
          reset(data)
          setLoading(false)
        })
    }
  }, [id, isEditing, user, navigate, reset])

  // Converte campos vazios para null (evita erro de tipo no Supabase)
  const sanitize = (data) => {
    const result = {}
    for (const key in data) {
      const val = data[key]
      result[key] = (val === '' || val === undefined) ? null : val
    }
    return result
  }

  const onSubmit = async (formData) => {
    setSaving(true)
    setError('')

    const cleanData = sanitize(formData)

    try {
      if (isEditing) {
        // Editar
        const { error } = await supabase
          .from('events')
          .update({ ...cleanData, user_id: user.id })
          .eq('id', id)
          .eq('user_id', user.id)
        if (error) throw error
      } else {
        // Criar com slug único
        const slug = generateUniqueSlug(cleanData.nome_evento || 'evento')
        const { error } = await supabase
          .from('events')
          .insert({ ...cleanData, user_id: user.id, slug })
        if (error) throw error
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Erro ao salvar evento. Tente novamente.')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (!error) navigate('/')
  }

  if (loading) return <LoadingSpinner text="Carregando evento..." />

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fce4ec 0%, #faf6ef 40%, #e8f5e9 100%)' }}>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/" className="flex items-center gap-2 text-sm mb-4 hover:opacity-70 transition-opacity" style={{ color: '#9b7ab5' }}>
            <ArrowLeft size={16} />
            Voltar ao dashboard
          </Link>
          <h1 className="font-playfair text-3xl font-bold" style={{ color: '#3d4a3d' }}>
            {isEditing ? '✏️ Editar Evento' : '🎉 Criar Novo Evento'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#7cb98a' }}>
            {isEditing ? 'Atualize as informações do seu convite' : 'Configure seu convite digital encantado'}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {fields.map((section, si) => (
              <motion.div
                key={section.section}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.1 }}
                className="rounded-3xl p-6 shadow-sm"
                style={{
                  background: 'rgba(253,252,248,0.92)',
                  border: '1px solid rgba(196,168,212,0.25)',
                }}
              >
                <h2 className="font-playfair text-lg font-semibold mb-4" style={{ color: '#3d4a3d' }}>
                  {section.section}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map(field => (
                    <div key={field.name} className={field.name === 'endereco_completo' ? 'sm:col-span-2' : ''}>
                      <FieldInput field={field} register={register} errors={errors} />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Colaboradores — só em eventos já criados */}
          {isEditing && (
            <CollaboratorsPanel eventId={id} isOwner={true} />
          )}

          {/* Erro global */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 rounded-xl text-sm flex items-center gap-2"
                style={{ background: 'rgba(244,167,185,0.2)', color: '#e88fa5' }}
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ações */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-6"
          >
            <motion.button
              type="submit"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold shadow-lg"
              style={{
                background: saving ? '#c4a8d4' : 'linear-gradient(135deg, #c4a8d4, #7cb98a)',
              }}
            >
              {saving ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Save size={18} />
              )}
              {saving ? 'Salvando...' : 'Salvar evento'}
            </motion.button>

            <Link to="/">
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl font-semibold text-sm"
                style={{ background: 'rgba(196,168,212,0.2)', color: '#9b7ab5' }}
              >
                Cancelar
              </motion.button>
            </Link>
          </motion.div>

          {/* Deletar (só em edição) */}
          {isEditing && (
            <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(196,168,212,0.3)' }}>
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
                  style={{ color: '#e88fa5' }}
                >
                  <Trash2 size={15} />
                  Excluir este evento permanentemente
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  style={{ background: 'rgba(244,167,185,0.15)', border: '1px solid rgba(244,167,185,0.3)' }}
                >
                  <p className="text-sm font-medium" style={{ color: '#e88fa5' }}>
                    ⚠️ Tem certeza? Todos os RSVPs também serão excluídos.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 rounded-xl text-xs text-white font-medium"
                      style={{ background: '#e88fa5' }}
                    >
                      Sim, excluir
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium"
                      style={{ background: 'rgba(196,168,212,0.2)', color: '#9b7ab5' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
