/**
 * Contains functions that `projects.js` uses to change the sorting 
 * behavior of projects in the gallery, as well as some additinal 
 * search functions. 
 */
import { allProjects } from './projects.js';
import { projectsPerPage } from './perPageSettings.js';
import { initPagination } from './pagination.js';
import { renderProjectsGallery } from './projects.js';
import { applyPagination } from './perPageSettings.js';

// set to true when sorting by:
// Z-A
// Date of project end
let isAscending = false;

export function filterProjByTitle() {
  const sortedProjects = [...allProjects].sort((a, b) =>
    isAscending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
  );
  // Only initialize pagination, which handles rendering
  initPagination(sortedProjects, projectsPerPage);
}


/**
 * @todo implement datetime parsing on projects before usage
 */
export function filterByDate() {
  const sortedProjects = [...allProjects].sort((a, b) => {
    const dateA = new Date(a.dates.split(' to ')[1] || a.dates);
    const dateB = new Date(b.dates.split(' to ')[1] || b.dates);
    return isAscending ? dateA - dateB : dateB - dateA;
  });
  // Update pagination settings from localStorage before initializing pagination
  applyPagination();
  // Now initialize pagination, which internally handles rendering the correct page
  initPagination(sortedProjects, projectsPerPage);
}



/**
 * Creates a <span> with truncated text (100 chars by default).
 * If truncated, the full text is placed in a system tooltip (title attribute).
 * @param {string} text - The original text to potentially truncate.
 * @param {number} [limit=100] - Max characters to display before truncating.
 * @returns {HTMLSpanElement}
 */
export function createTruncatedSpan(text, limit = 100) {
  const span = document.createElement('span');
  if (!text) {
    span.textContent = ''; // or "N/A"
    return span;
  }

  if (text.length > limit) {
    const truncated = text.slice(0, limit - 3) + '...';
    span.textContent = truncated;
    // The title attribute shows a native tooltip with the full text
    span.title = text; 
  } else {
    span.textContent = text;
  }
  return span;
}
