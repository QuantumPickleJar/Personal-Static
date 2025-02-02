import { renderProjectsGallery, allProjects } from './projects.js';

let currentPage = 1;
let itemsPerPage = 6; // adjust as needed
let totalPages = 1;

/** Initialize pagination using the provided projects array and items per page */
export function initPagination(projects, perPage) {
  itemsPerPage = perPage;
  totalPages = Math.ceil(projects.length / itemsPerPage);
  currentPage = 1;
  console.log('Initializing pagination:', { totalPages, itemsPerPage }); // Debug log
  renderPage(currentPage);
  renderPaginationControls();
}

/** Render a specific page of projects */
function renderPage(pageNumber) {
  currentPage = pageNumber;
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  console.log('Rendering page:', { pageNumber, startIndex, endIndex }); // Debug log
  // Pass the subset to renderProjectsGallery (defined in main.js)
  renderProjectsGallery(allProjects.slice(startIndex, endIndex));
}

/** Render pagination controls into the container with id "paginationContainer" */
function renderPaginationControls() {
  const container = document.getElementById('paginationContainer');
  container.innerHTML = ''; // Clear existing controls

  // Pagination bar with Previous, Page Numbers, and Next
  const paginationWrapper = document.createElement('div');
  paginationWrapper.classList.add('pagination-wrapper');

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) renderPage(currentPage - 1);
    renderPaginationControls();
  });
  paginationWrapper.appendChild(prevButton);

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.classList.add('active-page');
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
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) renderPage(currentPage + 1);
    renderPaginationControls();
  });
  paginationWrapper.appendChild(nextButton);

  container.appendChild(paginationWrapper);
}
