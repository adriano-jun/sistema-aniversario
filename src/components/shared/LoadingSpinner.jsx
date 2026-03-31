import { motion } from 'framer-motion'

export default function LoadingSpinner({ text = 'Carregando...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8f5e9 100%)' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-4 border-garden-lilac border-t-garden-pink"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 font-playfair text-garden-dark text-lg"
      >
        {text}
      </motion.p>
    </div>
  )
}
