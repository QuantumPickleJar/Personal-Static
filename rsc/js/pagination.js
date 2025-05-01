import { projectsPerPage } from './perPageSettings.js';
import { renderProjectsGallery, allProjects } from './projects.js';

let currentPage = 1;
let itemsPerPage = projectsPerPage;
let totalPages = 1;
let currentProjects = []; // Store the active projects list

export function initPagination(projects, perPage) {
  // Ensure projects is an array; if it's not, convert it
  currentProjects = Array.isArray(projects) ? projects : Array.from(projects);
  itemsPerPage = perPage || itemsPerPage;
  totalPages = Math.ceil(currentProjects.length / itemsPerPage);
  console.log('Initializing pagination:', { totalPages, itemsPerPage });
  
  // Always reset to page 1 when filters change
  currentPage = 1;
  
  renderPage(currentPage);
  renderPaginationControls();
}

/**
 * Update pagination when filtered project count changes
 * @param {number} projectCount - The number of projects after filtering
 */
export function updatePagination(projectCount) {
  totalPages = Math.ceil(projectCount / itemsPerPage);
  currentPage = 1; // Reset to first page when search results change
  renderPaginationControls();
}

function renderPage(pageNumber) {
  currentPage = pageNumber;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // Use currentProjects instead of allProjects
  renderProjectsGallery(currentProjects.slice(startIndex, Math.min(endIndex, currentProjects.length)));
}

/** Render pagination controls into the container */
function renderPaginationControls() {
  const containerId = window.innerWidth >= 768 ? 'inlinePaginationContainer' : 'paginationContainer';
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear existing controls

  const paginationWrapper = document.createElement('div');
  paginationWrapper.classList.add('pagination-wrapper', 'd-flex', 'justify-content-center'); // Bootstrap classes for layout

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.classList.add('btn', 'btn-outline-secondary', 'me-2'); // Bootstrap button classes
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      renderPage(currentPage - 1);
      renderPaginationControls();
    }
  });
  paginationWrapper.appendChild(prevButton);

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('btn', 'btn-outline-primary', 'mx-1'); // Bootstrap button classes
    if (i === currentPage) {
      pageButton.classList.remove('btn-outline-primary');
      pageButton.classList.add('active', 'btn-primary'); // Highlight active page
    }
    pageButton.addEventListener('click', () => {
      renderPage(i);
      renderPaginationControls();
    });
    paginationWrapper.appendChild(pageButton);
  }

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.classList.add('btn', 'btn-outline-secondary', 'ms-2'); // Bootstrap button classes
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      renderPage(currentPage + 1);
      renderPaginationControls();
    }
  });
  paginationWrapper.appendChild(nextButton);

  container.appendChild(paginationWrapper);
}

export function updateItemsPerPage(newPerPage) {
  itemsPerPage = newPerPage;
  totalPages = Math.ceil(currentProjects.length / itemsPerPage);
  renderPage(1);
  renderPaginationControls();
}

export function renderPerPageDropdown() {
  const howToContainer = document.getElementById('how-to');
  if (window.innerWidth < 768) {
    // On small screens, auto-set projects per page to 4 and hide dropdown
    updateItemsPerPage(4);
    const perPageContainer = document.getElementById('perPageContainer');
    if (perPageContainer) perPageContainer.style.display = 'none';
    return;
  }
  if (howToContainer) {
    const perPageContainer = document.getElementById('perPageContainer') || (() => {
      const div = document.createElement('div');
      div.id = 'perPageContainer';
      howToContainer.appendChild(div);
      return div;
    })();
    perPageContainer.style.display = '';
    const options = generatePerPageOptions();
    perPageContainer.innerHTML = `
      <label for="perPageSelect">Projects per page: </label>
      <select id="perPageSelect">
        ${options}
      </select>
    `;
    const perPageSelect = document.getElementById('perPageSelect');
    perPageSelect.value = projectsPerPage;
    perPageSelect.addEventListener('change', (e) => {
      const newPerPage = parseInt(e.target.value, 10);
      updateItemsPerPage(newPerPage);
    });
  }
}