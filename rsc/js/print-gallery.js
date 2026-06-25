import {
  TOKENFORGE_GENERATOR_URL,
  PRINTDESK_GALLERY_ADMIN_URL
} from './tokenforge-config.js';

const PRINT_FILTER_ALL = 'all';
const PRINT_PAGE_SIZE = 6;
const GALLERY_DATA_URL = 'data/3d-print-gallery.json';
const PLACEHOLDER_IMAGE = 'assets/images/prints/placeholder.svg';

let currentPrintPage = 1;
let printGalleryItems = [];
let galleryLoadState = 'loading';
let galleryLoadMessage = 'Loading print entries…';

const sourceTypeLabels = {
  designed: 'Designed by me',
  remixed: 'Remixed/customized by me',
  printed: 'Printed by me / model by another maker'
};

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value || '');
  return element.innerHTML;
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function slugify(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function deriveAltText(entry, title) {
  const explicitAlt = String(entry.alt || entry.altText || '').trim();
  if (explicitAlt) return explicitAlt;
  return title ? `${title} 3D print photo` : '3D print gallery photo';
}

function normalizeCategories(entry) {
  const rawCategories = [
    ...toArray(entry.categories),
    ...toArray(entry.category)
  ];

  return rawCategories
    .map((category) => String(category || '').trim())
    .filter(Boolean);
}

function deriveFilters(entry, categories, tags) {
  const filterValues = new Set(toArray(entry.filters).map(slugify).filter(Boolean));

  categories.forEach((category) => {
    const categorySlug = slugify(category);
    if (categorySlug) filterValues.add(categorySlug);
  });

  tags.forEach((tag) => {
    const tagSlug = slugify(tag);
    if (tagSlug) filterValues.add(tagSlug);
  });

  if (entry.sourceType === 'designed') filterValues.add('designed-by-me');
  if (entry.sourceType === 'printed') filterValues.add('printed-by-me');

  return Array.from(filterValues);
}

function normalizeGalleryEntry(entry, index) {
  const rawEntry = entry && typeof entry === 'object' ? entry : {};
  const title = String(rawEntry.title || rawEntry.name || 'Untitled print').trim();
  const id = slugify(rawEntry.id || title || `print-${index + 1}`) || `print-${index + 1}`;
  const description = String(
    rawEntry.shortDescription
    || rawEntry.description
    || rawEntry.longDescription
    || rawEntry.notes
    || ''
  ).trim();
  const categories = normalizeCategories(rawEntry);
  const tags = toArray(rawEntry.tags).map((tag) => String(tag).trim()).filter(Boolean);
  const images = toArray(rawEntry.images).map((image) => String(image).trim()).filter(Boolean);
  const image = String(rawEntry.image || images[0] || PLACEHOLDER_IMAGE).trim();
  const sourceType = String(rawEntry.sourceType || '').trim();

  return {
    ...rawEntry,
    id,
    name: title,
    title,
    description,
    longDescription: String(rawEntry.longDescription || '').trim(),
    categories,
    category: String(rawEntry.category || categories[0] || '').trim(),
    sourceType,
    material: String(rawEntry.material || '').trim(),
    printer: String(rawEntry.printer || '').trim(),
    nozzle: String(rawEntry.nozzle || '').trim(),
    layerHeight: String(rawEntry.layerHeight || '').trim(),
    printTime: String(rawEntry.printTime || '').trim(),
    status: String(rawEntry.status || '').trim(),
    notes: String(rawEntry.notes || '').trim(),
    tags,
    images,
    image,
    alt: deriveAltText(rawEntry, title),
    attachment: rawEntry.attachment || null,
    filters: deriveFilters(rawEntry, categories, tags)
  };
}

async function loadPrintGalleryData() {
  galleryLoadState = 'loading';
  galleryLoadMessage = 'Loading print entries…';
  renderPrintGallery();

  try {
    const response = await fetch(GALLERY_DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Gallery JSON returned ${response.status}`);
    }

    const payload = await response.json();
    const entries = Array.isArray(payload?.entries)
      ? payload.entries
      : Array.isArray(payload)
        ? payload
        : [];

    printGalleryItems = entries.map(normalizeGalleryEntry);
    galleryLoadState = 'loaded';
    galleryLoadMessage = printGalleryItems.length
      ? ''
      : 'No 3D print entries are published yet. Add entries through the Pi admin service.';
  } catch (error) {
    console.warn('3D print gallery JSON could not be loaded.', error);
    printGalleryItems = [];
    galleryLoadState = 'error';
    galleryLoadMessage = 'The 3D print gallery data could not be loaded. The page is still usable, but no entries are available right now.';
  }

  currentPrintPage = 1;
  renderPrintGallery();
}

function getItemName(item) {
  return item.name || item.title || 'Untitled print';
}

function getSearchText(item) {
  return [
    getItemName(item),
    item.description,
    item.longDescription,
    item.material,
    item.printer,
    item.nozzle,
    item.layerHeight,
    item.printTime,
    item.status,
    item.modelOrigin,
    item.notes,
    sourceTypeLabels[item.sourceType],
    ...(item.colors || []),
    ...(item.categories || []),
    ...(item.tags || [])
  ].map(normalize).join(' ');
}

function getAbsoluteUrl(value) {
  if (!value) return '';

  try {
    return new URL(value, window.location.href).toString();
  } catch (error) {
    console.warn('Tokenforge handoff skipped an invalid gallery URL.', error);
    return '';
  }
}

function getNumberOrNull(value) {
  const parsed = Number.parseFloat(String(value || '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

// Tokenforge handoff contract: tokenforge.handoff.v1. Keep this mapping in
// sync with the Generator so the portfolio remains a static, public demo.
function createTokenforgeHandoff(item) {
  const galleryUrl = new URL(window.location.href);
  galleryUrl.hash = `print-${item.id}`;
  const name = getItemName(item);

  return {
    schema: 'tokenforge.handoff.v1',
    source: 'portfolio-gallery',
    intent: 'request-print',
    item: {
      id: item.id || '',
      name,
      description: item.description || '',
      galleryUrl: galleryUrl.toString(),
      imageUrl: getAbsoluteUrl(item.image),
      modelUrl: getAbsoluteUrl(item.modelUrl),
      previewUrl: getAbsoluteUrl(item.previewUrl || item.image)
    },
    print: {
      category: (item.categories || []).join(', '),
      material: item.material || '',
      nozzleMm: getNumberOrNull(item.nozzle),
      layerHeightMm: getNumberOrNull(item.layerHeight),
      colors: Array.isArray(item.colors) ? item.colors : [],
      estimatedGrams: getNumberOrNull(item.estimatedGrams),
      estimatedTimeMinutes: getNumberOrNull(item.estimatedTimeMinutes),
      notes: item.notes || ''
    },
    generator: {
      mode: 'IMG',
      projectName: name,
      allowCustomization: true
    }
  };
}

function encodeUrlSafeBase64Json(value) {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  let binary = '';
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function setTokenforgeHandoffStatus(message) {
  const status = document.getElementById('tokenforgeHandoffStatus');
  if (!status) return;

  status.hidden = !message;
  status.textContent = message || '';
}

function openTokenforge(item) {
  let destination = TOKENFORGE_GENERATOR_URL;

  try {
    const generatorUrl = new URL(TOKENFORGE_GENERATOR_URL);
    generatorUrl.searchParams.set('handoff', encodeUrlSafeBase64Json(createTokenforgeHandoff(item)));
    destination = generatorUrl.toString();
  } catch (error) {
    console.warn('Could not encode the Tokenforge handoff; opening a blank request instead.', error);
    setTokenforgeHandoffStatus('Could not prefill this request. Opening Tokenforge for a new custom request instead.');
  }

  window.location.assign(destination);
}

function getActiveFilter() {
  const activeButton = document.querySelector('.print-filter-btn.is-active');
  return activeButton ? activeButton.dataset.filter : PRINT_FILTER_ALL;
}

// item: normalized print gallery data object
// activeFilter: selected filter key, such as "functional" or "designed-by-me"
// searchTerm: lower-cased free-text query from the search box
function matchesFilters(item, activeFilter, searchTerm) {
  const filterMatches = activeFilter === PRINT_FILTER_ALL || (item.filters || []).includes(activeFilter);
  const searchMatches = !searchTerm || getSearchText(item).includes(searchTerm);
  return filterMatches && searchMatches;
}

function createListMarkup(items) {
  return items.map(function(item) {
    return `<span>${escapeHtml(item)}</span>`;
  }).join('');
}

function createOptionalLink(label, href) {
  if (!href) return '';
  return `<a class="print-card-link" href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
}

// item: normalized print gallery data object
// Returns: HTML string for a single accessible gallery card
function createPrintCard(item) {
  const itemName = getItemName(item);
  const categories = createListMarkup(item.categories || []);
  const tags = createListMarkup(item.tags || []);
  const badgeLabel = sourceTypeLabels[item.sourceType] || item.status || item.category || 'Print entry';
  const sourceLink = createOptionalLink('View source or notes', item.link);
  const attachmentLink = createOptionalLink('Download attachment', item.attachment);

  return `
    <article class="print-card" id="print-${escapeHtml(item.id)}" data-print-id="${escapeHtml(item.id)}">
      <img class="print-card-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt || itemName)}" loading="lazy">
      <div class="print-card-body">
        <div class="print-card-header-row">
          <h3>${escapeHtml(itemName)}</h3>
          <span class="print-source-badge">${escapeHtml(badgeLabel)}</span>
        </div>
        <p class="print-card-description">${escapeHtml(item.description || 'No description recorded yet.')}</p>
        <div class="print-card-tags" aria-label="Categories for ${escapeHtml(itemName)}">${categories}</div>
        <div class="print-card-specs" aria-label="Print settings for ${escapeHtml(itemName)}">
          <div><span class="print-card-meta-label">Material</span><strong>${escapeHtml(item.material || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Printer</span><strong>${escapeHtml(item.printer || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Nozzle</span><strong>${escapeHtml(item.nozzle || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Layer height</span><strong>${escapeHtml(item.layerHeight || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Print time</span><strong>${escapeHtml(item.printTime || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Status</span><strong>${escapeHtml(item.status || 'Not recorded')}</strong></div>
        </div>
        <div class="print-card-footer">
          <p class="print-card-notes"><span class="print-card-meta-label">Learned / notes:</span> ${escapeHtml(item.notes || 'No notes recorded yet.')}</p>
          <div class="print-card-tags" aria-label="Search tags for ${escapeHtml(itemName)}">${tags}</div>
          ${sourceLink}
          ${attachmentLink}
          <button class="tokenforge-handoff-btn" type="button" data-tokenforge-print-id="${escapeHtml(item.id)}">
            Customize / Request in Tokenforge
          </button>
        </div>
      </div>
    </article>
  `;
}

function getVisibleItems() {
  const searchInput = document.getElementById('printSearch');
  const activeFilter = getActiveFilter();
  const searchTerm = normalize(searchInput ? searchInput.value : '');

  return printGalleryItems.filter(function(item) {
    return matchesFilters(item, activeFilter, searchTerm);
  });
}

function getPaginationState(visibleItemCount) {
  const totalPages = Math.max(1, Math.ceil(visibleItemCount / PRINT_PAGE_SIZE));
  currentPrintPage = Math.min(Math.max(currentPrintPage, 1), totalPages);

  const startIndex = (currentPrintPage - 1) * PRINT_PAGE_SIZE;
  const endIndex = Math.min(startIndex + PRINT_PAGE_SIZE, visibleItemCount);

  return {
    totalPages,
    startIndex,
    endIndex
  };
}

function updatePaginationControls(totalPages, visibleItemCount) {
  const previousButton = document.getElementById('printPrevPage');
  const nextButton = document.getElementById('printNextPage');
  const pageStatus = document.getElementById('printPageStatus');

  if (!previousButton || !nextButton || !pageStatus) {
    return;
  }

  previousButton.disabled = currentPrintPage <= 1 || visibleItemCount === 0;
  nextButton.disabled = currentPrintPage >= totalPages || visibleItemCount === 0;
  pageStatus.textContent = visibleItemCount === 0
    ? 'Page 0 of 0'
    : `Page ${currentPrintPage} of ${totalPages}`;
}

function renderPrintGallery() {
  const galleryGrid = document.getElementById('printGalleryGrid');
  const noResults = document.getElementById('printNoResults');
  const resultCount = document.getElementById('printResultCount');

  if (!galleryGrid || !noResults || !resultCount) {
    return;
  }

  const visibleItems = getVisibleItems();
  const pagination = getPaginationState(visibleItems.length);
  const pageItems = visibleItems.slice(pagination.startIndex, pagination.endIndex);

  galleryGrid.innerHTML = pageItems.map(createPrintCard).join('');

  if (printGalleryItems.length === 0) {
    noResults.textContent = galleryLoadMessage;
    noResults.hidden = galleryLoadState === 'loading' && !galleryLoadMessage;
  } else {
    noResults.textContent = 'No matching prints found. Try clearing the search or selecting All.';
    noResults.hidden = visibleItems.length > 0;
  }

  if (galleryLoadState === 'loading') {
    resultCount.textContent = 'Loading print entries…';
  } else if (visibleItems.length === 0) {
    resultCount.textContent = `0 of ${printGalleryItems.length} print entries shown`;
  } else {
    resultCount.textContent = `${pagination.startIndex + 1}-${pagination.endIndex} of ${visibleItems.length} matching print entries shown`;
  }

  updatePaginationControls(pagination.totalPages, visibleItems.length);
}

function setActiveFilter(button) {
  document.querySelectorAll('.print-filter-btn').forEach(function(filterButton) {
    const isActive = filterButton === button;
    filterButton.classList.toggle('is-active', isActive);
    filterButton.setAttribute('aria-pressed', String(isActive));
  });
}

function resetToFirstPageAndRender() {
  currentPrintPage = 1;
  renderPrintGallery();
}

function initPrintGallery() {
  const searchInput = document.getElementById('printSearch');
  const filterButtons = document.querySelectorAll('.print-filter-btn');
  const previousButton = document.getElementById('printPrevPage');
  const nextButton = document.getElementById('printNextPage');
  const adminLink = document.getElementById('printAdminServiceLink');

  if (adminLink && PRINTDESK_GALLERY_ADMIN_URL) {
    adminLink.href = PRINTDESK_GALLERY_ADMIN_URL;
  }

  if (!searchInput || filterButtons.length === 0) {
    return;
  }

  searchInput.addEventListener('input', resetToFirstPageAndRender);
  document.getElementById('printGalleryGrid')?.addEventListener('click', function(event) {
    const handoffButton = event.target.closest('[data-tokenforge-print-id]');
    if (!handoffButton) return;

    const item = printGalleryItems.find(function(candidate) {
      return candidate.id === handoffButton.dataset.tokenforgePrintId;
    });

    if (item) openTokenforge(item);
  });
  filterButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      setActiveFilter(button);
      resetToFirstPageAndRender();
    });
  });

  if (previousButton) {
    previousButton.addEventListener('click', function() {
      currentPrintPage -= 1;
      renderPrintGallery();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function() {
      currentPrintPage += 1;
      renderPrintGallery();
    });
  }

  loadPrintGalleryData();
}

document.addEventListener('DOMContentLoaded', initPrintGallery);
