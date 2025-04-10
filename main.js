import { projectsPerPage } from './rsc/js/perPageSettings.js';
import { closeModal, loadProjects } from './rsc/js/projects.js';
import { initPagination, updateItemsPerPage } from './rsc/js/pagination.js';
import { filterProjByTitle, filterByDate } from './rsc/js/gallery-sorting.js';
import { filterProjectsBySearchTerm } from './rsc/js/search.js';
import { initCarousel } from './rsc/js/carousel.js';

/**
 * Load partial files into the main page with improved path resolution
 */
async function loadPartial(containerId, partialPath) {
  try {
    // Extract the base name without extension
    const baseName = partialPath.replace('.html', '');
    
    // Try multiple path formats with and without .html extension
    const pathsToTry = [
      `partials/${baseName}`,           // Without extension (important!)
      `./partials/${baseName}`,         // Without extension, relative
      `partials/${partialPath}`,        // With extension
      `./partials/${partialPath}`       // With extension, relative
    ];
    
    // If we're in GitHub Pages environment, add the repo path
    if (window.location.hostname.includes('github.io')) {
      pathsToTry.unshift(`/Personal-Static/partials/${baseName}`);
      pathsToTry.unshift(`/Personal-Static/partials/${partialPath}`);
    }
    
    let response = null;
    let html = null;
    let successPath = null;
    
    // Try each path until one works
    for (const path of pathsToTry) {
      try {
        console.log(`Trying to fetch partial from: ${path}`);
        const fetchResponse = await fetch(path, { 
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
        });
        
        if (fetchResponse.ok) {
          response = fetchResponse;
          html = await response.text();
          
          // Skip if we got the index.html page instead of the partial
          if (html.includes('<title>Vincent') || 
              html.includes('barba-wrapper') ||
              html.includes('headerContainer')) {
            console.log(`Path ${path} returned index.html instead of the partial`);
            continue;
          }
          
          successPath = path;
          console.log(`Success! Loaded partial from: ${path}`);
          break;
        }
      } catch (e) {
        console.log(`Failed attempt with path: ${path}`);
      }
    }
    
    if (!successPath) {
      throw new Error(`Could not load partial ${partialPath} from any path`);
    }
    
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = html;
      
      // Ensure elements slide into view properly after loading
      setTimeout(() => {
        if (container.classList.contains('slide-left')) {
          container.classList.remove('slide-left');
        }
        
        // Apply any animation classes defined in your CSS
        container.classList.add('loaded');
      }, 100);
    }
  } catch (error) {
    console.error(`Error loading ${partialPath}:`, error);
    // Provide fallback content
    document.getElementById(containerId).innerHTML = `
      <div class="error-partial" style="padding: 10px; background: #ffeeee; border: 1px solid #ffaaaa;">
        <p>Failed to load ${partialPath}.</p>
        <p>This is fallback content.</p>
      </div>`;
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

// 

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

// In main.js, improve the projects page initialization
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM content loaded, pathname:', window.location.pathname);
  
  await Promise.all([
    loadPartial('headerContainer', 'header.html'),
    loadPartial('sidebarContainer', 'sidebar.html'),
    loadPartial('footerContainer', 'footer.html')
  ]);

  // Check if we're on the projects page in multiple ways to be sure
  const isProjectsPage = 
    window.location.pathname.includes('projects.html') || 
    window.location.href.includes('projects.html') ||
    window.debugProjectsPage ||
    document.getElementById('projectsGallery');
  
  console.log('Is projects page?', isProjectsPage);
  
  if (isProjectsPage) {
    console.log('Projects page detected, initializing...');
    
    // Make sure the gallery element exists
    const gallery = document.getElementById('projectsGallery');
    if (!gallery) {
      console.error('Projects gallery element not found!');
      return;
    }
    
    try {
      // Add a manual loading indicator
      gallery.innerHTML = '<div class="loading">Loading projects...</div>';
      
      // Load projects
      const projects = await loadProjects();
      console.log(`Loaded ${projects.length} projects`);
      
      // If we have projects, render them
      if (projects && projects.length > 0) {
        console.log('Initializing pagination with projects');
        initPagination(projects, projectsPerPage);
      } else {
        console.error('No projects found!');
        gallery.innerHTML = '<div class="error">No projects found. Please try refreshing.</div>';
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      gallery.innerHTML = '<div class="error">Failed to load projects. Please try refreshing.</div>';
    }
  }

  // Handle contact form if it exists
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }
  // Check if current page is index.html
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    // No need to create the carousel element, just load the data
    console.log('Loading carousel data on index page');
    
    // Import and execute the carousel code
    import('./rsc/js/front_page_carousel.js')
      .then(module => {
        console.log('Front page carousel module loaded');
        if (module.initCarousel) {
          module.initCarousel();
        }
      })
      .catch(err => console.error('Failed to load carousel module:', err));
  }
  // Check if the current page is projects.html
  if (window.location.pathname.endsWith('projects.html')) {
    console.log("Detected projects.html, initializing project gallery.");
    
    // Use a self-executing async function to properly await
    (async () => {
      try {
        const projects = await init();
        initPagination(projects, projectsPerPage);
        
        // Rest of your projects.html initialization
        // ...
      } catch (error) {
        console.error("Failed to initialize projects:", error);
      }
    })();
    
    // Code that doesn't depend on projects can remain outside
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
    
    renderPerPageDropdown();
    window.addEventListener('resize', () => {
      renderPerPageDropdown();
      updateItemsPerPage(projectsPerPage);
    });
  }
});

// Add this to your main.js file
document.addEventListener('DOMContentLoaded', () => {
  // Ensure Bootstrap is available for carousels
  if (typeof bootstrap === 'undefined' && document.getElementById('carouselContainer')) {
    console.log('Loading Bootstrap JS dynamically');
    const bootstrapScript = document.createElement('script');
    bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
    bootstrapScript.onload = () => {
      console.log('Bootstrap loaded, initializing carousel');
      if (typeof initCarousel === 'function') {
        initCarousel();
      }
    };
    document.head.appendChild(bootstrapScript);
  }
});

// Contact form handler
function handleContactSubmit(event) {
  event.preventDefault();
  // Add form submission logic here
  console.log('Form submitted');
}