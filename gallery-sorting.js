import { allProjects } from './projects.js';
import { projectsPerPage } from './perPageSettings.js';
import { initPagination } from './pagination.js';

/**
 * Contains functions that `projects.js` uses to change the sorting 
 * behavior of projects in the gallery, as well as some additinal 
 * search functions. 
 */

// set to true when sorting by:
// Z-A
// Date of project end
let isAscending = false;

export function filterProjByTitle() {
  const sortedProjects = [...allProjects].sort((a, b) =>
    isAscending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
  );
  // reinitialize pagination with sorted projects using default projectsPerPage
  initPagination(sortedProjects, projectsPerPage);
  renderProjectsGallery(sortedProjects);
}

export function filterByDate() {
  const sortedProjects = [...allProjects].sort((a, b) => {
    const dateA = new Date(a.dates.split(' to ')[1] || a.dates);
    const dateB = new Date(b.dates.split(' to ')[1] || b.dates);
    return isAscending ? dateA - dateB : dateB - dateA;
  });
  // reinitialize pagination with sorted projects using default projectsPerPage
  initPagination(sortedProjects, projectsPerPage);
  renderProjectsGallery(sortedProjects);
}
