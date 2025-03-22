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
 * Sorts projects based on content type priority:
 * 1. Projects with both mermaid diagrams AND photos
 * 2. Projects with photos only
 * 3. Projects with mermaid diagrams only
 * 4. Projects with neither
 */
export function filterByContentType() {
  const sortedProjects = [...allProjects].sort((a, b) => {
    // Determine if projects have mermaid diagrams
    const hasMermaidA = a.mermaid && a.mermaid.trim().length > 0;
    const hasMermaidB = b.mermaid && b.mermaid.trim().length > 0;
    
    // Determine if projects have photos
    const hasPhotosA = a.images && a.images.length > 0;
    const hasPhotosB = b.images && b.images.length > 0;
    
    // Assign priority scores (higher = higher priority)
    let scoreA = 0;
    let scoreB = 0;
    
    // Priority 1: Both mermaid and photos
    if (hasMermaidA && hasPhotosA) scoreA = 3;
    if (hasMermaidB && hasPhotosB) scoreB = 3;
    
    // Priority 2: Photos only
    else if (hasPhotosA) scoreA = 2;
    else if (hasPhotosB) scoreB = 2;
    
    // Priority 3: Mermaid only
    else if (hasMermaidA) scoreA = 1;
    else if (hasMermaidB) scoreB = 1;
    
    // Priority 4: Neither (score remains 0)
    
    // Sort by score (descending) or by title if scores are equal
    return scoreB - scoreA || a.title.localeCompare(b.title);
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
