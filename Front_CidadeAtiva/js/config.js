/**
 * URL da API. Ordem de prioridade:
 * 1) ?api=http://host:porta na barra de endereço
 * 2) window.API_BASE_URL (defina antes de carregar este script, se quiser)
 * 3) http://localhost:5000
 */
function resolveApiBaseUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('api');
    if (fromQuery) return fromQuery.replace(/\/$/, '');
  } catch {
    /* ignore */
  }
  if (typeof window.API_BASE_URL === 'string' && window.API_BASE_URL.trim()) {
    return window.API_BASE_URL.trim().replace(/\/$/, '');
  }
  return 'http://localhost:5000';
}

window.APP_CONFIG = {
  API_BASE_URL: resolveApiBaseUrl(),
};
