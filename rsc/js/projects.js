import * as bootstrap from 'bootstrap';
import { initPagination, updatePagination } from './pagination.js';
import { filterProjByTitle, filterByDate } from './gallery-sorting.js';
import { filterProjectsBySearchTerm } from './search.js';
import { projectsPerPage } from './perPageSettings.js';
import { openProjectModal, loadProjectModal } from './project-modal.js';
import { setupModalToggleFABs, initializeFABs } from './project-fab.js';
import { createProjectCard, renderProjectsGallery } from './project-card.js';
import { showImagesInModal, showMermaidDiagramInModal } from './project-image-display.js';

export let allProjects = [];
let filteredProjects = []; // Store filtered projects for pagination
const MAX_STACK_CHARS = 20;

document.addEventListener('DOMContentLoaded', function () {
  if (document.getElementById('projectsGallery')) {
    console.log('Projects gallery found, initializing projects');
    initializeProjects();
    initializeSearchFunctionality(); // Initialize search functionality

    // Load project modal first to ensure it's available
    loadProjectModal().then(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const projectToShow = urlParams.get('showProject');
      
      if (projectToShow) {
        console.log(`URL parameter showProject found: ${projectToShow}`);
        // Wait for projects to load
        setTimeout(() => {
          loadProjects().then(projects => {
            const project = projects.find(p => 
              p.id === projectToShow || 
              (p.title && p.title.replace(/\s+/g, '-').toLowerCase() === projectToShow)
            );
            
            if (project) {
              console.log(`Opening modal for project: ${project.title}`);
              openProjectModal(project, projects);
            } else {
              console.error(`Project with ID "${projectToShow}" not found.`);
            }
          });
        }, 300);
      }
    });
  } else {
    console.log('No projects gallery found, skipping initialization');
  }

  debugMaterialMenu();
});

/**
 * Initialize search functionality by connecting the search input to the search.js module
 */
function initializeSearchFunctionality() {
  const searchInput = document.getElementById('searchBar');
  if (!searchInput) {
    console.warn('Search input not found, skipping search initialization');
    return;
  }
  
  console.log('Initializing search functionality');
  
  searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.trim();
    console.log('Search term:', searchTerm);
    
    // Filter projects based on search term
    filteredProjects = filterProjectsBySearchTerm(allProjects, searchTerm);
    
    // Re-render the gallery with filtered projects
    renderProjectsGallery(filteredProjects);
    
    // If pagination is initialized, update it
    if (typeof updatePagination === 'function') {
      updatePagination(filteredProjects.length);
    }
    
    console.log(`Search results: ${filteredProjects.length} projects found`);
  });
  
  console.log('Search functionality initialized');
}

export function loadProjects() {
  console.log('Loading projects...');
  const basePath = window.location.hostname.includes('github.io') ? '/Personal-Static/' : '/';
  const pathsToTry = [
    `${basePath}rsc/json/projects.json`,
    './rsc/json/projects.json',
    '/rsc/json/projects.json',
    'rsc/json/projects.json',
  ];

  return tryFetchPaths(pathsToTry)
    .then((data) => {
      console.log(`Projects data received: ${data.length} items`);
      allProjects = data;
      return data;
    })
    .catch((error) => {
      console.error('Project loading error:', error);
      const gallery = document.getElementById('projectsGallery');
      if (gallery) {
        gallery.innerHTML = `<div class="error">Failed to load projects: ${error.message}</div>`;
      }
      return [];
    });
}

async function tryFetchPaths(paths) {
  for (const path of paths) {
    try {
      console.log(`Trying to fetch from: ${path}`);
      const response = await fetch(path);
      if (response.ok) {
        console.log(`Successfully loaded from: ${path}`);
        return response.json();
      }
    } catch (e) {
      console.log(`Failed attempt with path: ${path}`);
    }
  }
  throw new Error('All paths failed');
}

function initializeProjects() {
  loadTemplates()
    .then(() => loadProjects())
    .then(renderProjectsGallery)
    .then(() => console.log('Projects loaded and rendered'))
    .catch((error) => console.error('Failed to initialize projects:', error));

  const closeModalButton = document.getElementById('closeModal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
  }

  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}

function loadTemplates() {
  const basePath = window.location.hostname.includes('github.io') ? '/Personal-Static/' : '/';
  const templatesNeeded = [
    { path: `${basePath}htmlModules/project-card.html`, id: 'templateContainer-projectCard' },
    { path: `${basePath}htmlModules/stack-item-template.html`, id: 'templateContainer-stackItems' },
  ];

  const promises = templatesNeeded.map((template) =>
    fetch(template.path)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load template: ${template.path}`);
        return response.text();
      })
      .then((html) => {
        const container = document.createElement('div');
        container.id = template.id;
        container.style.display = 'none';
        container.innerHTML = html;
        document.body.appendChild(container);
        console.log(`Loaded template: ${template.path}`);
      })
  );

  return Promise.all(promises);
}

/**
 * Debug Material 3 Web Components registration and state.
 */
export function debugMaterialMenu() {
  const filterMenu = document.getElementById('projectFilterMenu');
  const filterToggleBtn = document.getElementById('filterToggleBtn');

  console.group('Material 3 Menu Debug');
  if (!filterMenu) {
    console.error('No #projectFilterMenu element found.');
  } else {
    console.log('projectFilterMenu tagName:', filterMenu.tagName);
    console.log('Is custom element:', customElements.get('md-menu') ? 'YES' : 'NO');
    console.log('Instance of HTMLElement:', filterMenu instanceof HTMLElement);
    console.log('Instance of custom element:', filterMenu instanceof (customElements.get('md-menu') || HTMLElement));
    console.log('filterMenu.open property:', typeof filterMenu.open);
    console.log('filterMenu.anchor attribute:', filterMenu.getAttribute('anchor'));
    console.log('filterMenu.open value:', filterMenu.open);
    console.log('filterMenu methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(filterMenu)));
  }
  if (!filterToggleBtn) {
    console.error('No #filterToggleBtn element found.');
  } else {
    console.log('filterToggleBtn tagName:', filterToggleBtn.tagName);
  }
  console.groupEnd();
}

// New Material3 Menu Initializer and Debugger for Jekyll environment
export function initializeMaterialMenu() {
  console.log('Manual Material 3 initialization starting...');
  
  // Get the elements
  const filterMenu = document.getElementById('projectFilterMenu');
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const anchorElement = document.getElementById('filterMenuAnchor');
  
  if (!filterMenu || !filterToggleBtn) {
    console.error('Required menu elements not found in DOM');
    return;
  }
  
  console.log('Setting up manual Material3 menu implementation');
  
  // Add a class for CSS styling
  filterMenu.classList.add('md-menu-custom');
  
  // Hide the menu initially
  filterMenu.style.position = 'absolute';
  filterMenu.style.zIndex = '1000';
  filterMenu.style.backgroundColor = 'var(--md-sys-color-surface, #fff)';
  filterMenu.style.borderRadius = '4px';
  filterMenu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  filterMenu.style.overflow = 'hidden';
  filterMenu.style.display = 'none';
  
  // Create a custom open property
  let isMenuOpen = false;
  Object.defineProperty(filterMenu, 'open', {
    get: function() { return isMenuOpen; },
    set: function(value) {
      isMenuOpen = value;
      if (value) {
        showMenu();
      } else {
        hideMenu();
      }
    }
  });
  
  // Position the menu relative to the anchor
  function positionMenu() {
    if (!anchorElement) return;
    
    const anchorRect = anchorElement.getBoundingClientRect();
    filterMenu.style.top = `${anchorRect.bottom + window.scrollY}px`;
    filterMenu.style.left = `${anchorRect.left + window.scrollX}px`;
    filterMenu.style.minWidth = `${anchorRect.width}px`;
  }
  
  // Show menu function
  function showMenu() {
    positionMenu();
    filterMenu.style.display = 'block';
    console.log('Menu shown');
    
    // Add a click outside listener
    setTimeout(() => {
      document.addEventListener('click', outsideClickHandler);
    }, 10);
  }
  
  // Hide menu function
  function hideMenu() {
    filterMenu.style.display = 'none';
    console.log('Menu hidden');
    document.removeEventListener('click', outsideClickHandler);
  }
  
  // Click outside to close
  function outsideClickHandler(e) {
    if (!filterMenu.contains(e.target) && e.target !== filterToggleBtn) {
      filterMenu.open = false;
    }
  }
  
  // Toggle button click handler
  filterToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Filter toggle button clicked');
    filterMenu.open = !filterMenu.open;
  });
  
  // Add click event to menu items
  const menuItems = filterMenu.querySelectorAll('md-menu-item');
  menuItems.forEach(item => {
    if (item.getAttribute('type') === 'checkbox') {
      item.selected = false;
      
      // Add a class for styling
      item.classList.add('md-menu-item-custom');
      
      // Override the selected property
      Object.defineProperty(item, 'selected', {
        get: function() { 
          return this.hasAttribute('selected'); 
        },
        set: function(value) {
          if (value) {
            this.setAttribute('selected', '');
            this.classList.add('selected');
          } else {
            this.removeAttribute('selected');
            this.classList.remove('selected');
          }
        }
      });
      
      // Setup click handler
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        item.selected = !item.selected;
        console.log(`${item.id} clicked, selected:`, item.selected);
        // Dispatch a change event that your filter logic can listen for
        item.dispatchEvent(new CustomEvent('change'));
      });
    }
  });
  
  console.log('Manual Material 3 menu initialization complete');
  
  // Add some basic styles
  const style = document.createElement('style');
  style.textContent = `
    .md-menu-custom {
      transition: opacity 0.2s, transform 0.2s;
    }
    .md-menu-item-custom {
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    .md-menu-item-custom:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    .md-menu-item-custom.selected::before {
      content: '✓';
      margin-right: 8px;
    }
  `;
  document.head.appendChild(style);
  
  return {
    menu: filterMenu,
    button: filterToggleBtn,
    open: () => { filterMenu.open = true; },
    close: () => { filterMenu.open = false; },
    toggle: () => { filterMenu.open = !filterMenu.open; }
  };
}

// Call this at the top-level (not inside DOMContentLoaded)
debugMaterialRegistration();

/**
 * Debug Material Web Components registration.
 * This runs outside of DOMContentLoaded to catch when components are registered
 */
export function debugMaterialRegistration() {
  // Check if the script is loaded
  const scripts = Array.from(document.scripts).map(s => s.src || s.type);
  console.log('Loaded scripts:', scripts);

  // Check registration timing
  if (customElements.get('md-menu')) {
    console.log('md-menu custom element is registered at', new Date().toISOString());
  } else {
    console.warn('md-menu custom element is NOT registered at', new Date().toISOString());
    // Try again after a delay
    setTimeout(debugMaterialRegistration, 1000);
  }
}

// Check if Material components are defined after a reasonable delay
setTimeout(() => {
  const materialComponentsRegistered = !!customElements.get('md-menu');
  
  if (!materialComponentsRegistered) {
    console.warn('Material components still not registered after 2s, initializing polyfill');
    
    // Add this to DOMContentLoaded to ensure elements exist
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize our manual implementation
      const menuController = initializeMaterialMenu();
      
      // Set up event listeners for filtering
      const filterImages = document.getElementById('filterImages');
      const filterMermaid = document.getElementById('filterMermaid');
      
      if (filterImages) {
        filterImages.addEventListener('change', applyFilters);
      }
      
      if (filterMermaid) {
        filterMermaid.addEventListener('change', applyFilters);
      }
      
      function applyFilters() {
        const hasImagesFilter = filterImages?.selected || false;
        const hasMermaidFilter = filterMermaid?.selected || false;
        
        console.log('Applying filters:', { hasImagesFilter, hasMermaidFilter });
        
        // Get all project cards
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
          let showCard = true;
          
          // Check image filter
          if (hasImagesFilter) {
            const hasImages = card.querySelector('.image-count-icon')?.style.display !== 'none';
            if (!hasImages) showCard = false;
          }
          
          // Check mermaid filter
          if (hasMermaidFilter && showCard) {
            const hasMermaid = card.querySelector('.mermaid-icon')?.style.display !== 'none';
            if (!hasMermaid) showCard = false;
          }
          
          // Show or hide the card
          card.style.display = showCard ? '' : 'none';
        });
      }
    });
  }
}, 2000);

export { renderProjectsGallery };


