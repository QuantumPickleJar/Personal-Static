/**
 * @file stackIconLoader.js
 * @description Handles fetching tech-stack-icons from the icon map or local fallbacks,
 *              with theme-aware contrast handling for transparent/monochrome icons.
 */

import { iconSvgs } from './stackSvgMap.js';
import { allProjects } from './projects.js';
import { initPagination } from './pagination.js';
import { projectsPerPage } from './perPageSettings.js';

const EXTRA_ICON_SVGS = {
  MAUI: `
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label=".NET MAUI">
      <rect width="100" height="100" rx="22" fill="#512BD4"/>
      <path d="M24 24h52v52H24z" rx="10" fill="#6D44E8"/>
      <path d="M31 65V35h7.2l8.1 13.9L54.4 35h7.2v30h-6.7V46.7l-6.5 11h-4.2l-6.5-11V65H31Z" fill="white"/>
      <path d="M65.5 65V35H72v30h-6.5Z" fill="#D9CCFF"/>
    </svg>
  `,
  Teams: `
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Microsoft Teams">
      <rect x="28" y="18" width="48" height="50" rx="12" fill="#6264A7"/>
      <rect x="16" y="31" width="43" height="47" rx="10" fill="#464EB8"/>
      <circle cx="72" cy="36" r="10" fill="#7B83EB"/>
      <circle cx="78" cy="57" r="8" fill="#5059C9"/>
      <path d="M27 43h24v7.2h-8.1V67h-7.7V50.2H27V43Z" fill="white"/>
    </svg>
  `
};

const ICON_ALIASES = {
  'microsoft teams': 'Teams',
  microsoftteams: 'Teams',
  teams: 'Teams',
  '.net maui': 'MAUI',
  dotnetmaui: 'MAUI',
  maui: 'MAUI'
};

// Export mapping of tech names to icons for external use and filter-chip creation.
export const stackSvgMap = {
  ...iconSvgs,
  ...EXTRA_ICON_SVGS
};

const MONOCHROME_OR_TRANSPARENT_TECHS = new Set([
  'github',
  'git',
  'gitlab',
  'maui',
  '.net maui',
  'dotnet',
  '.net',
  'netcore',
  'dotnetcore',
  '.net core',
  'xml',
  'json',
  'jwt',
  'tex',
  'obsidian'
]);

function normalizeLookupKey(techName) {
  return techName
    .trim()
    .toLowerCase()
    .replace(/[\s_\-.#/]+/g, '');
}

function getMappedSvg(techName) {
  const trimmed = techName.trim();
  const aliasKey = trimmed.toLowerCase();
  const compactAliasKey = normalizeLookupKey(trimmed);
  const alias = ICON_ALIASES[aliasKey] || ICON_ALIASES[compactAliasKey];

  if (alias && stackSvgMap[alias]) return stackSvgMap[alias];
  if (stackSvgMap[trimmed]) return stackSvgMap[trimmed];

  const compactKey = normalizeLookupKey(trimmed);
  const matchingEntry = Object.entries(stackSvgMap).find(([key]) => {
    return normalizeLookupKey(key) === compactKey;
  });

  return matchingEntry ? matchingEntry[1] : null;
}

function shouldUseContrastTreatment(techName, hasInlineSvg) {
  const normalized = techName.trim().toLowerCase();
  const compact = normalizeLookupKey(techName);

  return MONOCHROME_OR_TRANSPARENT_TECHS.has(normalized) ||
    MONOCHROME_OR_TRANSPARENT_TECHS.has(compact) ||
    !hasInlineSvg;
}

function shouldInvertInDarkMode(techName) {
  const compact = normalizeLookupKey(techName);
  return ['github', 'git', 'tex', 'xml', 'json', 'jwt'].includes(compact);
}

function ensureStackIconStyles() {
  if (document.getElementById('stack-icon-theme-styles')) return;

  const style = document.createElement('style');
  style.id = 'stack-icon-theme-styles';
  style.textContent = `
    .stack-item-container {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      min-width: 0;
      padding: 0.18rem 0.35rem;
      border-radius: 999px;
      background: color-mix(in srgb, var(--md-sys-color-surface-container, #f7f2fa) 78%, transparent);
      border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant, #cac4d0) 72%, transparent);
      color: var(--md-sys-color-on-surface, #1d1b20);
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
    }

    .stack-icon-surface {
      width: 1.7rem;
      height: 1.7rem;
      flex: 0 0 1.7rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.55rem;
      background: color-mix(in srgb, var(--md-sys-color-surface, #ffffff) 92%, var(--md-sys-color-primary, #6750a4) 8%);
      border: 1px solid color-mix(in srgb, var(--md-sys-color-outline-variant, #cac4d0) 78%, transparent);
      overflow: hidden;
    }

    .stack-item-container.needs-contrast .stack-icon-surface,
    .stack-item-container.has-text-fallback .stack-icon-surface {
      background: color-mix(in srgb, var(--md-sys-color-surface, #ffffff) 86%, var(--md-sys-color-primary-container, #eaddff) 14%);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.42);
    }

    .stack-image {
      display: block;
      width: 1.18rem !important;
      height: 1.18rem !important;
      object-fit: contain;
      margin: 0 !important;
      filter: drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18));
    }

    .stack-text-fallback {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 0 0.12rem;
      font-size: 0.62rem;
      line-height: 1;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--md-sys-color-primary, #6750a4);
      background: transparent;
      border-radius: inherit;
    }

    .stack-label {
      max-width: 7.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.78rem;
      line-height: 1;
      color: var(--md-sys-color-on-surface-variant, #49454f);
    }

    body.dark-mode .stack-item-container {
      background: color-mix(in srgb, var(--md-sys-color-surface-container, #343434) 84%, transparent);
      border-color: rgba(255, 255, 255, 0.14);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.32);
    }

    body.dark-mode .stack-icon-surface {
      background: color-mix(in srgb, var(--md-sys-color-surface, #1f1f1f) 74%, var(--md-sys-color-primary-container, #4f378b) 26%);
      border-color: rgba(255, 255, 255, 0.16);
    }

    body.dark-mode .stack-item-container.needs-contrast .stack-icon-surface,
    body.dark-mode .stack-item-container.has-text-fallback .stack-icon-surface {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06));
    }

    body.dark-mode .stack-item-container.is-monochrome .stack-image {
      filter: invert(1) brightness(1.14) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
    }

    body.dark-mode .stack-image {
      filter: brightness(1.08) saturate(1.05) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.42));
    }

    body.dark-mode .stack-text-fallback {
      color: var(--md-sys-color-primary-container, #eaddff);
    }

    body.dark-mode .stack-label {
      color: var(--md-sys-color-on-surface-variant, #cac4d0);
    }

    @media (prefers-color-scheme: dark) {
      body:not(.light-mode) .stack-item-container {
        background: color-mix(in srgb, var(--md-sys-color-surface-container, #343434) 84%, transparent);
        border-color: rgba(255, 255, 255, 0.14);
      }

      body:not(.light-mode) .stack-icon-surface {
        background: color-mix(in srgb, var(--md-sys-color-surface, #1f1f1f) 74%, var(--md-sys-color-primary-container, #4f378b) 26%);
        border-color: rgba(255, 255, 255, 0.16);
      }

      body:not(.light-mode) .stack-item-container.is-monochrome .stack-image {
        filter: invert(1) brightness(1.14) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
      }
    }
  `;

  document.head.appendChild(style);
}

/**
 * @function getIcon
 * @description Looks up an inline SVG by name and returns it as a base64 Data URI
 *              so it can be used in <img src="...">.
 * @param {string} techName - e.g. 'React', 'NodeJS', 'dotNet'
 * @returns {string|null} - data URI of the inline SVG or null if not found
 */
export function getIcon(techName) {
  const rawSvg = getMappedSvg(techName);
  if (!rawSvg) return null;

  const base64 = btoa(rawSvg);
  return `data:image/svg+xml;base64,${base64}`;
}

function createTextFallback(tech) {
  const compact = tech.replace(/[^A-Za-z0-9+.#]/g, '');
  const letters = compact.length <= 4 ? compact : compact.substring(0, 3);
  const textFallback = document.createElement('span');
  textFallback.textContent = letters.toUpperCase();
  textFallback.classList.add('stack-text-fallback');
  textFallback.setAttribute('aria-label', `${tech} icon fallback`);
  return textFallback;
}

export function renderOneStackIcon(tech) {
  ensureStackIconStyles();

  const normalizedTech = tech.trim();
  const basePath = window.location.hostname.includes('github.io') ?
    '/Personal-Static/' : '/';

  const container = document.createElement('div');
  container.classList.add('stack-item-container');
  container.setAttribute('data-tech', tech);

  const iconShell = document.createElement('span');
  iconShell.classList.add('stack-icon-surface');

  let iconUrl = getIcon(normalizedTech);
  let iconElement;

  if (iconUrl) {
    iconElement = document.createElement('img');
    iconElement.src = iconUrl;
    iconElement.alt = normalizedTech;
    iconElement.classList.add('stack-image');
    container.classList.add('has-inline-svg');
  } else {
    let pngPath = `${basePath}rsc/images/stack/${normalizedTech.toLowerCase()}.png`;
    iconElement = document.createElement('img');
    iconElement.src = pngPath;
    iconElement.alt = normalizedTech;
    iconElement.classList.add('stack-image');
    container.classList.add('has-png-fallback');

    let fallbackAttempted = false;

    iconElement.onerror = () => {
      if (fallbackAttempted) {
        console.warn(`Unable to load icon for ${tech}, using text label instead`);
        const textFallback = createTextFallback(tech);
        container.classList.remove('has-png-fallback');
        container.classList.add('has-text-fallback', 'needs-contrast');

        if (iconShell.contains(iconElement)) {
          iconShell.replaceChild(textFallback, iconElement);
        }
        return;
      }

      fallbackAttempted = true;
      console.warn(`Failed to load stack icon image: ${iconElement.src}`);
      pngPath = `${basePath}rsc/images/stack/${tech}.png`;
      iconElement.src = pngPath;
    };
  }

  if (shouldUseContrastTreatment(normalizedTech, Boolean(iconUrl))) {
    container.classList.add('needs-contrast');
  }

  if (shouldInvertInDarkMode(normalizedTech)) {
    container.classList.add('is-monochrome');
  }

  iconShell.appendChild(iconElement);
  container.appendChild(iconShell);

  const label = document.createElement('span');
  label.textContent = tech;
  label.classList.add('stack-label');
  container.appendChild(label);

  return container;
}

/**
 * Initialize stack filter chips for technology filtering
 */
export function initializeStackFilterChips() {
  const chipContainer = document.getElementById('stackFilterChips');

  if (!chipContainer) {
    console.error('Stack filter chip container not found');
    return;
  }

  chipContainer.innerHTML = '';

  Object.keys(stackSvgMap).sort().forEach(tech => {
    const chip = document.createElement('div');
    chip.className = 'custom-filter-chip';
    chip.textContent = tech;
    chip.dataset.tech = tech;

    chip.addEventListener('click', (e) => {
      chip.classList.toggle('selected');
      e.stopPropagation();
      if (window.applyAllFilters) window.applyAllFilters();
    });

    chipContainer.appendChild(chip);
  });

  const techFilterCard = document.getElementById('techFilterCard');
  const filterTechTrigger = document.getElementById('filterTechTrigger');
  if (techFilterCard && filterTechTrigger) {
    techFilterCard.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    filterTechTrigger.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        techFilterCard.classList.add('visible');
      }
    });
    techFilterCard.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        techFilterCard.classList.add('visible');
      }
    });
    techFilterCard.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768) {
        setTimeout(() => {
          if (!document.querySelector(':hover').closest('#filterTechTrigger')) {
            techFilterCard.classList.remove('visible');
          }
        }, 50);
      }
    });

    filterTechTrigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();
        techFilterCard.classList.toggle('visible');
        if (techFilterCard.classList.contains('visible')) {
          document.addEventListener('click', closeTechCardOnClickOutside, { once: true });
        }
      }
    });
    function closeTechCardOnClickOutside(ev) {
      if (!techFilterCard.contains(ev.target) && ev.target !== filterTechTrigger) {
        techFilterCard.classList.remove('visible');
      }
    }
  }

  console.log(`Created ${Object.keys(stackSvgMap).length} technology filter chips`);
}

document.addEventListener('DOMContentLoaded', () => {
  initializeStackFilterChips();
});
