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
});