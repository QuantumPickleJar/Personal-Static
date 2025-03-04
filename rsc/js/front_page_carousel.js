console.log('Front page carousel script executing');

// Export a function that can be called from main.js
export function initCarousel() {
  console.log('Initializing carousel from exported function');
  debugger; // Add breakpoint here
  loadCarouselProjects();
}
// Also execute immediately for backwards compatibility
loadCarouselProjects();

async function loadCarouselProjects() {
  const carouselInner = document.querySelector("#carouselContainer .carousel-inner");
  if (!carouselInner) {
      console.error("Carousel container not found");
      return;
  }

  try {
      console.log('Fetching projects.json for carousel');
      // Add explicit path with leading slash to ensure correct resolution
      const response = await fetch("/rsc/json/projects.json");
      if (!response.ok) {
          console.error(`Failed to fetch projects.json: ${response.status} ${response.statusText}`);
          throw new Error("Failed to fetch projects.json");
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

      // Add CSS to ensure carousel styling matches project cards
      const style = document.createElement('style');
      style.textContent = `
        .carousel-card {
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          height: 200px;  /* Reduced height */
          margin: 10px auto;
          width: 95%;     /* Take up most of the container width */
          max-width: 900px; /* Maximum width */
          display: flex;
          flex-direction: column;
        }
        
        .carousel-card-header {
          background-color: #f0f0f0;
          padding: 10px;
          text-align: center;
          font-weight: bold;
          height: 15%;   /* Adjusted for better proportions */
        }
        
        .carousel-card-body {
          padding: 10px;
          height: 65%;    /* Increased to give more space to content */
          overflow: hidden;
          line-height: 1.4;
        }
        
        .carousel-card-footer {
          background-color: #f0f0f0;
          padding: 10px;
          text-align: center;
          font-size: 0.8em;
          height: 20%;
        }
        
        .carousel-img {
          width: 100%;
          height: auto;
          max-height: 150px;
          object-fit: contain;
        }
        
        /* Make the carousel container wider */
        #carouselContainer {
          width: 90%;
          margin: 20px auto;
        }
        
        /* Adjust arrow positions for wider carousel */
        .carousel-control-prev {
          left: -30px;
        }
        
        .carousel-control-next {
          right: -30px;
        }
      `;
      document.head.appendChild(style);

      // Limit to 5 projects as specified
      const limitedProjects = projectsWithImages.slice(0, 5);
      console.log('Limited to 5 projects for carousel display');

      // Clear existing content in carousel
      carouselInner.innerHTML = "";

      // Populate the carousel with project cards (not just images)
      limitedProjects.forEach((project, index) => {
          console.log(`Creating carousel item ${index} for project: ${project.title}`);
          
          const carouselItem = document.createElement("div");
          carouselItem.classList.add("carousel-item");
          if (index === 0) {
              carouselItem.classList.add("active");
          }

          // Create a card-like display for the carousel
          const cardDiv = document.createElement("div");
          cardDiv.classList.add("carousel-card");
          
          // Create card header with title
          const cardHeader = document.createElement("div");
          cardHeader.classList.add("carousel-card-header");
          cardHeader.textContent = project.title;
          
          // Create card body with description
          const cardBody = document.createElement("div");
          cardBody.classList.add("carousel-card-body");
          cardBody.textContent = project.shortForm || project.description.substring(0, 100) + "...";
          
          // Create card footer with stack
          const cardFooter = document.createElement("div");
          cardFooter.classList.add("carousel-card-footer");
          cardFooter.textContent = project.stack ? project.stack.join(", ") : "";
          
          // Assemble card
          cardDiv.appendChild(cardHeader);
          cardDiv.appendChild(cardBody);
          cardDiv.appendChild(cardFooter);
          
          carouselItem.appendChild(cardDiv);
          carouselInner.appendChild(carouselItem);
          
          console.log(`Added carousel item for ${project.title}`);
          debugger; // Add breakpoint here
      });

      console.log('Initializing Bootstrap carousel');
      // Initialize Bootstrap carousel with error handling
      try {
          if (typeof bootstrap !== 'undefined') {
              new bootstrap.Carousel(document.getElementById('carouselContainer'), {
                  interval: 5000,
                  wrap: true
              });
          } else {
              console.error('Bootstrap not available - carousel will not function');
          }
      } catch (error) {
          console.error('Error initializing Bootstrap carousel:', error);
      }

  } catch (error) {
      console.error("Error loading projects for carousel:", error);
  }
}
