import { TOKENFORGE_GENERATOR_URL } from './tokenforge-config.js';

const PRINT_FILTER_ALL = 'all';
const PRINT_PAGE_SIZE = 6;

let currentPrintPage = 1;

const sourceTypeLabels = {
  designed: 'Designed by me',
  remixed: 'Remixed/customized by me',
  printed: 'Printed by me / model by another maker'
};

const printGalleryItems = [
  {
    id: 'manual-swap-token-sample',
    name: 'Manual Color-Swap Game Token',
    title: 'Manual Color-Swap Game Token',
    description: 'Placeholder entry for a thin token/card-style print using planned layer-based color changes without AMS hardware.',
    categories: ['Tokens / Cards', 'Multi-color / Manual Filament Swap', 'Experimental'],
    sourceType: 'remixed',
    material: 'PLA',
    colors: ['Black', 'Gold', 'Red'],
    nozzle: '0.2mm',
    layerHeight: '0.1mm',
    modelOrigin: 'Placeholder for future TokenForge-related token work',
    tags: ['token', 'manual swap', 'relief', 'multi-color', 'PLA'],
    image: 'assets/images/prints/placeholder.svg',
    alt: 'Placeholder image for a manual color-swap 3D printed token',
    link: '',
    notes: 'Replace with a real photo and the actual layer/color plan once documented.',
    filters: ['remixed', 'tokens-cards', 'manual-filament-swap', 'experimental']
  },
  {
    id: 'functional-bracket-sample',
    name: 'Functional Bracket',
    title: 'Functional Bracket',
    description: 'Example utility print entry for a part where fit, orientation, wall count, and strength matter more than decoration.',
    categories: ['Functional', 'Repair / Utility'],
    sourceType: 'printed',
    material: 'PLA or PETG',
    colors: ['Black'],
    nozzle: '0.4mm',
    layerHeight: '0.2mm',
    modelOrigin: 'Placeholder for public model attribution',
    tags: ['functional', 'bracket', 'utility', 'fitment'],
    image: 'assets/images/prints/placeholder.svg',
    alt: 'Placeholder image for a functional 3D printed bracket',
    link: '',
    notes: 'Track model source, print orientation, wall count, and any tolerance adjustments here.',
    filters: ['printed-by-me', 'functional', 'repair-utility']
  },
  {
    id: 'repair-insert-sample',
    name: 'Repair / Replacement Insert',
    title: 'Repair / Replacement Insert',
    description: 'Placeholder for a practical repair print where the goal is to restore or improve an existing object.',
    categories: ['Functional', 'Repair / Utility'],
    sourceType: 'designed',
    material: 'PETG',
    colors: ['Dark Gray'],
    nozzle: '0.4mm',
    layerHeight: '0.2mm',
    modelOrigin: 'Designed from measurements / fit testing',
    tags: ['repair', 'utility', 'measurement', 'iteration'],
    image: 'assets/images/prints/placeholder.svg',
    alt: 'Placeholder image for a repair-oriented 3D printed insert',
    link: '',
    notes: 'A good real entry would include what failed, what was measured, and how many fit iterations were needed.',
    filters: ['designed-by-me', 'functional', 'repair-utility']
  },
  {
    id: 'storage-box-sample',
    name: 'Small Storage Box / Organizer',
    title: 'Small Storage Box / Organizer',
    description: 'Placeholder for a container or organizer print where usability, wall thickness, and print time tradeoffs matter.',
    categories: ['Functional', 'Experimental'],
    sourceType: 'remixed',
    material: 'PLA',
    colors: ['Black', 'White'],
    nozzle: '0.4mm',
    layerHeight: '0.2mm',
    modelOrigin: 'Placeholder for remixed or customized source model',
    tags: ['box', 'organizer', 'walls', 'infill', 'fit'],
    image: 'assets/images/prints/placeholder.svg',
    alt: 'Placeholder image for a printed storage box or organizer',
    link: '',
    notes: 'Useful place to document wall count, infill decisions, magnet slots, or any lid-fit adjustments.',
    filters: ['remixed', 'functional', 'experimental']
  },
  {
    id: 'decorative-figure-sample',
    name: 'Decorative Figure / Display Print',
    title: 'Decorative Figure / Display Print',
    description: 'Placeholder for a successful decorative print where surface finish, supports, and cleanup are the main learning points.',
    categories: ['Decorative'],
    sourceType: 'printed',
    material: 'PLA',
    colors: ['Beige'],
    nozzle: '0.4mm',
    layerHeight: '0.16mm',
    modelOrigin: 'Placeholder for public model attribution',
    tags: ['decorative', 'supports', 'surface finish', 'display'],
    image: 'assets/images/prints/placeholder.svg',
    alt: 'Placeholder image for a decorative 3D printed figure',
    link: '',
    notes: 'Replace with a real model attribution and support/cleanup notes before publishing as a real entry.',
    filters: ['printed-by-me', 'decorative']
  },
  {
    id: 'material-tuning-sample',
    name: 'Material / Nozzle Tuning Print',
    title: 'Material / Nozzle Tuning Print',
    description: 'Placeholder for calibration and material testing work, such as nozzle changes, adhesion checks, temperature tuning, or strength troubleshooting.',
    categories: ['Experimental'],
    sourceType: 'printed',
    material: 'PLA, PETG, wood PLA, or TPU',
    colors: ['Varies'],
    nozzle: '0.2mm / 0.4mm',
    layerHeight: '0.1mm - 0.2mm',
    modelOrigin: 'Calibration or test model',
    tags: ['calibration', 'nozzle', 'adhesion', 'temperature', 'troubleshooting'],
    image: 'assets/images/prints/placeholder.svg',
    alt: 'Placeholder image for a 3D printer calibration or tuning print',
    link: '',
    notes: 'Use this entry type for evidence of process: what changed, what improved, and what still needed tuning.',
    filters: ['printed-by-me', 'experimental']
  }
];

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value || '');
  return element.innerHTML;
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function getItemName(item) {
  return item.name || item.title || 'Untitled print';
}

function getSearchText(item) {
  return [
    getItemName(item),
    item.description,
    item.material,
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

// item: print gallery data object
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

// item: print gallery data object
// Returns: HTML string for a single accessible gallery card
function createPrintCard(item) {
  const itemName = getItemName(item);
  const categories = createListMarkup(item.categories || []);
  const colors = (item.colors || []).join(', ') || 'Not recorded';
  const tags = createListMarkup(item.tags || []);
  const sourceLabel = sourceTypeLabels[item.sourceType] || 'Source not recorded';
  const linkMarkup = item.link
    ? `<a class="print-card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">View source or notes</a>`
    : '';

  return `
    <article class="print-card" id="print-${escapeHtml(item.id)}" data-print-id="${escapeHtml(item.id)}">
      <img class="print-card-image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt || itemName)}" loading="lazy">
      <div class="print-card-body">
        <div class="print-card-header-row">
          <h3>${escapeHtml(itemName)}</h3>
          <span class="print-source-badge">${escapeHtml(sourceLabel)}</span>
        </div>
        <p class="print-card-description">${escapeHtml(item.description)}</p>
        <div class="print-card-tags" aria-label="Categories for ${escapeHtml(itemName)}">${categories}</div>
        <div class="print-card-specs" aria-label="Print settings for ${escapeHtml(itemName)}">
          <div><span class="print-card-meta-label">Material</span><strong>${escapeHtml(item.material || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Colors</span><strong>${escapeHtml(colors)}</strong></div>
          <div><span class="print-card-meta-label">Nozzle</span><strong>${escapeHtml(item.nozzle || 'Not recorded')}</strong></div>
          <div><span class="print-card-meta-label">Layer height</span><strong>${escapeHtml(item.layerHeight || 'Not recorded')}</strong></div>
        </div>
        <div class="print-card-footer">
          <p><span class="print-card-meta-label">Model origin:</span> ${escapeHtml(item.modelOrigin || 'Not recorded')}</p>
          <p class="print-card-notes"><span class="print-card-meta-label">Learned / notes:</span> ${escapeHtml(item.notes || 'Add notes when this entry is replaced.')}</p>
          <div class="print-card-tags" aria-label="Search tags for ${escapeHtml(itemName)}">${tags}</div>
          ${linkMarkup}
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
  noResults.hidden = visibleItems.length > 0;

  if (visibleItems.length === 0) {
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

  renderPrintGallery();
}

document.addEventListener('DOMContentLoaded', initPrintGallery);
