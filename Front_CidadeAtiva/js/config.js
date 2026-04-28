/**
 * Configuração da API (versão EC2 + Nginx)
 * Usa o próprio domínio onde o front está hospedado
 */

function resolveApiBaseUrl() {
  // Sempre usa o mesmo host do front (EC2 ou local)
  return window.location.origin;
}

window.APP_CONFIG = {
  API_BASE_URL: resolveApiBaseUrl(),
};
