/**
 * filter-menu.js - Custom element for the projects page filter dropdown.
 *
 * The component owns its shadow-DOM styling so the technology submenu stays
 * readable in both site themes. This module also applies two tiny page-level
 * repairs for the legacy projects page: it keeps the projects-per-page select
 * from rendering blank when the computed value is not in the static option list,
 * and it polishes the resume modal close button without changing modal behavior.
 */

const FILTER_MENU_TAG = 'filter-menu';
const PER_PAGE_OPTIONS = [4, 6, 8, 10, 12];

class FilterMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isOpen = false;
    this._hasImages = false;
    this._hasMermaid = false;
    this._techFilters = [];
    this._allTechnologies = [];

    this._render();
    this._setupEventListeners();
  }

  static get observedAttributes() {
    return ['open'];
  }

  get open() {
    return this._isOpen;
  }

  set open(value) {
    this._isOpen = Boolean(value);
    this._updateOpenState();
    this.dispatchEvent(new Event(this._isOpen ? 'filterMenuOpened' : 'filterMenuClosed'));
  }

  get hasImages() {
    return this._hasImages;
  }

  set hasImages(value) {
    const nextValue = Boolean(value);
    if (this._hasImages === nextValue) return;
    this._hasImages = nextValue;
    this._updateFilterState();
    this.dispatchEvent(new CustomEvent('filterChanged', {
      detail: { type: 'hasImages', value: this._hasImages },
    }));
  }

  get hasMermaid() {
    return this._hasMermaid;
  }

  set hasMermaid(value) {
    const nextValue = Boolean(value);
    if (this._hasMermaid === nextValue) return;
    this._hasMermaid = nextValue;
    this._updateFilterState();
    this.dispatchEvent(new CustomEvent('filterChanged', {
      detail: { type: 'hasMermaid', value: this._hasMermaid },
    }));
  }

  get techFilters() {
    return [...this._techFilters];
  }

  setTechFilters(technologies) {
    if (!Array.isArray(technologies)) return;
    this._allTechnologies = [...new Set(technologies.filter(Boolean))].sort((a, b) => a.localeCompare(b));
    this._renderTechChips();
  }

  toggle() {
    this.open = !this.open;
  }

  close() {
    this.open = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open' && oldValue !== newValue) this.open = newValue !== null;
  }

  connectedCallback() {
    if (!document.querySelector('link[href*="material-symbols"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
      document.head.appendChild(link);
    }
  }

  _setupEventListeners() {
    document.addEventListener('click', (event) => {
      if (this._isOpen && !this.contains(event.target)) this.close();
    });

    this.shadowRoot.querySelector('#filterToggleBtn').addEventListener('click', (event) => {
      event.stopPropagation();
      this.toggle();
    });

    this.shadowRoot.querySelector('#filterImages').addEventListener('change', (event) => {
      this.hasImages = event.target.checked;
    });

    this.shadowRoot.querySelector('#filterMermaid').addEventListener('change', (event) => {
      this.hasMermaid = event.target.checked;
    });

    this.shadowRoot.querySelector('#techSearch').addEventListener('input', (event) => {
      this._filterVisibleTechChips(event.target.value);
    });

    this.shadowRoot.querySelector('.filter-dropdown-menu').addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  _toggleTechFilter(chipElement) {
    const tech = chipElement.dataset.tech;
    chipElement.classList.toggle('selected');

    if (chipElement.classList.contains('selected')) {
      if (!this._techFilters.includes(tech)) this._techFilters.push(tech);
    } else {
      this._techFilters = this._techFilters.filter((item) => item !== tech);
    }

    this.dispatchEvent(new CustomEvent('filterChanged', {
      detail: { type: 'techFilters', value: this.techFilters },
    }));
  }

  _renderTechChips() {
    const techContainer = this.shadowRoot.querySelector('#techFilterContent');
    if (!techContainer) return;

    techContainer.innerHTML = '';

    this._allTechnologies.forEach((tech) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'custom-filter-chip';
      chip.dataset.tech = tech;
      chip.textContent = tech;
      chip.setAttribute('aria-pressed', this._techFilters.includes(tech) ? 'true' : 'false');
      if (this._techFilters.includes(tech)) chip.classList.add('selected');
      chip.addEventListener('click', () => {
        this._toggleTechFilter(chip);
        chip.setAttribute('aria-pressed', chip.classList.contains('selected') ? 'true' : 'false');
      });
      techContainer.appendChild(chip);
    });

    const searchInput = this.shadowRoot.querySelector('#techSearch');
    this._filterVisibleTechChips(searchInput?.value || '');
  }

  _filterVisibleTechChips(query) {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    const chips = this.shadowRoot.querySelectorAll('.custom-filter-chip');
    let visibleCount = 0;

    chips.forEach((chip) => {
      const isMatch = !normalizedQuery || chip.dataset.tech.toLowerCase().includes(normalizedQuery);
      chip.hidden = !isMatch;
      if (isMatch) visibleCount += 1;
    });

    const emptyState = this.shadowRoot.querySelector('#techEmptyState');
    if (emptyState) emptyState.hidden = visibleCount !== 0;
  }

  _updateOpenState() {
    const menuContainer = this.shadowRoot.querySelector('.filter-dropdown-menu');
    if (!menuContainer) return;
    menuContainer.classList.toggle('show', this._isOpen);
    this.shadowRoot.querySelector('#filterToggleBtn')?.setAttribute('aria-expanded', String(this._isOpen));
  }

  _updateFilterState() {
    const imgCheckbox = this.shadowRoot.querySelector('#filterImages');
    const mermaidCheckbox = this.shadowRoot.querySelector('#filterMermaid');
    if (imgCheckbox) imgCheckbox.checked = this._hasImages;
    if (mermaidCheckbox) mermaidCheckbox.checked = this._hasMermaid;
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; position: relative; color: var(--md-sys-color-on-surface, #1c1b1f); font-family: inherit; }
        *, *::before, *::after { box-sizing: border-box; }
        #filterToggleBtn { width: 40px; height: 40px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border: 1px solid transparent; border-radius: 999px; background: transparent; color: var(--md-sys-color-on-surface, #1c1b1f); cursor: pointer; transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease; }
        #filterToggleBtn:hover, #filterToggleBtn:focus-visible { background: rgba(103, 80, 164, 0.10); border-color: rgba(103, 80, 164, 0.20); outline: none; }
        .material-symbols-outlined { font-family: 'Material Symbols Outlined'; font-weight: normal; font-style: normal; font-size: 28px; line-height: 1; letter-spacing: normal; text-transform: none; display: inline-block; white-space: nowrap; direction: ltr; -webkit-font-feature-settings: 'liga'; -webkit-font-smoothing: antialiased; }
        .filter-dropdown-menu { position: absolute; top: 100%; left: 0; z-index: 1500; width: 240px; margin-top: 8px; padding: 0; display: block; opacity: 0; pointer-events: none; transform: translateY(-10px); transition: opacity 0.2s ease, transform 0.2s ease; overflow: visible; border: 1px solid rgba(103, 80, 164, 0.16); border-radius: 14px; background: var(--md-sys-color-surface, #ffffff); color: var(--md-sys-color-on-surface, #1c1b1f); box-shadow: 0 12px 28px rgba(31, 22, 59, 0.16); }
        .filter-dropdown-menu.show { opacity: 1; pointer-events: auto; transform: translateY(0); }
        .filter-menu-header, .tech-filter-header { padding: 12px 16px; font-weight: 650; border-bottom: 1px solid rgba(103, 80, 164, 0.14); background: rgba(103, 80, 164, 0.07); color: var(--md-sys-color-on-surface, #1c1b1f); }
        .filter-menu-item { padding: 10px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; color: inherit; transition: background-color 0.16s ease; }
        .filter-menu-item:hover { background: rgba(103, 80, 164, 0.085); }
        .filter-menu-item input[type="checkbox"] { width: 14px; height: 14px; accent-color: var(--md-sys-color-primary, #6750a4); }
        .filter-menu-divider { height: 1px; background: rgba(103, 80, 164, 0.14); margin: 4px 0; }
        .filter-tech-trigger { position: relative; justify-content: space-between; }
        .tech-filter-card { position: absolute; left: 100%; top: 0; margin-left: 8px; width: min(330px, calc(100vw - 2rem)); max-height: 360px; display: none; flex-direction: column; z-index: 1600; overflow: hidden; border: 1px solid rgba(103, 80, 164, 0.16); border-radius: 14px; background: var(--md-sys-color-surface, #ffffff); color: var(--md-sys-color-on-surface, #1c1b1f); box-shadow: 0 12px 28px rgba(31, 22, 59, 0.18); }
        .filter-tech-trigger:hover .tech-filter-card, .filter-tech-trigger:focus-within .tech-filter-card, .tech-filter-card:hover { display: flex; }
        .tech-filter-title { display: block; margin-bottom: 8px; font-size: 0.82rem; letter-spacing: 0.02em; text-transform: uppercase; color: var(--md-sys-color-on-surface-variant, #49454f); }
        .tech-search-input { width: 100%; min-height: 38px; padding: 8px 10px; border: 1px solid rgba(103, 80, 164, 0.24); border-radius: 10px; background: var(--md-sys-color-surface, #ffffff); color: var(--md-sys-color-on-surface, #1c1b1f); font: inherit; outline: none; }
        .tech-search-input::placeholder { color: var(--md-sys-color-on-surface-variant, #6f6878); }
        .tech-search-input:focus { border-color: var(--md-sys-color-primary, #6750a4); box-shadow: 0 0 0 3px rgba(103, 80, 164, 0.14); }
        .tech-filter-content { padding: 10px; overflow-y: auto; max-height: 245px; display: flex; flex-wrap: wrap; align-content: flex-start; gap: 7px; background: transparent; }
        .custom-filter-chip { display: inline-flex; align-items: center; border: 1px solid rgba(103, 80, 164, 0.14); border-radius: 999px; padding: 5px 10px; font-size: 12px; font-weight: 550; background: rgba(103, 80, 164, 0.08); color: var(--md-sys-color-on-surface, #1c1b1f); cursor: pointer; transition: background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease; user-select: none; white-space: nowrap; }
        .custom-filter-chip:hover { background: rgba(103, 80, 164, 0.13); }
        .custom-filter-chip.selected { background: var(--md-sys-color-primary-container, #eaddff); color: var(--md-sys-color-on-primary-container, #21005d); border-color: rgba(103, 80, 164, 0.34); }
        .custom-filter-chip.selected::before { content: '✓'; margin-right: 4px; font-size: 10px; }
        .tech-empty-state { width: 100%; padding: 12px; color: var(--md-sys-color-on-surface-variant, #6f6878); font-size: 0.84rem; text-align: center; }
        :host-context(body.dark-mode) { color: var(--md-sys-color-on-surface, #e6e0e9); }
        :host-context(body.dark-mode) #filterToggleBtn { color: var(--md-sys-color-on-surface, #e6e0e9); }
        :host-context(body.dark-mode) .filter-dropdown-menu, :host-context(body.dark-mode) .tech-filter-card { background: var(--md-sys-color-surface-container-high, #2b2930); color: var(--md-sys-color-on-surface, #e6e0e9); border-color: rgba(208, 188, 255, 0.18); box-shadow: 0 16px 30px rgba(0, 0, 0, 0.34); }
        :host-context(body.dark-mode) .filter-menu-header, :host-context(body.dark-mode) .tech-filter-header { background: rgba(208, 188, 255, 0.10); color: rgba(245, 241, 255, 0.94); border-bottom-color: rgba(208, 188, 255, 0.16); }
        :host-context(body.dark-mode) .filter-menu-item:hover, :host-context(body.dark-mode) #filterToggleBtn:hover, :host-context(body.dark-mode) #filterToggleBtn:focus-visible { background: rgba(208, 188, 255, 0.12); border-color: rgba(208, 188, 255, 0.20); }
        :host-context(body.dark-mode) .tech-search-input { background: rgba(255, 255, 255, 0.065); color: rgba(245, 241, 255, 0.94); border-color: rgba(208, 188, 255, 0.22); }
        :host-context(body.dark-mode) .tech-search-input::placeholder, :host-context(body.dark-mode) .tech-filter-title, :host-context(body.dark-mode) .tech-empty-state { color: rgba(245, 241, 255, 0.66); }
        :host-context(body.dark-mode) .custom-filter-chip { background: rgba(208, 188, 255, 0.10); color: rgba(245, 241, 255, 0.88); border-color: rgba(208, 188, 255, 0.18); }
        :host-context(body.dark-mode) .custom-filter-chip:hover { background: rgba(208, 188, 255, 0.16); }
        :host-context(body.dark-mode) .custom-filter-chip.selected { background: rgba(208, 188, 255, 0.24); color: #f5f1ff; border-color: rgba(208, 188, 255, 0.38); }
        @media (max-width: 768px) { .filter-dropdown-menu { right: 0; left: auto; width: min(280px, calc(100vw - 2rem)); } .tech-filter-card { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%); margin-left: 0; width: min(92vw, 360px); } }
      </style>
      <button id="filterToggleBtn" type="button" aria-label="Filter Options" aria-expanded="false"><span class="material-symbols-outlined" aria-hidden="true">filter_list</span></button>
      <div class="filter-dropdown-menu" role="menu" aria-label="Project filter options">
        <div class="filter-menu-header">Filter Options</div>
        <label class="filter-menu-item"><input type="checkbox" id="filterImages" /><span>Has Images</span></label>
        <label class="filter-menu-item"><input type="checkbox" id="filterMermaid" /><span>Has Mermaid</span></label>
        <div class="filter-menu-divider"></div>
        <div class="filter-menu-item filter-tech-trigger" tabindex="0">
          <span>Filter by Technology</span><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span>
          <div class="tech-filter-card" aria-label="Technology filters">
            <div class="tech-filter-header"><label><span class="tech-filter-title">Technologies</span><input id="techSearch" class="tech-search-input" type="search" placeholder="Search technologies" autocomplete="off" /></label></div>
            <div id="techFilterContent" class="tech-filter-content"></div>
            <div id="techEmptyState" class="tech-empty-state" hidden>No matching technologies</div>
          </div>
        </div>
      </div>
    `;
  }
}

function injectResumeModalPolish() {
  if (document.getElementById('resume-modal-polish-styles')) return;
  const style = document.createElement('style');
  style.id = 'resume-modal-polish-styles';
  style.textContent = `
    #pdfModal .modal-content { background: var(--md-sys-color-surface, #ffffff) !important; color: var(--md-sys-color-on-surface, #1c1b1f) !important; border: 1px solid rgba(103, 80, 164, 0.18) !important; box-shadow: 0 20px 48px rgba(31, 22, 59, 0.22) !important; }
    #pdfModal .close-button { position: absolute; top: 14px; right: 14px; width: 2.25rem !important; height: 2.25rem !important; min-width: 2.25rem !important; aspect-ratio: 1 / 1; padding: 0 !important; display: inline-flex !important; align-items: center; justify-content: center; border: 1px solid rgba(103, 80, 164, 0.18) !important; border-radius: 999px !important; background: rgba(103, 80, 164, 0.08) !important; color: var(--md-sys-color-on-surface, #1c1b1f) !important; font-size: 1.45rem !important; line-height: 1 !important; text-decoration: none !important; cursor: pointer; box-shadow: none !important; transition: background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease; }
    #pdfModal .close-button:hover, #pdfModal .close-button:focus-visible { background: rgba(103, 80, 164, 0.14) !important; border-color: rgba(103, 80, 164, 0.28) !important; transform: translateY(-1px); outline: none; }
    #resumePdfFrame { border: 1px solid rgba(103, 80, 164, 0.14) !important; border-radius: 12px !important; background: var(--md-sys-color-surface, #ffffff) !important; }
    body.dark-mode #pdfModal .modal-content { background: var(--md-sys-color-surface-container, #1d1b20) !important; color: var(--md-sys-color-on-surface, #e6e0e9) !important; border-color: rgba(208, 188, 255, 0.18) !important; box-shadow: 0 22px 54px rgba(0, 0, 0, 0.46) !important; }
    body.dark-mode #pdfModal .close-button { background: rgba(208, 188, 255, 0.10) !important; color: rgba(245, 241, 255, 0.94) !important; border-color: rgba(208, 188, 255, 0.20) !important; }
    body.dark-mode #pdfModal .close-button:hover, body.dark-mode #pdfModal .close-button:focus-visible { background: rgba(208, 188, 255, 0.16) !important; border-color: rgba(208, 188, 255, 0.32) !important; }
  `;
  document.head.appendChild(style);
}

function repairProjectsPerPageSelect() {
  const container = document.getElementById('perPageContainer');
  if (!container) return;

  let select = container.querySelector('#perPageSelect');
  if (!select) {
    container.innerHTML = `<label for="perPageSelect">Projects per page: </label><select id="perPageSelect"></select>`;
    select = container.querySelector('#perPageSelect');
  }

  const currentValue = Number(select.value) || Number(select.dataset.lastValidValue) || 4;
  const options = [...new Set([...PER_PAGE_OPTIONS, currentValue])].filter(Number.isFinite).sort((a, b) => a - b);
  const optionSignature = options.join(',');

  if (select.dataset.optionSignature !== optionSignature) {
    select.innerHTML = options.map((option) => `<option value="${option}">${option}</option>`).join('');
    select.dataset.optionSignature = optionSignature;
  }

  select.value = options.includes(currentValue) ? String(currentValue) : String(options[0]);
  select.dataset.lastValidValue = select.value;

  if (!select.dataset.repairListenerAttached) {
    select.dataset.repairListenerAttached = 'true';
    select.addEventListener('change', async (event) => {
      event.target.dataset.lastValidValue = event.target.value;
      try {
        const { updateItemsPerPage } = await import('./pagination.js');
        updateItemsPerPage(Number(event.target.value));
      } catch (error) {
        console.warn('Unable to update projects per page from repair helper:', error);
      }
    });
  }
}

function installProjectsPerPageRepair() {
  let attempts = 0;
  const maxAttempts = 25;
  const runRepair = () => {
    attempts += 1;
    repairProjectsPerPageSelect();
    if (attempts >= maxAttempts || document.querySelector('#perPageSelect option')) {
      window.clearInterval(intervalId);
    }
  };

  const intervalId = window.setInterval(runRepair, 160);
  runRepair();
}

function installPageFixes() {
  injectResumeModalPolish();
  installProjectsPerPageRepair();
}

if (!customElements.get(FILTER_MENU_TAG)) customElements.define(FILTER_MENU_TAG, FilterMenu);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installPageFixes, { once: true });
} else {
  installPageFixes();
}

export default FilterMenu;
