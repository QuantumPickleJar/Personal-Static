console.log('Front page carousel script executing');

// Import the stack icon renderer
import { renderOneStackIcon } from './stackIconLoader.js';

// Export a function that can be called from main.js
export function initCarousel() {
  console.log('Initializing carousel from exported function');
  loadProjectCards();
  loadCarouselProjects();
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
        (project.description ? project.description.substring(0, 100) + "..." : "No description available");
      
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

    // Add additional styling for carousel stack icons
    if (!document.getElementById('stack-icon-styles')) {
      const stackStyles = document.createElement('style');
      stackStyles.id = 'stack-icon-styles';
      stackStyles.textContent = `
        .stack-icons-container {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 12px;
          align-items: center;
          width: 100%;
        }
        
        .carousel-stack-icon {
          transform: scale(1);
          margin-bottom: 8px;
        }
        
        .carousel-stack-icon .stack-image {
          width: 28px;
          height: 28px;
          object-fit: contain;
          display: block;
          margin: 0 auto 4px;
        }
        
        .carousel-stack-icon .stack-label {
          font-size: 0.75rem;
          max-width: 70px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: center;
        }
        
        .stack-item-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 50px;
          margin-right: 0;
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 6px;
          padding: 6px 4px;
          background-color: rgba(255,255,255,0.5);
        }
        
        body.dark-mode .stack-item-container {
          border-color: rgba(255,255,255,0.1);
          background-color: rgba(40,40,40,0.5);
        }
        
        .more-stack-label {
          font-size: 0.8rem;
          color: #666;
          align-self: center;
          margin-left: 8px;
          padding: 4px 8px;
          border-radius: 12px;
          background-color: #f0f0f0;
        }
        
        body.dark-mode .more-stack-label {
          color: #ccc;
          background-color: #333;
        }
        
        .carousel-card-footer {
          margin-top: auto;
          padding-top: 1rem;
          font-size: 0.85rem;
          color: #666;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }
        
        body.dark-mode .carousel-card-footer {
          color: #aaa;
          border-top-color: rgba(255, 255, 255, 0.05);
        }
      `;
      document.head.appendChild(stackStyles);
    }

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
      
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('carousel-card');
      
      const cardHeader = document.createElement('div');
      cardHeader.classList.add('carousel-card-header', 'project-title-link');
      cardHeader.textContent = project.title;
      cardHeader.style.cursor = "pointer";
      // Make the title clickable to navigate to project page
      cardHeader.addEventListener("click", () => {
        window.location.href = `projects.html?showProject=${project.id || project.title.replace(/\s+/g, '-').toLowerCase()}`;
      });
      
      const cardBody = document.createElement('div');
      cardBody.classList.add('carousel-card-body');
      cardBody.textContent = project.shortForm || 
        (project.description ? project.description.substring(0, 120) + "..." : "No description available");
      
      const spacer = document.createElement('div');
      spacer.classList.add('spacer');
      
      const cardFooter = document.createElement('div');
      cardFooter.classList.add('carousel-card-footer');
      
      const viewButton = document.createElement('md-filled-button');
      viewButton.textContent = 'View Project';
      viewButton.addEventListener('click', () => {
        window.location.href = `projects.html?showProject=${project.id || project.title.replace(/\s+/g, '-').toLowerCase()}`;
      });
      
      cardFooter.appendChild(viewButton);
      
      cardDiv.appendChild(cardHeader);
      cardDiv.appendChild(cardBody);
      cardDiv.appendChild(spacer);
      cardDiv.appendChild(cardFooter);
      
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
