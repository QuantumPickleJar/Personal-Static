/**
 * @file search.js
 * @description Provides functionality to filter an array of project objects based on a provided search term.
 *
 * This module exports the filterProjectsBySearchTerm function, which checks if the search term (case-insensitive)
 * is included in any of the project’s title, description, or stack elements.
 *
 * @module search
 */

/**
 * @function filterProjectsBySearchTerm
 * @param {Array} projects - The array of project objects.
 * @param {string} searchTerm - The term to search for.
 * @returns {Array} - Filtered array of projects matching the term.
 */
export function filterProjectsBySearchTerm(projects, searchTerm) {
    if (!searchTerm) {
      return projects;
    }
    const lowerTerm = searchTerm.toLowerCase();
  
    return projects.filter(project => {
      const title = (project.title || '').toLowerCase();
      const desc = (project.description || '').toLowerCase();
      const stack = (project.stack || []).join(' ').toLowerCase();
  
      return (
        title.includes(lowerTerm) ||
        desc.includes(lowerTerm) ||
        stack.includes(lowerTerm)
      );
    });
  }
  