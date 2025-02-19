import { projectsPerPage } from './perPageSettings.js';
import { closeModal, loadProjects } from './projects.js';
import { initPagination } from './pagination.js';
import { filterProjByTitle, filterByDate } from './gallery-sorting.js';
import { filterProjectsBySearchTerm } from './rsc/js/search.js';

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

function renderProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  // Set tooltip for the expanded text on mouseover
  card.title = project.description || '';
  
  card.innerHTML = `
    <!-- Card header: Title and academic info -->
    <div class="card-header">
      ${project.title} ${project.academic ? '(Academic)' : ''}
    </div>
    <!-- Card body: show shortForm instead of the duplicated Title -->
    <div class="card-body">
      ${project.shortForm}
    </div>
    <!-- Card footer: tech stack -->
    <div class="card-footer">
      ${project.stack.join(', ')}
    </div>
  `;
  return card;
}

async function init() {
  const projects = await loadProjects();
  console.log('Projects loaded:', projects);
  
  // If a search term is provided by the UI, apply the filter:
  const searchTerm = document.querySelector('#searchInput')?.value || '';
  const filteredProjects = filterProjectsBySearchTerm(projects, searchTerm);
  console.log('Filtered Projects:', filteredProjects);
  
  // ...existing code to render projects...
}

document.addEventListener('DOMContentLoaded', () => {
  // Load partials
  loadPartial('partials/header.html', 'headerContainer');
  loadPartial('partials/footer.html', 'footerContainer');
  loadPartial('partials/sidebar.html', 'sidebarContainer');

  // Check if the current page is projects.html
  if (window.location.pathname.endsWith('projects.html')) {
    // Load projects.json
    init();
    //loadProjects();

    // Close modal when user clicks the X button
    document.getElementById('closeModal').addEventListener('click', closeModal);

    // Also close modal if user clicks outside the modal content
    const modal = document.getElementById('projectModal');
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Filtering dropdown event listener
    const filterDropdown = document.getElementById('filterDropdown');
    if (filterDropdown) {
      filterDropdown.addEventListener('change', (e) => {
        const value = e.target.value;
        switch (value) {
          case 'title':
            filterProjByTitle();
            break;
          case 'date':
            filterByDate();
            break;
          case 'status':
            console.log('Filter by status not implemented.');
            break;
          default:
            break;
        }
      });
    }
  }

  // TODO: make this its own component or partial
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
          <option value="8">8</option>
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

  // start the pagination with the imported default
  // initPagination(allProjects, projectsPerPage);
});