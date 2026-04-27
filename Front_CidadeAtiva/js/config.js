/**
 * URL da API. Ordem de prioridade:
 * 1) ?api=http://host:porta na barra de endereço
 * 2) window.API_BASE_URL (defina antes de carregar este script, se quiser)
 * 3) API_BASE_URL em arquivo .env acessivel no front
 * 4) Mesmo host da página em localhost/127.0.0.1 (evita misturar hosts com Live Server)
 * 5) http://127.0.0.1:5000
 */
function parseEnvValue(content, key) {
  if (typeof content !== 'string' || !content.trim()) return null
  const lines = content.split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [rawKey, ...rest] = trimmed.split('=')
    if (rawKey?.trim() !== key) continue
    const rawValue = rest.join('=').trim()
    const unquoted = rawValue.replace(/^['"]|['"]$/g, '').trim()
    return unquoted || null
  }
  return null
}

function getApiBaseUrlFromDotEnv() {
  try {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '.env', false)
    xhr.send()
    if (xhr.status >= 200 && xhr.status < 300) {
      const fromEnv = parseEnvValue(xhr.responseText, 'API_BASE_URL')
      if (fromEnv) return fromEnv.replace(/\/$/, '')
    }
  } catch {
    /* ignore */
  }
  return null
}

function resolveApiBaseUrl() {
  try {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get('api')
    if (fromQuery) return fromQuery.replace(/\/$/, '')
  } catch {
    /* ignore */
  }
  if (typeof window.API_BASE_URL === 'string' && window.API_BASE_URL.trim()) {
    return window.API_BASE_URL.trim().replace(/\/$/, '')
  }
  const fromDotEnv = getApiBaseUrlFromDotEnv()
  if (fromDotEnv) {
    return fromDotEnv
  }
  const h = window.location.origin
  if (h === 'localhost' || h === '127.0.0.1') {
    return `http://${h}:5000`
  }
  return 'http://127.0.0.1:5000'
}

window.APP_CONFIG = {
  API_BASE_URL: resolveApiBaseUrl(),
}
