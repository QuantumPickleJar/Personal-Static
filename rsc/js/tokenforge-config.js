// Tokenforge Generator endpoint configuration. Set either value before deployment
// (for example with <html data-tokenforge-generator-url="https://...") to override
// the defaults without changing the gallery handoff code.
export const TOKENFORGE_LOCAL_GENERATOR_URL = 'http://127.0.0.1:8080';
export const TOKENFORGE_PRODUCTION_GENERATOR_URL = 'https://tokenforge.example.com';

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function getConfiguredGeneratorUrl() {
  const documentOverride = document.documentElement?.dataset.tokenforgeGeneratorUrl;
  const windowOverride = window.TOKENFORGE_GENERATOR_URL;
  return String(documentOverride || windowOverride || '').trim();
}

// The production value is intentionally a placeholder until Tokenforge has a
// deployed public URL. Local previews use the Generator's local default.
export const TOKENFORGE_GENERATOR_URL = getConfiguredGeneratorUrl()
  || (isLocalHost(window.location.hostname)
    ? TOKENFORGE_LOCAL_GENERATOR_URL
    : TOKENFORGE_PRODUCTION_GENERATOR_URL);
