import { projectsPerPage } from './perPageSettings.js';
import { renderProjectsGallery, allProjects } from './projects.js';

let currentPage = 1;
let itemsPerPage = projectsPerPage;
let totalPages = 1;

/** Initialize pagination using the provided projects array and items per page */
export function initPagination(projects, perPage) {
  perPage = perPage || projectsPerPage;
  itemsPerPage = perPage;
  totalPages = Math.ceil(projects.length / itemsPerPage); // Use Math.ceil to ensure all projects are included
  currentPage = 1;
  console.log('Initializing pagination:', { totalPages, itemsPerPage });
  renderPage(currentPage);
  renderPaginationControls();
}

/** Render a specific page of projects */
function renderPage(pageNumber) {
  currentPage = pageNumber;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  console.log('Rendering page:', { pageNumber, startIndex, endIndex });
  // Pass the subset to renderProjectsGallery
  renderProjectsGallery(allProjects.slice(startIndex, Math.min(endIndex, allProjects.length))); // Ensure endIndex doesn't exceed array length
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
  totalPages = Math.ceil(allProjects.length / itemsPerPage);
  renderPage(1);
  renderPaginationControls();
}
