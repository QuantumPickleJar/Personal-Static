console.log('Front page carousel script executing');

// Export a function that can be called from main.js
export function initCarousel() {
  console.log('Initializing carousel from exported function');
  loadProjectCards();
  loadCarouselProjects();
}

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

    // Filter projects that have images
    const projectsWithImages = projects.filter(project => project.images && project.images.length > 0);
    console.log('Projects with images:', projectsWithImages.length);

    if (projectsWithImages.length === 0) {
      console.warn("No projects with images found");
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
    const limitedProjects = projectsWithImages.slice(0, 5);

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
      cardHeader.classList.add("carousel-card-header");
      cardHeader.textContent = project.title;
      
      const cardBody = document.createElement("div");
      cardBody.classList.add("carousel-card-body");
      cardBody.textContent = project.shortForm || 
        (project.description ? project.description.substring(0, 100) + "..." : "No description available");
      
      const cardFooter = document.createElement("div");
      cardFooter.classList.add("carousel-card-footer");
      cardFooter.textContent = project.stack ? project.stack.join(", ") : "";
      
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

    // Clear existing content (except the first card which can serve as template)
    // Optional: remove if you want to keep the example card
    projectCardGrid.innerHTML = '';

    // Limit to 3 (or your preferred number) featured projects
    const featuredProjects = projects.slice(0, 3);

    // Populate the project card grid
    featuredProjects.forEach((project) => {
      const cardElement = document.createElement('md-elevated-card');
      
      const cardDiv = document.createElement('div');
      cardDiv.classList.add('carousel-card');
      
      const cardHeader = document.createElement('div');
      cardHeader.classList.add('carousel-card-header');
      cardHeader.textContent = project.title;
      
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
        // Redirect to projects page with project ID in query parameter
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

// Make sure we don't duplicate initialization if called multiple ways
let initialized = false;
document.addEventListener('DOMContentLoaded', () => {
  if (!initialized) {
    initialized = true;
    loadCarouselProjects();
    loadProjectCards();
    setupThemeChangeListener();
  }
});
