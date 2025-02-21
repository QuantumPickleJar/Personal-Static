import { projectsPerPage } from './perPageSettings.js';
import { closeModal, loadProjects } from './projects.js';
import { initPagination, updateItemsPerPage } from './pagination.js';
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

export function renderProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';

  // Add academic or work class based on project type
  if (project.academic) {
    card.classList.add('academic');
  } else if (project.type === 'work') {
    card.classList.add('work');
  }

  // Set tooltip for the expanded text on mouseover
  card.title = project.description || '';

  // Create date badge and card
  let dateBadge = '';
  let dateCard = '';

  if (project.dates && project.dates.length > 0) {
    dateBadge = `<div class="date-badge">${project.dates.length}</div>`;
    dateCard = `
      <div class="date-card">
        ${project.dates.map(date => `<p>${date}</p>`).join('')}
      </div>
    `;
  }

// In renderProjectCard(), when rendering an academic project:
card.innerHTML = `
  ${dateBadge}
  ${dateCard}
  <!-- Card header: Title and academic info -->
  <div class="card-header">
    ${project.title}
    ${project.academic ? `<span class="academic-label" data-dates="${project.dates}">Academic</span>` : ''}
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

// Helper to generate options for projects per page based on screen width
function generatePerPageOptions() {
  let optionsArray;
  if (window.innerWidth < 768) { // mobile: smaller numbers
    optionsArray = [3, 4, 6];
  } else { // desktop: increments of two or more
    optionsArray = [6, 8, 10];
  }
  return optionsArray.map(opt => `<option value="${opt}">${opt}</option>`).join('');
}

// Updated renderPerPageDropdown to attach dropdown to the "how-to" div
function renderPerPageDropdown() {
  const howToContainer = document.getElementById('how-to');
  if (howToContainer) {
    // Check for existing container; if not, create one.
    let perPageContainer = document.getElementById('perPageContainer');
    if (!perPageContainer) {
      perPageContainer = document.createElement('div');
      perPageContainer.id = 'perPageContainer';
      howToContainer.appendChild(perPageContainer);
    }
    perPageContainer.innerHTML = `
      <label for="perPageSelect">Projects per page: </label>
      <select id="perPageSelect">
        ${generatePerPageOptions()}
      </select>
    `;
    const perPageSelect = document.getElementById('perPageSelect');
    perPageSelect.value = projectsPerPage;
    // Update options each time the dropdown is clicked to reflect current window size
    perPageSelect.addEventListener('click', () => {
      const currentValue = perPageSelect.value;
      perPageSelect.innerHTML = generatePerPageOptions();
      perPageSelect.value = currentValue;
    });
    perPageSelect.addEventListener('change', (e) => {
      const newPerPage = parseInt(e.target.value, 10);
      updateItemsPerPage(newPerPage);
    });
  }
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

  // If a search term is provided by the UI, apply the filter:
  const searchTerm = document.querySelector('#searchInput')?.value || '';
  const filteredProjects = filterProjectsBySearchTerm(projects, searchTerm);
  console.log('Filtered Projects:', filteredProjects);
  return projects;
}

// Find all academic labels in the document
document.querySelectorAll('.academic-label').forEach(label => {
  // When the label is hovered over...
  label.addEventListener('mouseenter', () => {
    const dates = label.getAttribute('data-dates');
    // Locate the parent project-card and its badge element
    const projectCard = label.closest('.project-card');
    const badge = projectCard ? projectCard.querySelector('.badge') : null;
    if (badge && dates) {
      // If the tooltip doesn't exist yet, create it
      let tooltip = badge.querySelector('.tooltip-dates');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip-dates';
        badge.appendChild(tooltip);
      }
      tooltip.textContent = dates;
      // Trigger the fade-in by adding the 'visible' class
      tooltip.classList.add('visible');
    }
  });
  
  // When the mouse leaves the label, hide the tooltip
  label.addEventListener('mouseleave', () => {
    const projectCard = label.closest('.project-card');
    const badge = projectCard ? projectCard.querySelector('.badge') : null;
    if (badge) {
      const tooltip = badge.querySelector('.tooltip-dates');
      if (tooltip) {
        tooltip.classList.remove('visible');
      }
    }
  });
});

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
    const projects = init();
    initPagination(projects, projectsPerPage);

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

  // Instead of creating a container in mainContent, we assume perPageContainer exists in the howToRow.
  if (window.location.pathname.endsWith('projects.html')) {
    renderPerPageDropdown();
    window.addEventListener('resize', () => {
      renderPerPageDropdown();
      updateItemsPerPage(projectsPerPage);
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