export const TOKENFORGE_LOCAL_GENERATOR_URL = 'http://127.0.0.1:8080';
export const TOKENFORGE_PRODUCTION_GENERATOR_URL = 'https://quantumpicklejar.github.io/tokenforge-generator/';

export const PRINTDESK_REQUEST_LOCAL_URL = 'http://localhost:5173/tokenforge-printdesk/#/request';
export const PRINTDESK_REQUEST_PRODUCTION_URL = 'https://quantumpicklejar.github.io/tokenforge-printdesk/#/request';

export const PRINTDESK_GALLERY_ADMIN_LOCAL_URL = 'http://192.168.0.149:5175';
export const PRINTDESK_GALLERY_ADMIN_PRODUCTION_URL = 'http://192.168.0.149:5175';

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function readConfiguredUrl(documentKey, windowKey) {
  const documentOverride = document.documentElement?.dataset[documentKey];
  const windowOverride = window[windowKey];
  return String(documentOverride || windowOverride || '').trim();
}

export const TOKENFORGE_GENERATOR_URL = readConfiguredUrl('tokenforgeGeneratorUrl', 'TOKENFORGE_GENERATOR_URL')
  || (isLocalHost(window.location.hostname)
    ? TOKENFORGE_LOCAL_GENERATOR_URL
    : TOKENFORGE_PRODUCTION_GENERATOR_URL);

export const PRINTDESK_REQUEST_URL = readConfiguredUrl('printdeskRequestUrl', 'PRINTDESK_REQUEST_URL')
  || (isLocalHost(window.location.hostname)
    ? PRINTDESK_REQUEST_LOCAL_URL
    : PRINTDESK_REQUEST_PRODUCTION_URL);

export const PRINTDESK_GALLERY_ADMIN_URL = readConfiguredUrl('printdeskGalleryAdminUrl', 'PRINTDESK_GALLERY_ADMIN_URL')
  || (isLocalHost(window.location.hostname)
    ? PRINTDESK_GALLERY_ADMIN_LOCAL_URL
    : PRINTDESK_GALLERY_ADMIN_PRODUCTION_URL);
