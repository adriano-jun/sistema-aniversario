import { motion } from 'framer-motion'
import { useMemo } from 'react'

// SVG de uma borboleta estilizada
function ButterflyShape({ color1 = '#c4a8d4', color2 = '#f4a7b9', size = 1 }) {
  return (
    <svg
      viewBox="0 0 80 50"
      width={40 * size}
      height={25 * size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Asa esquerda superior */}
      <path d="M40 25 C35 10, 10 5, 5 20 C0 35, 20 40, 40 25Z" fill={color1} fillOpacity="0.8" />
      {/* Asa esquerda inferior */}
      <path d="M40 25 C30 30, 8 35, 10 45 C15 50, 35 42, 40 25Z" fill={color2} fillOpacity="0.7" />
      {/* Asa direita superior */}
      <path d="M40 25 C45 10, 70 5, 75 20 C80 35, 60 40, 40 25Z" fill={color1} fillOpacity="0.8" />
      {/* Asa direita inferior */}
      <path d="M40 25 C50 30, 72 35, 70 45 C65 50, 45 42, 40 25Z" fill={color2} fillOpacity="0.7" />
      {/* Corpo */}
      <ellipse cx="40" cy="25" rx="3" ry="12" fill="#7cb98a" />
      {/* Antenas */}
      <line x1="38" y1="14" x2="30" y2="5" stroke="#7cb98a" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="30" cy="5" r="2" fill="#7cb98a" />
      <line x1="42" y1="14" x2="50" y2="5" stroke="#7cb98a" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="50" cy="5" r="2" fill="#7cb98a" />
    </svg>
  )
}

export default function Butterfly({ index = 0 }) {
  // Gerar propriedades únicas baseadas no index
  const props = useMemo(() => {
    const seed = index * 7.3
    const colors = [
      ['#c4a8d4', '#f4a7b9'],
      ['#f4a7b9', '#c4a8d4'],
      ['#7cb98a', '#f4a7b9'],
      ['#d4af37', '#c4a8d4'],
      ['#c4a8d4', '#7cb98a'],
    ]
    const colorPair = colors[index % colors.length]
    return {
      x: 5 + ((seed * 13.7) % 85),      // % da largura
      delay: (seed * 0.37) % 5,          // delay inicial
      duration: 6 + ((seed * 2.1) % 8), // duração do loop
      size: 0.6 + ((seed * 0.1) % 0.8), // tamanho
      color1: colorPair[0],
      color2: colorPair[1],
      amplitude: 20 + ((seed * 3) % 40), // amplitude vertical
    }
  }, [index])

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: `${props.x}%`, top: `${10 + (index * 8.3) % 75}%` }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        x: [0, props.amplitude, -props.amplitude / 2, props.amplitude / 3, 0],
        y: [0, -props.amplitude, -props.amplitude * 0.5, props.amplitude * 0.3, 0],
        opacity: [0, 0.85, 0.85, 0.85, 0],
      }}
      transition={{
        duration: props.duration,
        delay: props.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <motion.div
        animate={{
          scaleX: [1, 0.3, 1, 0.3, 1], // bater asas
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: 'center' }}
      >
        <ButterflyShape color1={props.color1} color2={props.color2} size={props.size} />
      </motion.div>
    </motion.div>
  )
}
