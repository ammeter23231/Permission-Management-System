const DEFAULT_AVATAR_URL = '/api/static/img/userDefaultAvatar/defaultAvatar.svg'

function isHttpUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

export function normalizeAvatarUrl(url?: string): string {
  const raw = (url || '').trim()
  if (!raw) return DEFAULT_AVATAR_URL
  if (isHttpUrl(raw) || raw.startsWith('data:')) return raw
  if (raw.startsWith('/api/static/')) return raw
  if (raw.startsWith('/static/')) return raw.replace('/static/', '/api/static/')
  if (raw.startsWith('static/')) return `/api/${raw}`
  if (raw.startsWith('/')) return raw
  return `/${raw}`
}

export function getDefaultAvatarUrl() {
  return DEFAULT_AVATAR_URL
}
