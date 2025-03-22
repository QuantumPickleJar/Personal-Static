console.log('Front page carousel script executing');

// Export a function that can be called from main.js
export function initCarousel() {
  console.log('Initializing carousel from exported function');
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
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          height: 200px;
          margin: 10px auto;
          width: 95%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
        }
        
        .carousel-card-header {
          background-color: #f0f0f0;
          padding: 10px;
          text-align: center;
          font-weight: bold;
          height: 15%;
        }
        
        .carousel-card-body {
          padding: 10px;
          height: 65%;
          overflow: hidden;
          line-height: 1.4;
        }
        
        .carousel-card-footer {
          background-color: #f0f0f0;
          padding: 8px 4px 0;
          text-align: center;
          font-size: 0.8em;
          height: 20%;
        }
        
        #carouselContainer {
          width: 90%;
          margin: 20px auto;
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

// Make sure we don't duplicate initialization if called multiple ways
let initialized = false;
document.addEventListener('DOMContentLoaded', () => {
  if (!initialized) {
    initialized = true;
    loadCarouselProjects();
  }
});
