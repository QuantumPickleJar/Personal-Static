// Tokenforge Generator endpoint configuration. Set either value before deployment
// (for example with <html data-tokenforge-generator-url="https://...">) to override
// the defaults without changing the gallery handoff code.
export const TOKENFORGE_LOCAL_GENERATOR_URL = 'http://127.0.0.1:8080';
export const TOKENFORGE_PRODUCTION_GENERATOR_URL = 'https://tokenforge.example.com';

// Pi Gallery Admin endpoint configuration. The local fallback is only for
// development on the home network; set a deployed URL before publishing.
export const PRINTDESK_GALLERY_ADMIN_LOCAL_URL = 'http://192.168.0.149:5175';
export const PRINTDESK_GALLERY_ADMIN_PRODUCTION_URL = 'https://printdesk-gallery-admin.example.com';

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function getConfiguredGeneratorUrl() {
  const documentOverride = document.documentElement?.dataset.tokenforgeGeneratorUrl;
  const windowOverride = window.TOKENFORGE_GENERATOR_URL;
  return String(documentOverride || windowOverride || '').trim();
}

function getConfiguredGalleryAdminUrl() {
  const documentOverride = document.documentElement?.dataset.printdeskGalleryAdminUrl;
  const windowOverride = window.PRINTDESK_GALLERY_ADMIN_URL;
  return String(documentOverride || windowOverride || '').trim();
}

// The production value is intentionally a placeholder until Tokenforge has a
// deployed public URL. Local previews use the Generator's local default.
export const TOKENFORGE_GENERATOR_URL = getConfiguredGeneratorUrl()
  || (isLocalHost(window.location.hostname)
    ? TOKENFORGE_LOCAL_GENERATOR_URL
    : TOKENFORGE_PRODUCTION_GENERATOR_URL);

// The Pi service URL is intentionally centralized here so the public page never
// asks for a GitHub PAT. Local previews use the Pi fallback; deployed pages
// should override this with data-printdesk-gallery-admin-url or a window value.
export const PRINTDESK_GALLERY_ADMIN_URL = getConfiguredGalleryAdminUrl()
  || (isLocalHost(window.location.hostname)
    ? PRINTDESK_GALLERY_ADMIN_LOCAL_URL
    : PRINTDESK_GALLERY_ADMIN_PRODUCTION_URL);
