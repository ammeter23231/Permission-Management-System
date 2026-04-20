import { GET_TOKEN } from '@/utils/token'

const STORAGE_KEY = 'THEME_IS_DARK'

/** 未登录始终亮色；已登录未设置过偏好时默认暗黑；否则按本地存储 */
export function getDarkModePreference(): boolean {
  if (!GET_TOKEN()) return false
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw === 'true') return true
  if (raw === 'false') return false
  return true
}

export function setDarkModePreference(isDark: boolean) {
  localStorage.setItem(STORAGE_KEY, String(isDark))
}

export function applyDarkModeToDocument(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
}

export function applyDarkModeFromStoredPreference() {
  applyDarkModeToDocument(getDarkModePreference())
}
