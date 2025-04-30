// Replace bare import with a global reference
// import * as bootstrap from 'bootstrap';
import { initPagination, updatePagination } from './pagination.js';
import { filterProjByTitle, filterByDate } from './gallery-sorting.js';
import { filterProjectsBySearchTerm } from './search.js';
import { projectsPerPage } from './perPageSettings.js';
import { openProjectModal, loadProjectModal, closeModal } from './project-modal.js';
import { setupModalToggleFABs, initializeFABs } from './project-fab.js';
import { createProjectCard, renderProjectsGallery } from './project-card.js';
import { showImagesInModal, showMermaidDiagramInModal } from './project-image-display.js';

// Use the globally available bootstrap object instead
// This will be available if Bootstrap is included via CDN in your HTML

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
  // Use querySelector for MWC text field
  const searchInput = document.querySelector('md-outlined-text-field#searchBar');
  if (!searchInput) {
    console.warn('Search input not found, skipping search initialization');
    return;
  }
  console.log('Initializing search functionality (MWC)');
  searchInput.addEventListener('input', function(e) {
    applyAllFilters();
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

// Setup filter dropdown and search functionality for plain HTML controls
console.log('[FilterDropdown] Initializing filter dropdown logic');
const searchInput = document.getElementById('searchBar');
if (searchInput) {
  console.log('[FilterDropdown] Search input found');
  searchInput.addEventListener('input', () => {
    console.log('[FilterDropdown] Search input event');
    applyAllFilters();
  });
} else {
  console.warn('[FilterDropdown] Search input NOT found');
}

const filterToggleBtn = document.getElementById('filterToggleBtn');
const filterDropdown = document.getElementById('filterDropdown');
console.log('[FilterDropdown] filterToggleBtn:', filterToggleBtn);
console.log('[FilterDropdown] filterDropdown:', filterDropdown);
if (filterToggleBtn && filterDropdown) {
  filterToggleBtn.addEventListener('click', function(e) {
    console.log('[FilterDropdown] Filter button clicked');
    e.stopPropagation();
    filterDropdown.classList.toggle('show');
    const isExpanded = filterDropdown.classList.contains('show');
    filterToggleBtn.setAttribute('aria-expanded', isExpanded);
    console.log('[FilterDropdown] Dropdown show state:', isExpanded);
    // Debug: force style for visibility
    if (isExpanded) {
      filterDropdown.style.opacity = '1';
      filterDropdown.style.pointerEvents = 'auto';
      filterDropdown.style.background = '#fff';
      filterDropdown.style.zIndex = '9999';
    } else {
      filterDropdown.style.opacity = '';
      filterDropdown.style.pointerEvents = '';
      filterDropdown.style.background = '';
      filterDropdown.style.zIndex = '';
    }
    // Log computed style and rect
    const cs = window.getComputedStyle(filterDropdown);
    console.log('[FilterDropdown] Computed display:', cs.display, 'opacity:', cs.opacity, 'pointerEvents:', cs.pointerEvents);
    console.log('[FilterDropdown] Bounding rect:', filterDropdown.getBoundingClientRect());
  });
  document.addEventListener('click', function(e) {
    if (filterDropdown.classList.contains('show') &&
        !filterDropdown.contains(e.target) &&
        !filterToggleBtn.contains(e.target)) {
      console.log('[FilterDropdown] Click outside, hiding dropdown');
      filterDropdown.classList.remove('show');
      filterToggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
} else {
  if (!filterToggleBtn) console.warn('[FilterDropdown] filterToggleBtn NOT found');
  if (!filterDropdown) console.warn('[FilterDropdown] filterDropdown NOT found');
}

// Checkbox filter listeners
const filterImages = document.getElementById('filterImages');
const filterMermaid = document.getElementById('filterMermaid');
if (filterImages) filterImages.addEventListener('change', () => applyAllFilters());
if (filterMermaid) filterMermaid.addEventListener('change', () => applyAllFilters());

/**
 * Unified filter function: applies search, images, Mermaid, and technology chip filters.
 */
export function applyAllFilters() {
  const searchBar = document.getElementById('searchBar');
  const filterImages = document.getElementById('filterImages');
  const filterMermaid = document.getElementById('filterMermaid');
  
  const searchTerm = searchBar && searchBar.value ? searchBar.value.trim() : '';
  const hasImagesFilter = filterImages && filterImages.checked;
  const hasMermaidFilter = filterMermaid && filterMermaid.checked;

  const selectedTechs = Array.from(
    document.querySelectorAll('.custom-filter-chip.selected')
  ).map(chip => chip.dataset.tech);

  let filtered = [...allProjects];

  if (searchTerm) {
    filtered = filterProjectsBySearchTerm(filtered, searchTerm);
  }
  if (hasImagesFilter) {
    filtered = filtered.filter(p => p.images && p.images.length > 0);
  }
  if (hasMermaidFilter) {
    filtered = filtered.filter(p => p.mermaid && p.mermaid.trim().length > 0);
  }
  if (selectedTechs.length > 0) {
    filtered = filtered.filter(p => Array.isArray(p.stack) &&
      selectedTechs.some(tech => p.stack.some(pt => pt.toLowerCase().includes(tech.toLowerCase())))
    );
  }

  filteredProjects = filtered;
  renderProjectsGallery(filteredProjects);
  if (typeof updatePagination === 'function') {
    updatePagination(filteredProjects.length);
  } else if (typeof initPagination === 'function') {
    initPagination(filteredProjects, projectsPerPage);
  }
}

// Make function globally available
window.applyAllFilters = applyAllFilters;

export { renderProjectsGallery };


