console.log('Front page carousel script executing');

// Import the stack icon renderer
import { renderOneStackIcon } from './stackIconLoader.js';

// Export a function that can be called from main.js
export function initCarousel() {
  console.log('Initializing carousel from exported function');
  loadProjectCards();
  loadCarouselProjects();
}

function stripHtml(value) {
  const element = document.createElement('div');
  element.innerHTML = String(value || '');
  return (element.textContent || '').replace(/\s+/g, ' ').trim();
}

let showMermaidProjects = false; // Default to showing photo projects

async function loadCarouselProjects() {
  const carouselContainer = document.getElementById('carouselContainer');
  if (!carouselContainer) {
    console.error("Carousel container not found");
    return;
  }

  const carouselInner = carouselContainer.querySelector('.carousel-inner');
  if (!carouselInner) {
    console.error("Carousel inner container not found");
    return;
  }

  try {
    console.log('Fetching projects.json for carousel');
    
    // Handle GitHub Pages path resolution
    const basePath = window.location.hostname.includes('github.io') ? 
      '/Personal-Static/' : '/';
    
    // Use multiple path variations to ensure it works
    let response;
    const pathsToTry = [
      `${basePath}rsc/json/projects.json`,
      './rsc/json/projects.json',
      '/rsc/json/projects.json',
      'rsc/json/projects.json'
    ];
    
    for (const path of pathsToTry) {
      try {
        response = await fetch(path);
        if (response.ok) break;
      } catch (e) {
        console.log(`Failed to fetch from ${path}`);
      }
    }
    
    if (!response || !response.ok) {
      throw new Error("Failed to fetch projects.json from any path");
    }
    
    const projects = await response.json();
    console.log('Projects loaded for carousel:', projects.length);

    // Filter projects based on toggle state
    const filteredProjects = showMermaidProjects 
      ? projects.filter(project => project.mermaid && project.mermaid.trim())
      : projects.filter(project => project.images && project.images.length > 0);
    
    console.log(`Showing ${showMermaidProjects ? 'Mermaid' : 'Photo'} projects in carousel:`, filteredProjects.length);

    if (filteredProjects.length === 0) {
      console.warn(`No projects with ${showMermaidProjects ? 'Mermaid diagrams' : 'photos'} found`);
      carouselInner.innerHTML = `
        <div class="carousel-item active">
          <div class="carousel-card">
            <div class="carousel-card-header">No Projects Found</div>
            <div class="carousel-card-body">
              No projects with ${showMermaidProjects ? 'Mermaid diagrams' : 'photos'} are available.
            </div>
          </div>
        </div>`;
      return;
    }

    // Add CSS to ensure carousel styling
    if (!document.getElementById('carousel-styles')) {
      const style = document.createElement('style');
      style.id = 'carousel-styles';
      style.textContent = `
        .carousel-card {
          padding: 18px;
          border-radius: 16px;
          background-color: #fff;
          color: #333;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
          height: 100%;
          margin: 10px auto;
          width: 95%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }
        
        body.dark-mode .carousel-card {
          background-color: #2a2a2a;
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }
        
        .carousel-card-header {
          font-size: 1.35rem;
          font-weight: 500;
          margin-bottom: 12px;
          color: var(--md-sys-color-primary, #6750A4);
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        }
        
        body.dark-mode .carousel-card-header {
          color: #bb9dfc;
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }
        
        .carousel-card-body {
          font-size: 0.95rem;
          line-height: 1.6;
          flex-grow: 1;
          overflow: hidden;
          margin-bottom: 12px;
        }
        
        .spacer {
          flex-grow: 1;
          min-height: 8px;
        }
        
        .carousel-card-footer {
          margin-top: auto;
          padding-top: 1rem;
          font-size: 0.85rem;
          color: #666;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        body.dark-mode .carousel-card-footer {
          color: #aaa;
          border-top-color: rgba(255, 255, 255, 0.05);
        }
        
        #carouselContainer {
          width: 92%;
          margin: 20px auto;
          border-radius: 20px;
          overflow: hidden;
        }
        
        .carousel-item {
          padding: 8px 0 28px;
        }
        
        md-filled-button {
          --md-filled-button-container-color: var(--md-sys-color-primary, #6750A4);
          --md-filled-button-label-text-color: white;
          margin-top: 8px;
        }
      `;
      document.head.appendChild(style);
    }

    // Add additional styling for carousel stack icons
    if (!document.getElementById('stack-icon-styles')) {
      const stackStyles = document.createElement('style');
      stackStyles.id = 'stack-icon-styles';
      stackStyles.textContent = `
        .stack-icons-container {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
          align-items: center;
          width: 100%;
        }
        
        .carousel-stack-icon {
          transform: scale(1);
          margin-bottom: 6px;
          transition: transform 0.2s ease;
        }
        
        .carousel-stack-icon:hover {
          transform: scale(1.08);
        }
        
        .carousel-stack-icon .stack-image {
          width: 28px;
          height: 28px;
          object-fit: contain;
          display: block;
          margin: 0 auto 4px;
          transition: transform 0.2s ease;
        }
        
        .carousel-stack-icon .stack-label {
          font-size: 0.75rem;
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
          color: var(--md-sys-color-on-surface-variant, #49454f);
        }
        
        body.dark-mode .carousel-stack-icon .stack-label {
          color: var(--md-sys-color-on-surface-variant, #cac4d0);
        }
        
        .stack-item-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 50px;
          margin-right: 0;
          border-radius: 12px;
          padding: 8px 6px;
          background-color: var(--md-sys-color-surface-container-low, #f4eff4);
          transition: all 0.2s ease;
          border: 1px solid var(--md-sys-color-outline-variant, rgba(0,0,0,0.05));
        }
        
        .stack-item-container:hover {
          background-color: var(--md-sys-color-surface-container-high, #ece6ec);
          transform: translateY(-2px);
        }
        
        body.dark-mode .stack-item-container {
          background-color: var(--md-sys-color-surface-container-low, #1d1a1d);
          border-color: var(--md-sys-color-outline-variant, rgba(255,255,255,0.1));
        }
        
        body.dark-mode .stack-item-container:hover {
          background-color: var(--md-sys-color-surface-container-high, #2b282b);
        }
        
        .more-stack-label {
          font-size: 0.8rem;
          color: var(--md-sys-color-on-surface-variant, #49454f);
          align-self: center;
          margin-left: 8px;
          padding: 4px 10px;
          border-radius: 16px;
          background-color: var(--md-sys-color-surface-variant, #e7e0ec);
          transition: all 0.2s ease;
        }
        
        .more-stack-label:hover {
          background-color: var(--md-sys-color-primary-container, #eaddff);
          color: var(--md-sys-color-on-primary-container, #21005d);
        }
        
        body.dark-mode .more-stack-label {
          color: var(--md-sys-color-on-surface-variant, #cac4d0);
          background-color: var(--md-sys-color-surface-variant, #49454f);
        }
        
        body.dark-mode .more-stack-label:hover {
          background-color: var(--md-sys-color-primary-container, #4f378b);
          color: var(--md-sys-color-on-primary-container, #eaddff);
        }
        
        /* Material Design 3 card styles */
        .carousel-card {
          padding: 20px;
          border-radius: 28px;
          background-color: var(--md-sys-color-surface-container, #f9f9f9);
          color: var(--md-sys-color-on-surface, #1c1b1f);
          box-shadow: var(--md-sys-elevation-level2, 0 2px 6px rgba(0, 0, 0, 0.1));
          height: 100%;
          margin: 10px auto;
          width: 95%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
          overflow: hidden;
        }
        
        .carousel-card:hover {
          box-shadow: var(--md-sys-elevation-level3, 0 6px 12px rgba(0, 0, 0, 0.12));
          background-color: var(--md-sys-color-surface-container-high, #f3f3f3);
        }
        
        body.dark-mode .carousel-card {
          background-color: var(--md-sys-color-surface-container, #1d1b20);
          color: var(--md-sys-color-on-surface, #e6e0e9);
          border-color: transparent;
          box-shadow: var(--md-sys-elevation-level2, 0 2px 6px rgba(0, 0, 0, 0.3));
        }
        
        body.dark-mode .carousel-card:hover {
          background-color: var(--md-sys-color-surface-container-high, #2b2930);
          box-shadow: var(--md-sys-elevation-level3, 0 6px 12px rgba(0, 0, 0, 0.35));
        }
        
        .carousel-card-header {
          font-size: 1.5rem;
          font-weight: 400;
          margin-bottom: 16px;
          color: var(--md-sys-color-on-surface, #1c1b1f);
          padding-bottom: 12px;
          border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.08));
          transition: color 0.2s ease;
        }
        
        .carousel-card:hover .carousel-card-header {
          color: var(--md-sys-color-primary, #6750a4);
        }
        
        body.dark-mode .carousel-card-header {
          color: var(--md-ssys-color-on-surface, #e6e0e9);
          border-bottom-color: var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.1));
        }
        
        body.dark-mode .carousel-card:hover .carousel-card-header {
          color: var(--md-sys-color-primary, #d0bcff);
        }
        
        .carousel-card-body {
          font-size: 1rem;
          line-height: 1.6;
          flex-grow: 1;
          overflow: hidden;
          margin-bottom: 16px;
          color: var(--md-sys-color-on-surface-variant, #49454f);
        }
        
        body.dark-mode .carousel-card-body {
          color: var(--md-sys-color-on-surface-variant, #cac4d0);
        }
        
        .carousel-card-footer {
          margin-top: auto;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.08));
        }
        
        body.dark-mode .carousel-card-footer {
          border-top-color: var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.1));
        }
        
        md-filled-button {
          --md-filled-button-container-color: var(--md-sys-color-primary, #6750a4);
          --md-filled-button-label-text-color: var(--md-sys-color-on-primary, #ffffff);
          --md-filled-button-container-shape: 20px;
          margin-top: 0;
          height: 36px;
          padding: 0 24px;
          font-size: 0.875rem;
          text-transform: none;
          letter-spacing: 0.01em;
          transition: all 0.2s ease;
        }
        
        md-filled-button:hover {
          --md-filled-button-container-elevation: 2;
        }
        
        /* Material Design 3 Button Styles */
        md-filled-button.open-modal-btn {
          --md-filled-button-container-color: var(--md-sys-color-primary, #6750a4);
          --md-filled-button-label-text-color: var(--md-sys-color-on-primary, #ffffff);
          --md-filled-button-container-shape: 20px;
          font-size: 0.875rem;
          height: 36px;
          padding: 0 16px;
          position: relative;
          overflow: hidden;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Add ripple effect */
        md-filled-button.open-modal-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: transparent;
          border-radius: inherit;
          pointer-events: none;
          transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        md-filled-button.open-modal-btn:hover::before {
          background-color: rgba(255, 255, 255, 0.08);
        }
        
        md-filled-button.open-modal-btn:active::before {
          background-color: rgba(255, 255, 255, 0.12);
        }
        
        /* Add button outline/focus state */
        md-filled-button.open-modal-btn::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          border: 2px solid var(--md-sys-color-primary, #6750a4);
          border-radius: 24px; /* Slightly larger to wrap around the button */
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        md-filled-button.open-modal-btn:focus-visible::after {
          opacity: 1;
        }
        
        body.dark-mode md-filled-button.open-modal-btn::after {
          border-color: var(--md-sys-color-primary, #d0bcff);
        }
        
        /* Add elevation shadow on hover */
        md-filled-button.open-modal-btn:hover {
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transform: translateY(-1px);
        }
        
        md-filled-button.open-modal-btn:active {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          transform: translateY(0);
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .carousel-card {
            padding: 16px;
            border-radius: 24px;
          }
          
          .carousel-card-header {
            font-size: 1.25rem;
            margin-bottom: 12px;
            padding-bottom: 10px;
          }
          
          .carousel-card-body {
            font-size: 0.9375rem;
            margin-bottom: 12px;
          }
          
          .carousel-card-footer {
            padding-top: 12px;
          }
          
          md-filled-button {
            height: 32px;
            padding: 0 16px;
            font-size: 0.8125rem;
          }
          
          .stack-item-container {
            padding: 6px 4px;
          }
          
          .carousel-stack-icon .stack-image {
            width: 24px;
            height: 24px;
          }
        }
      `;
      document.head.appendChild(stackStyles);
    }

    // Clear existing content in carousel
    carouselInner.innerHTML = "";

    // Limit to 5 projects
    const limitedProjects = filteredProjects.slice(0, 5);

    // Populate the carousel
    limitedProjects.forEach((project, index) => {
      const carouselItem = document.createElement("div");
      carouselItem.classList.add("carousel-item");
      if (index === 0) {
        carouselItem.classList.add("active");
      }

      const cardDiv = document.createElement("div");
      cardDiv.classList.add("carousel-card");
      
      const cardHeader = document.createElement("div");
      cardHeader.classList.add("carousel-card-header", "project-title-link");
      cardHeader.textContent = project.title;
      cardHeader.style.cursor = "pointer";
      // Make the title clickable to navigate to project page
      cardHeader.addEventListener("click", () => {
        window.location.href = `projects.html?showProject=${project.id || project.title.replace(/\s+/g, '-').toLowerCase()}`;
      });
      
      const cardBody = document.createElement("div");
      cardBody.classList.add("carousel-card-body");
      cardBody.textContent = project.shortForm ||
        (project.description ? stripHtml(project.description).substring(0, 100) + '...' : 'No description available');
      
      const cardFooter = document.createElement("div");
      cardFooter.classList.add("carousel-card-footer");
      
      // Create a container for stack icons
      const stackIconsContainer = document.createElement("div");
      stackIconsContainer.classList.add("stack-icons-container");
      
      // Add tech stack icons (if available)
      if (project.stack && project.stack.length > 0) {
        // Limit to maximum 5 icons to avoid crowding
        const visibleStack = project.stack.slice(0, 5);
        
        visibleStack.forEach(tech => {
          try {
            const iconElement = renderOneStackIcon(tech);
            if (iconElement) {
              // Adjust the size for carousel
              iconElement.classList.add('carousel-stack-icon');
              stackIconsContainer.appendChild(iconElement);
            }
          } catch (err) {
            console.warn(`Failed to render icon for ${tech}:`, err);
          }
        });
        
        // If there are more than 5 stack items, add a "+X more" indicator
        if (project.stack.length > 5) {
          const moreLabel = document.createElement('div');
          moreLabel.classList.add('more-stack-label');
          moreLabel.textContent = `+${project.stack.length - 5} more`;
          stackIconsContainer.appendChild(moreLabel);
        }
        
        cardFooter.appendChild(stackIconsContainer);
        // Make the footer more prominent for tech stack
        cardFooter.style.justifyContent = 'flex-start'; // Align items to the left
        cardFooter.style.flexDirection = 'column';      // Stack elements vertically
      } else {
        // Fallback if no stack data
        cardFooter.textContent = "No tech stack data available";
      }
      
      cardDiv.appendChild(cardHeader);
      cardDiv.appendChild(cardBody);
      cardDiv.appendChild(cardFooter);
      
      carouselItem.appendChild(cardDiv);
      carouselInner.appendChild(carouselItem);
    });

    // Initialize Bootstrap carousel
    try {
      // Check if Bootstrap is available globally
      if (typeof bootstrap !== 'undefined') {
        new bootstrap.Carousel(carouselContainer, {
          interval: 5000,
          wrap: true
        });
      } else {
        console.error('Bootstrap not available - make sure Bootstrap JS is loaded');
      }
    } catch (error) {
      console.error('Error initializing Bootstrap carousel:', error);
    }

  } catch (error) {
    console.error("Error loading projects for carousel:", error);
  }
}

// New function to load project cards into the grid
async function loadProjectCards() {
  const projectCardGrid = document.querySelector('.project-card-grid');
  if (!projectCardGrid) {
    console.error("Project card grid not found");
    return;
  }

  try {
    console.log('Fetching projects for card grid');
    
    // Reuse the same path resolution logic
    const basePath = window.location.hostname.includes('github.io') ? 
      '/Personal-Static/' : '/';
    
    // Use multiple path variations to ensure it works
    let response;
    const pathsToTry = [
      `${basePath}rsc/json/projects.json`,
      './rsc/json/projects.json',
      '/rsc/json/projects.json',
      'rsc/json/projects.json'
    ];
    
    for (const path of pathsToTry) {
      try {
        response = await fetch(path);
        if (response.ok) break;
      } catch (e) {
        console.log(`Failed to fetch from ${path}`);
      }
    }
    
    if (!response || !response.ok) {
      throw new Error("Failed to fetch projects.json from any path");
    }
    
    const projects = await response.json();
    console.log('Projects loaded for card grid:', projects.length);

    // Clear existing content
    projectCardGrid.innerHTML = '';

    // For featured projects section, always show a mix of best projects
    const featuredProjects = projects.slice(0, 3);

    if (featuredProjects.length === 0) {
      // Show message if no projects match the filter
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.textContent = `No projects found.`;
      emptyMessage.style.gridColumn = '1 / -1';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.padding = '2rem';
      projectCardGrid.appendChild(emptyMessage);
      return;
    }

    // Populate the project card grid
    featuredProjects.forEach((project) => {
      const cardElement = document.createElement('md-elevated-card');
      cardElement.classList.add('project-card');
      
      // Add home-page specific class to enable different styling
      document.querySelector('.project-card-grid').classList.add('home-page');
      
      // Main card content - no click handler on the card itself
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('project-content-wrapper');
      
      // Title - keep clickable
      const titleElement = document.createElement('h3');
      titleElement.classList.add('project-title', 'project-title-link');
      titleElement.textContent = project.title;
      titleElement.addEventListener("click", () => {
        window.location.href = `projects.html?showProject=${project.id || project.title.replace(/\s+/g, '-').toLowerCase()}`;
      });
      
      // Description - non-clickable with proper truncation
      const descriptionElement = document.createElement('p');
      descriptionElement.classList.add('short-form-truncated');
      
      // Use shortForm if available, otherwise take a portion of description
      const shortText = project.shortForm ||
        (project.description ? stripHtml(project.description).substring(0, 180) : 'No description available');
      
      // Set the text content - CSS will handle the truncation properly
      descriptionElement.textContent = shortText;
      
      // Add stack icons if present
      const stackContainer = document.createElement('div');
      stackContainer.classList.add('stack-icons');
      
      if (project.stack && project.stack.length > 0) {
        const visibleStack = project.stack.slice(0, 4); // Show only top 4
        
        visibleStack.forEach(tech => {
          const stackTag = document.createElement('span');
          stackTag.classList.add('stack-icon');
          stackTag.textContent = tech;
          stackContainer.appendChild(stackTag);
        });
        
        if (project.stack.length > 4) {
          const moreLabel = document.createElement('span');
          moreLabel.classList.add('stack-icon');
          moreLabel.textContent = `+${project.stack.length - 4}`;
          stackContainer.appendChild(moreLabel);
        }
      }
      
      // Button container with explicit click handling
      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('carousel-card-footer');
      
      // Create the view button - only this should be clickable
      const viewButton = document.createElement('md-filled-button');
      viewButton.classList.add('open-modal-btn');
      viewButton.textContent = 'View Project';
      viewButton.addEventListener('click', () => {
        window.location.href = `projects.html?showProject=${project.id || project.title.replace(/\s+/g, '-').toLowerCase()}`;
      });
      
      buttonContainer.appendChild(viewButton);
      
      // Add all elements to card
      cardDiv.appendChild(titleElement);
      cardDiv.appendChild(descriptionElement);
      cardDiv.appendChild(stackContainer);
      cardDiv.appendChild(buttonContainer);
      
      cardElement.appendChild(cardDiv);
      projectCardGrid.appendChild(cardElement);
    });

  } catch (error) {
    console.error("Error loading projects for card grid:", error);
  }
}

// Function to update subheading based on toggle state
function updateSubheading() {
  const showcaseSubheading = document.querySelector('.hero-carousel .section-subheading');
  if (showcaseSubheading) {
    if (showMermaidProjects) {
      showcaseSubheading.innerHTML = "These projects all have MermaidJS-powered <strong>Entity Relation</strong> diagrams you can explore.";
    } else {
      showcaseSubheading.innerHTML = "These projects have images of mockups and other tidbits uploaded for your perusal.";
    }
  }
}

// Add a listener for theme changes to update cards if needed
function setupThemeChangeListener() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class' && 
          mutation.target === document.body) {
        console.log('Body class changed - theme may have changed');
        // You could add additional updates here if needed
      }
    });
  });
  
  observer.observe(document.body, { attributes: true });
}

// Listen for project type toggle events - move this to affect carousel
document.addEventListener('project-type-change', (event) => {
  showMermaidProjects = event.detail.showMermaid;
  console.log('Project type changed:', showMermaidProjects ? 'Mermaid' : 'Photos');
  
  // Update subheading text based on toggle state
  updateSubheading();
  
  // Reload carousel with filtered projects
  loadCarouselProjects(); // Only reload carousel, not the feature cards
});

// Make sure we don't duplicate initialization if called multiple ways
let initialized = false;
document.addEventListener('DOMContentLoaded', () => {
  if (!initialized) {
    initialized = true;
    
    // Check localStorage for saved preference
    const savedPreference = localStorage.getItem('projectToggle');
    if (savedPreference) {
      showMermaidProjects = savedPreference === 'mermaid';
    }
    
    // Update subheading text based on initial toggle state
    updateSubheading();
    
    loadCarouselProjects();
    loadProjectCards();
    setupThemeChangeListener();
  }
});
