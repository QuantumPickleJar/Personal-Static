import { projectsPerPage } from './perPageSettings.js';
import { loadProjects, closeModal } from './projects.js';

/**
 * Load partial files into the main page
 */
function loadPartial(file, elementId) {
  fetch(file)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error fetching ${file}: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById(elementId).innerHTML = html;
    })
    .catch(error => {
      console.error('Error loading partial:', error);
    });
}




document.addEventListener('DOMContentLoaded', () => {
  // Load partials
  loadPartial('partials/header.html', 'headerContainer');
  loadPartial('partials/footer.html', 'footerContainer');
  loadPartial('partials/sidebar.html', 'sidebarContainer');

  // Check if the current page is projects.html
  if (window.location.pathname.endsWith('projects.html')) {
    // Load projects.json
    loadProjects();

    // Close modal when user clicks the X button
    document.getElementById('closeModal').addEventListener('click', closeModal);

    // Also close modal if user clicks outside the modal content
    const modal = document.getElementById('projectModal');
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Only render the control on projects.html
if (window.location.pathname.endsWith('projects.html')) {
  // Assume the sidebar is rendered (from sidebar.html)
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    const perPageContainer = document.createElement('div');
    perPageContainer.id = 'perPageSettings';
    perPageContainer.innerHTML = `
      <label for="perPageSelect">Projects per page: </label>
      <select id="perPageSelect">
        <option value="6">6</option>
        <option value="9">9</option>
        <option value="12">12</option>
      </select>
    `;
    // Append the control at the end of the sidebar
    sidebar.appendChild(perPageContainer);

    // set initial select value
    document.getElementById('perPageSelect').value = projectsPerPage;

    // Add event listener: update pagination when the value changes
    document.getElementById('perPageSelect').addEventListener('change', (e) => {
      const newPerPage = parseInt(e.target.value, 10);
      updateItemsPerPage(newPerPage);
    });
  }
}

// For example, start the pagination with the imported default
initPagination(allProjects, projectsPerPage);
});