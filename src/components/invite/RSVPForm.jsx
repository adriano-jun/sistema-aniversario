import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useForm } from 'react-hook-form'
import { User, Users, Baby, AlertCircle, Minus, Plus, X } from 'lucide-react'

export default function RSVPForm({ eventId, onSuccess, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [qtdAdultos, setQtdAdultos] = useState(1)
  const [qtdCriancas, setQtdCriancas] = useState(0)
  const [idadesCriancas, setIdadesCriancas] = useState([])
  const [bebe, setBebe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateCriancas = (val) => {
    const newVal = Math.max(0, Math.min(10, val))
    setQtdCriancas(newVal)
    setIdadesCriancas(prev => {
      const updated = [...prev]
      while (updated.length < newVal) updated.push('')
      return updated.slice(0, newVal)
    })
  }

  const updateIdadeCrianca = (index, value) => {
    setIdadesCriancas(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.from('rsvps').insert({
        event_id: eventId,
        nome_convidado: data.nome_convidado,
        qtd_adultos: qtdAdultos,
        qtd_criancas: qtdCriancas,
        idades_criancas: idadesCriancas,
        restricoes: data.restricoes || null,
        alergias: data.alergias || null,
        bebe_colo: bebe,
      })
      if (error) throw error
      onSuccess()
    } catch (err) {
      setError('Erro ao confirmar presença. Tente novamente.')
    }
    setLoading(false)
  }

  const Counter = ({ value, onDec, onInc, min = 0, max = 20 }) => (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onDec}
        disabled={value <= min}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
        style={{ background: 'rgba(196,168,212,0.3)', color: '#9b7ab5' }}
      >
        <Minus size={14} />
      </motion.button>
      <span className="font-playfair text-2xl font-bold w-8 text-center" style={{ color: '#3d4a3d' }}>
        {value}
      </span>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onInc}
        disabled={value >= max}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
        style={{ background: 'linear-gradient(135deg, #c4a8d4, #7cb98a)', color: 'white' }}
      >
        <Plus size={14} />
      </motion.button>
    </div>
  )

  return (
    <div
      className="rounded-3xl p-6 shadow-xl"
      style={{
        background: 'rgba(253,252,248,0.95)',
        backdropFilter: 'blur(12px)',
        border: '2px solid rgba(196,168,212,0.4)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-playfair text-2xl font-bold" style={{ color: '#3d4a3d' }}>
            Confirmar Presença 🌸
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#9b7ab5' }}>
            Preencha rapidinho! ✨
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-xl transition-all hover:scale-105"
          style={{ background: 'rgba(196,168,212,0.2)', color: '#9b7ab5' }}
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Nome */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#4a5568' }}>
            Seu nome completo *
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#c4a8d4' }} />
            <input
              {...register('nome_convidado', { required: 'Nome é obrigatório' })}
              type="text"
              placeholder="Ex: Juliana e família"
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{
                background: errors.nome_convidado ? 'rgba(244,167,185,0.12)' : 'rgba(196,168,212,0.12)',
                border: `1.5px solid ${errors.nome_convidado ? 'rgba(244,167,185,0.6)' : 'rgba(196,168,212,0.3)'}`,
                color: '#3d4a3d',
              }}
            />
          </div>
          {errors.nome_convidado && (
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#e88fa5' }}>
              <AlertCircle size={11} /> {errors.nome_convidado.message}
            </p>
          )}
        </div>

        {/* Qtd adultos */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(196,168,212,0.1)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} style={{ color: '#9b7ab5' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#3d4a3d' }}>Adultos</p>
                <p className="text-xs" style={{ color: '#9b7ab5' }}>Maiores de 12 anos</p>
              </div>
            </div>
            <Counter
              value={qtdAdultos}
              onDec={() => setQtdAdultos(v => Math.max(1, v - 1))}
              onInc={() => setQtdAdultos(v => v + 1)}
              min={1}
            />
          </div>
        </div>

        {/* Qtd crianças */}
        <div className="rounded-2xl p-4" style={{ background: 'rgba(124,185,138,0.1)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Baby size={16} style={{ color: '#7cb98a' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: '#3d4a3d' }}>Crianças</p>
                <p className="text-xs" style={{ color: '#7cb98a' }}>Até 12 anos</p>
              </div>
            </div>
            <Counter
              value={qtdCriancas}
              onDec={() => updateCriancas(qtdCriancas - 1)}
              onInc={() => updateCriancas(qtdCriancas + 1)}
            />
          </div>

          {/* Campos de idade dinâmicos */}
          <AnimatePresence>
            {idadesCriancas.map((idade, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#7cb98a' }}>Criança {i + 1}:</span>
                  <input
                    type="text"
                    placeholder={`Ex: 3 anos ou bebê`}
                    value={idadesCriancas[i]}
                    onChange={e => updateIdadeCrianca(i, e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl text-xs outline-none"
                    style={{
                      background: 'rgba(124,185,138,0.15)',
                      border: '1px solid rgba(124,185,138,0.3)',
                      color: '#3d4a3d',
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bebê de colo */}
        <div
          className="flex items-center justify-between rounded-2xl p-4 cursor-pointer select-none"
          style={{ background: 'rgba(244,167,185,0.12)' }}
          onClick={() => setBebe(!bebe)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">👶</span>
            <div>
              <p className="text-sm font-medium" style={{ color: '#3d4a3d' }}>Bebê de colo</p>
              <p className="text-xs" style={{ color: '#9b7ab5' }}>Menos de 1 ano</p>
            </div>
          </div>
          <motion.div
            animate={{ scale: bebe ? 1 : 0.9 }}
            className="w-11 h-6 rounded-full relative transition-all"
            style={{ background: bebe ? 'linear-gradient(135deg, #c4a8d4, #7cb98a)' : 'rgba(196,168,212,0.3)' }}
          >
            <motion.div
              animate={{ x: bebe ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </motion.div>
        </div>

        {/* Restrições alimentares */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#4a5568' }}>
            Restrições alimentares
          </label>
          <textarea
            {...register('restricoes')}
            placeholder="Ex: Vegetariano, sem glúten..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{
              background: 'rgba(196,168,212,0.12)',
              border: '1.5px solid rgba(196,168,212,0.3)',
              color: '#3d4a3d',
            }}
          />
        </div>

        {/* Alergias */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#e88fa5' }}>
            ⚠️ Alergias
          </label>
          <textarea
            {...register('alergias')}
            placeholder="Ex: Amendoim, leite, frutos do mar..."
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{
              background: 'rgba(244,167,185,0.12)',
              border: '1.5px solid rgba(244,167,185,0.3)',
              color: '#3d4a3d',
            }}
          />
        </div>

        {/* Erro */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xs p-3 rounded-xl flex items-center gap-1.5"
              style={{ background: 'rgba(244,167,185,0.2)', color: '#e88fa5' }}
            >
              <AlertCircle size={12} /> {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Botão confirmar */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(196,168,212,0.4)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg"
          style={{
            background: loading
              ? '#c4a8d4'
              : 'linear-gradient(135deg, #c4a8d4 0%, #f4a7b9 50%, #7cb98a 100%)',
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Confirmando...
            </span>
          ) : (
            '🎉 Confirmar minha presença!'
          )}
        </motion.button>
      </form>
    </div>
  )
}
