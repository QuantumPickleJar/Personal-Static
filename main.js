import { projectsPerPage } from './rsc/js/perPageSettings.js';
// import { closeModal, loadProjects } from './rsc/js/projects.js';
import { closeModal } from './rsc/js/project-modal.js';
import { loadProjects } from './rsc/js/projects.js';
import { initPagination, updateItemsPerPage } from './rsc/js/pagination.js';
import { filterProjByTitle, filterByDate } from './rsc/js/gallery-sorting.js';
import { filterProjectsBySearchTerm } from './rsc/js/search.js';
import { initCarousel } from './rsc/js/carousel.js';
import { initNavDrawer } from './rsc/js/nav-drawer.js';

function applyCurrentYear(root = document) {
  const year = new Date().getFullYear();
  root.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = String(year); });
}

function stripHtml(value) {
  const element = document.createElement('div');
  element.innerHTML = String(value || '');
  return (element.textContent || '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = String(value || '');
  return element.innerHTML;
}

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
        // console.log(`Trying to fetch partial from: ${path}`);
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
          // console.log(`Success! Loaded partial from: ${path}`);
          break;
        }
      } catch (e) {
        console.log(`Failed to load partial attempt with path: ${path}`);
      }
    }
    
    if (!successPath) {
      throw new Error(`Could not load partial ${partialPath} from any path`);
    }
    
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = html;
      applyCurrentYear(container);
      
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
  const descriptionText = stripHtml(project.description);
  const shortText = stripHtml(project.shortForm || project.description || '');
  const safeTitle = escapeHtml(project.title || '');
  const safeStack = (project.stack || []).map(item => escapeHtml(item)).join(', ');

  // Add academic or work class based on project type
  if (project.academic) {
    card.classList.add('academic');
  } else if (project.type === 'work') {
    card.classList.add('work');
  }

  // Set tooltip for the expanded text on mouseover
  card.title = descriptionText || '';

  // Create date badge and card
  let dateBadge = '';
  let dateCard = '';

  if (project.dates && project.dates.length > 0) {
    dateBadge = `<div class="date-badge">${project.dates.length}</div>`;
    dateCard = `
      <div class="date-card">
        ${project.dates.map(date => `<p>${escapeHtml(date)}</p>`).join('')}
      </div>
    `;
  }

// In renderProjectCard(), when rendering an academic project:
card.innerHTML = `
  ${dateBadge}
  ${dateCard}
  <!-- Card header: Title and academic info -->
  <div class="card-header">
    ${safeTitle}
    ${project.academic ? '<span class="academic-label">Academic</span>' : ''}
  </div>
  <!-- Card body: show shortForm instead of the duplicated Title -->
  <div class="card-body">
    ${escapeHtml(shortText)}
  </div>
  <!-- Card footer: tech stack -->
  <div class="card-footer">
    ${safeStack}
  </div>
`;

  const academicLabel = card.querySelector('.academic-label');
  if (academicLabel) {
    academicLabel.dataset.dates = (project.dates || []).join(', ');
  }


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

// Add function to set up academic label tooltips
function setupAcademicLabelTooltips() {
  // Wait for a short delay to ensure elements are loaded
  setTimeout(() => {
    const academicLabels = document.querySelectorAll('.academic-label');
    // console.log(`Found ${academicLabels.length} academic labels for tooltips`);
    
    academicLabels.forEach(label => {
      // Get dates from data attribute
      const dates = label.dataset.dates;
      if (dates) {
        // Create tooltip element if it doesn't exist
        if (!label.querySelector('.date-tooltip')) {
          const tooltip = document.createElement('span');
          tooltip.className = 'date-tooltip';
          tooltip.textContent = dates;
          label.appendChild(tooltip);
        }
      }
    });
  }, 500);
}

// In main.js, improve the projects page initialization
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM content loaded, pathname:', window.location.pathname);
  
  // Initialize navigation drawer
  initNavDrawer();
  
  await Promise.all([
    loadPartial('headerContainer', 'header.html'),
    loadPartial('sidebarContainer', 'sidebar.html'),
    loadPartial('footerContainer', 'footer.html')
  ]);
  // Move PDF modal markup into mainContent so modal is child of main
  const movedModal = document.querySelector('#sidebarContainer #pdfModal');
  const mainContent = document.getElementById('mainContent');
  if (movedModal && mainContent) {
    mainContent.appendChild(movedModal);
  }
  // Set up PDF.js and modal handler
  (function setupPdfModal(){
    const loader = document.createElement('script');
    loader.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
    loader.onload = () => {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    };
    document.head.appendChild(loader);
    document.body.addEventListener('click', async e => {
      const btn = e.target.closest('#viewResumeBtn');
      if (!btn) return;
      e.preventDefault();
      console.log('View Resume clicked');
      const modal = document.getElementById('pdfModal');
      const canvas = document.getElementById('pdfCanvas');
      const loading = document.getElementById('loadingPdf');
      const notice = document.getElementById('pdfjs-notice');
      if (!modal || !canvas) return;
      modal.classList.add('open');
      canvas.style.display = 'none';
      if (loading) loading.style.display = '';
      if (notice) notice.style.display = 'none';
      try {
        if (typeof pdfjsLib === 'undefined') throw new Error('PDF.js library not loaded');
        const pdf = await pdfjsLib.getDocument('rsc/docs/resume.pdf').promise;
        const page = await pdf.getPage(1);
        const vp = page.getViewport({ scale: 1.2 });
        canvas.width = vp.width;
        canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
        canvas.style.display = '';
        if (loading) loading.style.display = 'none';
      } catch (err) {
        console.error('PDF rendering error:', err);
        if (loading) loading.style.display = 'none';
        if (notice) notice.style.display = '';
        // fallback open in new tab
        window.open('rsc/docs/resume.pdf', '_blank');
      }
    });
    // Close modal on backdrop or close-button
    document.body.addEventListener('click', e => {
      if (e.target.matches('.close-button') || e.target.id === 'pdfModal') {
        e.preventDefault();
        const m = document.getElementById('pdfModal');
        if (m) m.classList.remove('open');
      }
    });
  })();

  // Set up academic labels with date tooltips
  setupAcademicLabelTooltips();

  // Check if we're on the projects page in multiple ways to be sure
  const isProjectsPage = 
    window.location.pathname.includes('projects.html') || 
    window.location.href.includes('projects.html') ||
    window.debugProjectsPage ||
    document.getElementById('projectsGallery');
  
  // console.log('Is projects page?', isProjectsPage);
  
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
  // Check if current page is index.html or root (for GitHub Pages)
  const isHomePage = (
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('/Personal-Static/') ||
    window.location.pathname === '/Personal-Static/'
  );
  if (isHomePage) {
    // No need to create the carousel element, just load the data
    console.log('Loading carousel data on index page');
    // Import and execute the carousel code
    import('./rsc/js/front_page_carousel.js')
      .then(module => {
        // console.log('Front page carousel module loaded');
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

    renderPerPageDropdown();
    window.addEventListener('resize', () => {
      renderPerPageDropdown();
      updateItemsPerPage(projectsPerPage);
    });

    /* Removed filterDropdown change listener block to avoid conflict with custom filter menu */
    
  }
});

// Add this to your main.js file
document.addEventListener('DOMContentLoaded', () => {
  // Ensure Bootstrap is available for carousels
  if (typeof bootstrap === 'undefined' && document.getElementById('carouselContainer')) {
    // console.log('Loading Bootstrap JS dynamically');
    const bootstrapScript = document.createElement('script');
    bootstrapScript.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
    bootstrapScript.onload = () => {
      // console.log('Bootstrap loaded, initializing carousel');
      if (typeof initCarousel === 'function') {
        initCarousel();
      }
    };
    document.head.appendChild(bootstrapScript);
  }
});

// PDF Modal Delegated Listener
// opens PDF.js canvas modal when clicking View Resume button
if (typeof document !== 'undefined') {
  document.body.addEventListener('click', async e => {
    const btn = e.target.closest('#viewResumeBtn');
    if (!btn) return;
    e.preventDefault();
    console.log('View Resume clicked');
    // ensure modal elements are available
    const modal = document.getElementById('pdfModal');
    const canvas = document.getElementById('pdfCanvas');
    const loading = document.getElementById('loadingPdf');
    const notice = document.getElementById('pdfjs-notice');
    if (!modal) {
      console.error('PDF modal not found');
      return;
    }
    modal.classList.add('open');
    if (canvas) canvas.style.display = 'none';
    if (loading) loading.style.display = '';
    if (notice) notice.style.display = 'none';
    // render PDF
    if (window.pdfjsLib) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      try {
        const pdf = await pdfjsLib.getDocument('rsc/docs/resume.pdf').promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.2 });
        if (canvas) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          canvas.style.display = '';
        }
        if (loading) loading.style.display = 'none';
      } catch (err) {
        console.error('PDF render error:', err);
        if (loading) loading.style.display = 'none';
        if (notice) notice.style.display = '';
      }
    } else {
      console.warn('PDF.js library not loaded');
    }
  });
  // close modal
  document.body.addEventListener('click', e => {
    if (e.target.matches('.close-button') || e.target.id === 'pdfModal') {
      e.preventDefault();
      const m = document.getElementById('pdfModal');
      if (m) m.classList.remove('open');
    }
  });
}

// Contact form handler
function handleContactSubmit(event) {
  event.preventDefault();
  // Add form submission logic here
  console.log('Form submitted');
}