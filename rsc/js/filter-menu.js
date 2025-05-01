/**
 * filter-menu.js - Custom element for Material Design filter dropdown menu
 * 
 * This creates a <filter-menu> custom element that implements a Material Design 3
 * styled dropdown menu for filtering options on the projects page.
 */

class FilterMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._isOpen = false;
    this._hasImages = false;
    this._hasMermaid = false;
    this._techFilters = [];
    
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
    if (this._isOpen) {
      this.dispatchEvent(new Event('filterMenuOpened'));
    } else {
      this.dispatchEvent(new Event('filterMenuClosed'));
    }
  }
  
  get hasImages() {
    return this._hasImages;
  }
  
  set hasImages(value) {
    if (this._hasImages !== value) {
      this._hasImages = Boolean(value);
      this._updateFilterState();
      
      const detail = { type: 'hasImages', value: this._hasImages };
      this.dispatchEvent(new CustomEvent('filterChanged', { detail }));
    }
  }
  
  get hasMermaid() {
    return this._hasMermaid;
  }
  
  set hasMermaid(value) {
    if (this._hasMermaid !== value) {
      this._hasMermaid = Boolean(value);
      this._updateFilterState();
      
      const detail = { type: 'hasMermaid', value: this._hasMermaid };
      this.dispatchEvent(new CustomEvent('filterChanged', { detail }));
    }
  }
  
  get techFilters() {
    return [...this._techFilters];
  }
  
  setTechFilters(technologies) {
    if (!Array.isArray(technologies) || !technologies.length) return;
    
    const techContainer = this.shadowRoot.querySelector('#techFilterContent');
    if (!techContainer) return;
    
    // Clear existing chips
    techContainer.innerHTML = '';
    
    // Add tech filter chips
    technologies.forEach(tech => {
      const chip = document.createElement('div');
      chip.className = 'custom-filter-chip';
      chip.dataset.tech = tech;
      chip.textContent = tech;
      chip.addEventListener('click', () => this._toggleTechFilter(chip));
      techContainer.appendChild(chip);
    });
  }
  
  _toggleTechFilter(chipElement) {
    const tech = chipElement.dataset.tech;
    chipElement.classList.toggle('selected');
    
    if (chipElement.classList.contains('selected')) {
      if (!this._techFilters.includes(tech)) {
        this._techFilters.push(tech);
      }
    } else {
      this._techFilters = this._techFilters.filter(t => t !== tech);
    }
    
    const detail = { type: 'techFilters', value: this._techFilters };
    this.dispatchEvent(new CustomEvent('filterChanged', { detail }));
  }
  
  _updateOpenState() {
    const menuContainer = this.shadowRoot.querySelector('.filter-dropdown-menu');
    if (menuContainer) {
      if (this._isOpen) {
        menuContainer.classList.add('show');
      } else {
        menuContainer.classList.remove('show');
      }
    }
  }
  
  _updateFilterState() {
    const imgCheckbox = this.shadowRoot.querySelector('#filterImages');
    const mermaidCheckbox = this.shadowRoot.querySelector('#filterMermaid');
    
    if (imgCheckbox) imgCheckbox.checked = this._hasImages;
    if (mermaidCheckbox) mermaidCheckbox.checked = this._hasMermaid;
  }
  
  toggle() {
    this.open = !this.open;
  }
  
  close() {
    this.open = false;
  }
  
  _setupEventListeners() {
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (this._isOpen && !this.contains(e.target)) {
        this.close();
      }
    });
    
    // Button click listener
    this.shadowRoot.querySelector('#filterToggleBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    
    // Checkbox listeners
    this.shadowRoot.querySelector('#filterImages').addEventListener('change', (e) => {
      this.hasImages = e.target.checked;
    });
    
    this.shadowRoot.querySelector('#filterMermaid').addEventListener('change', (e) => {
      this.hasMermaid = e.target.checked;
    });
    
    // Stop propagation on menu clicks to prevent auto-closing
    this.shadowRoot.querySelector('.filter-dropdown-menu').addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }
        
        /* Button styles */
        #filterToggleBtn {
          min-width: 40px;
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        
        /* Icon styles */
        .material-symbols-outlined {
          font-family: 'Material Symbols Outlined';
          font-weight: normal;
          font-style: normal;
          font-size: 28px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          word-wrap: normal;
          direction: ltr;
          -webkit-font-feature-settings: 'liga';
          -webkit-font-smoothing: antialiased;
        }
        
        /* Dropdown menu styles */
        .filter-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 1500;
          width: 240px;
          margin-top: 8px;
          padding: 0;
          background-color: var(--md-sys-color-surface, #ffffff);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: block;
          opacity: 0;
          pointer-events: none;
          transform: translateY(-10px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .filter-dropdown-menu.show {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }
        
        .filter-menu-header {
          padding: 12px 16px;
          font-weight: 500;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        .filter-menu-item {
          padding: 8px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        
        .filter-menu-item:hover {
          background-color: rgba(0, 0, 0, 0.04);
        }
        
        .filter-menu-item input {
          margin-right: 8px;
        }
        
        .filter-menu-divider {
          height: 1px;
          background-color: rgba(0, 0, 0, 0.08);
          margin: 4px 0;
        }
        
        /* Tech filter trigger and submenu */
        .filter-tech-trigger {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .tech-filter-card {
          position: absolute;
          left: 100%;
          top: 0;
          margin-left: 2px;
          width: 280px;
          max-height: 350px;
          background-color: var(--md-sys-color-surface, #ffffff);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          z-index: 1600;
          overflow: hidden;
        }
        
        .tech-filter-header {
          padding: 12px 16px;
          font-weight: 500;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          background-color: #f5f5f5;
        }
        
        .tech-filter-content {
          padding: 8px;
          overflow-y: auto;
          max-height: 250px;
          display: flex;
          flex-wrap: wrap;
          align-content: flex-start;
          gap: 6px;
        }
        
        /* Show tech filter on hover */
        .filter-tech-trigger:hover .tech-filter-card,
        .tech-filter-card:hover {
          display: flex;
        }
        
        /* Custom filter chip styles */
        .custom-filter-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          background-color: #e0e0e0;
          color: #333;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        
        .custom-filter-chip:hover {
          background-color: #d0d0d0;
        }
        
        .custom-filter-chip.selected {
          background-color: var(--md-sys-color-primary-container, #e8def8);
          color: var(--md-sys-color-on-primary-container, #1d192b);
          border-color: var(--md-sys-color-primary, #6750a4);
        }
        
        .custom-filter-chip.selected::before {
          content: '✓';
          margin-right: 4px;
          font-size: 10px;
        }
        
        @media (max-width: 768px) {
          .filter-dropdown-menu {
            width: 100%;
            min-width: 200px;
            left: auto !important;
            right: 0 !important;
          }
          
          .tech-filter-card {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            margin-left: 0;
            width: 90%;
            max-width: 350px;
          }
        }
      </style>
      
      <button id="filterToggleBtn" aria-label="Filter Options">
        <span class="material-symbols-outlined">filter_list</span>
      </button>
      
      <div class="filter-dropdown-menu">
        <div class="filter-menu-header">Filter Options</div>
        <div class="filter-menu-item">
          <input type="checkbox" id="filterImages" /> <label for="filterImages">Has Images</label>
        </div>
        <div class="filter-menu-item">
          <input type="checkbox" id="filterMermaid" /> <label for="filterMermaid">Has Mermaid</label>
        </div>
        <div class="filter-menu-divider"></div>
        <div class="filter-menu-item filter-tech-trigger">
          <span>Filter by Technology</span>
          <span class="material-symbols-outlined">chevron_right</span>
          <!-- Tech filter submenu -->
          <div class="tech-filter-card">
            <div class="tech-filter-header">Technologies</div>
            <div id="techFilterContent" class="tech-filter-content"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') {
      this.open = newValue !== null;
    }
  }
  
  connectedCallback() {
    if (!document.querySelector('link[href*="material-symbols"]')) {
      // Add Material Icons font if not already loaded
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
      document.head.appendChild(link);
    }
  }
}

// Register the custom element
customElements.define('filter-menu', FilterMenu);

export default FilterMenu;