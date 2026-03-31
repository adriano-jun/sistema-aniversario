/**
 * Gera um slug URL-friendly a partir de um string
 */
export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Gera um slug único com sufixo aleatório
 */
export function generateUniqueSlug(name) {
  const base = slugify(name)
  const suffix = Math.random().toString(36).substring(2, 7)
  return `${base}-${suffix}`
}
