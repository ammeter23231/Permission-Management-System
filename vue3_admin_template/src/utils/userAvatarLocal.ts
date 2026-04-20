const KEY_PREFIX = 'vue3-admin-avatar-local:'

export function getLocalAvatarOverride(username: string): string | null {
  if (!username) return null
  return localStorage.getItem(KEY_PREFIX + username)
}

export function setLocalAvatarOverride(username: string, url: string) {
  localStorage.setItem(KEY_PREFIX + username, url)
}

export function clearLocalAvatarOverride(username: string) {
  if (username) localStorage.removeItem(KEY_PREFIX + username)
}
