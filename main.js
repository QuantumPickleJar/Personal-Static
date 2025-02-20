import { projectsPerPage } from './perPageSettings.js';
import { closeModal, loadProjects } from './projects.js';
import { initPagination } from './pagination.js';
import { filterProjByTitle, filterByDate } from './gallery-sorting.js';
import { filterProjectsBySearchTerm } from './rsc/js/search.js';

/**
 * Load partial files into the main page
 */
async function loadPartial(containerId, partialPath) {
  try {
    const response = await fetch(`partials/${partialPath}`);
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;
  } catch (error) {
    console.error(`Error loading ${partialPath}:`, error);
  }
}


// export function initPage() {
//   // Load and apply stored pagination settings before rendering
//   applyPagination();
  
//   // Optionally, reinitialize pagination with sorted or default projects
//   initPagination(allProjects, projectsPerPage);
  
//   // Render the gallery with the updated projectsPerPage
//   renderProjectsGallery(allProjects);
// }

// window.addEventListener('DOMContentLoaded', initPage);

export function renderProjectCard(project) {
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


/**
 * Initializes the application by loading projects, filtering them based on a search term, 
 * and logging both the full and filtered lists of projects.
 *
 * This asynchronous function performs the following steps:
 * 1. Retrieves a list of projects using the loadProjects function.
 * 2. Logs the complete list of projects.
 * 3. Retrieves the search term from an input element with the ID "searchInput". If the input 
 *    element's value is null or empty, it defaults to an empty string.
 * 4. Filters the projects using filterProjectsBySearchTerm if a search term is provided; otherwise, 
 *    it uses the full list of projects.
 * 5. Logs the filtered list of projects.
 *
 * @async
 * @function init
 * @returns {Promise<void>} A promise that resolves when the initialization process is complete.
 */
async function init() {
  const projects = await loadProjects();
  console.log('Projects loaded:', projects);

  // Obtain the search term from the input, defaulting to an empty string if it's null
  const searchInput = document.querySelector('#searchInput');
  const searchTerm = searchInput?.value || '';

  // Apply the filter only if searchTerm is not empty; otherwise, use all projects
  const filteredProjects = searchTerm 
    ? filterProjectsBySearchTerm(projects, searchTerm)
    : projects;
    
  console.log('Filtered Projects:', filteredProjects);
}

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadPartial('headerContainer', 'header.html'),
    loadPartial('sidebarContainer', 'sidebar.html'),
    loadPartial('footerContainer', 'footer.html')
  ]);

  // Handle contact form if it exists
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }

  // Check if the current page is projects.html
  if (window.location.pathname.endsWith('projects.html')) {
    // Load projects.json
    init();

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
    const sidebar = document.getElementById('sidebarContainer');
    const perPageContainer = document.createElement('div');
    perPageContainer.innerHTML = `
      <label for="perPageSelect">Projects per page: </label>
      <select id="perPageSelect">
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="12">12</option>
      </select>
    `;
    sidebar.appendChild(perPageContainer);

    // Set initial value and add event listener
    document.getElementById('perPageSelect').value = projectsPerPage;
    document.getElementById('perPageSelect').addEventListener('change', (e) => {
      const newPerPage = parseInt(e.target.value, 10);
      updateItemsPerPage(newPerPage);
    });
  }

  // start the pagination with the imported default
  // initPagination(allProjects, projectsPerPage);
});

// Contact form handler
function handleContactSubmit(event) {
  event.preventDefault();
  // Add form submission logic here
  console.log('Form submitted');
}