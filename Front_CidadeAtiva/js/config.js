/**
 * URL da API. Ordem de prioridade:
 * 1) ?api=http://host:porta na barra de endereço
 * 2) window.API_BASE_URL (defina antes de carregar este script, se quiser)
 * 3) Mesmo host da página em localhost/127.0.0.1 (evita misturar hosts com Live Server)
 * 4) http://127.0.0.1:5000
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
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') {
    return `http://${h}:5000`;
  }
  return 'http://127.0.0.1:5000';
}

window.APP_CONFIG = {
  API_BASE_URL: resolveApiBaseUrl(),
};
