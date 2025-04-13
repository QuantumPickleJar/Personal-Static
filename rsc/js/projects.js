import * as bootstrap from 'bootstrap'; // Added to import Bootstrap module
import { initPagination } from './pagination.js';
import { getPlaceholderForStack,  } from './placeholderBuilder.js';
import { filterProjByTitle, filterByDate, createTruncatedSpan } from './gallery-sorting.js';
import { getIcon, renderOneStackIcon } from './stackIconLoader.js';
import { filterProjectsBySearchTerm } from './search.js';
import { projectsPerPage } from './perPageSettings.js';
import { parseMermaidCode } from './json-parser.js';
import panzoom from 'panzoom';
import mermaid from 'mermaid';
window.mermaid = mermaid;

export let allProjects = []; // stored projects go here
const MAX_STACK_CHARS = 20; // Adjust this value to your needs

mermaid.initialize({ startOnLoad: false });

document.addEventListener('DOMContentLoaded', function() {
  // Only initialize projects if we're on the projects page
  if (document.getElementById('projectsGallery')) {
    console.log('Projects gallery found, initializing projects');
    initializeProjects();
    
    // Check if we should open a specific project modal
    const urlParams = new URLSearchParams(window.location.search);
    const projectToShow = urlParams.get('showProject');
    if (projectToShow) {
      // Wait for projects to load before opening modal
      setTimeout(() => {
        openProjectModal(projectToShow);
      }, 500); // Short delay to ensure projects are loaded
    }
  } else {
    console.log('No projects gallery found, skipping initialization');
  }
});


/** Fetch projects.json and render gallery */
export function loadProjects() {
  console.log('Loading projects...');
  
  // Add path resolution for GitHub Pages
  const basePath = window.location.hostname.includes('github.io') ? 
    '/Personal-Static/' : '/';
  
  // Try multiple paths to ensure correct loading
  const pathsToTry = [
    `${basePath}rsc/json/projects.json`,
    './rsc/json/projects.json',
    '/rsc/json/projects.json',
    'rsc/json/projects.json'
  ];
  
  return tryFetchPaths(pathsToTry)
    .then(data => {
      console.log(`Projects data received: ${data.length} items`);
      allProjects = data;
      return data;
    })
    .catch(error => {
      console.error('Project loading error:', error);
      const gallery = document.getElementById('projectsGallery');
      if (gallery) {
        gallery.innerHTML = 
          `<div class="error">Failed to load projects: ${error.message}</div>`;
      }
      return [];
    });
}

// Helper function to try multiple paths
async function tryFetchPaths(paths) {
  for (const path of paths) {
    try {
      console.log(`Trying to fetch from: ${path}`);
      const response = await fetch(path);
      if (response.ok) {
        console.log(`Successfully loaded from: ${path}`);
        return response.json();
      }
    } catch (e) {
      console.log(`Failed attempt with path: ${path}`);
    }
  }
  throw new Error('All paths failed');
}

/** Render the gallery with a given array of projects */
export function renderProjectsGallery(projects) {
  const gallery = document.getElementById("projectsGallery");
  const template = document.getElementById("projectCardTemplate");

  if (!gallery || !template) {
    console.error('Gallery or template not found in DOM');
    return;
  }

  gallery.innerHTML = ""; // clear

  projects.forEach(project => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector("md-elevated-card");
    
    // Ensure the project-card class is added
    if (card && !card.classList.contains('project-card')) {
      card.classList.add('project-card');
    }

    if (card) {
      card.dataset.projectId = project.id;
    }

    const thumbnail = clone.querySelector(".project-thumbnail");
    if (thumbnail) {
      thumbnail.src = project.thumbnail || "rsc/images/placeholder.png";
      thumbnail.alt = `Image for ${project.title}`;
    }

    // Set the project title
    const titleElement = clone.querySelector(".project-title");
    if (titleElement) {
      titleElement.textContent = project.title;
    }
    
    // Set the short form description
    const shortFormElement = clone.querySelector(".short-form-truncated");
    if (shortFormElement) {
      shortFormElement.textContent = project.shortForm || "";
    }

    // Handle date label if present
    const dateLabel = clone.querySelector(".date-label");
    if (dateLabel) {
      // Set the date content
      dateLabel.textContent = project.dates || "";
      // Also set data-tooltip attribute for hover functionality
      dateLabel.setAttribute('data-tooltip', project.dates || "");
    }

    // Handle academic label if present
    const academicLabel = clone.querySelector(".academic-label");
    if (academicLabel) {
      if (project.academic) {
        academicLabel.textContent = "Academic";
        academicLabel.classList.add("academic");
      } else {
        academicLabel.textContent = "Personal";
        academicLabel.classList.add("personal");
      }
      
      // Make sure academic label is visible (might be hidden if toggled before)
      academicLabel.style.display = '';
      
      // Set up hover effect for date label
      academicLabel.addEventListener('mouseenter', () => {
        if (dateLabel) {
          dateLabel.style.opacity = '1';
        }
      });
      
      academicLabel.addEventListener('mouseleave', () => {
        if (dateLabel) {
          // Use a short delay to allow moving mouse to the date label
          setTimeout(() => {
            if (!dateLabel.matches(':hover')) {
              dateLabel.style.opacity = '0';
            }
          }, 100);
        }
      });
      
      // Allow date label to keep itself visible when hovered directly
      if (dateLabel) {
        dateLabel.addEventListener('mouseenter', () => {
          dateLabel.style.opacity = '1';
        });
        
        dateLabel.addEventListener('mouseleave', () => {
          dateLabel.style.opacity = '0';
        });
      }
    }

    // Stack icons
    const stackIcons = clone.querySelector(".stack-icons");
    if (stackIcons && Array.isArray(project.stack)) {
      stackIcons.innerHTML = "";
      project.stack.forEach(tech => {
        const iconSpan = document.createElement("span");
        iconSpan.classList.add("stack-icon");
        iconSpan.textContent = tech;
        stackIcons.appendChild(iconSpan);
      });
    }

    // Images badge
    const imageIcon = clone.querySelector(".image-count-icon");
    if (project.images && project.images.length > 0 && imageIcon) {
      imageIcon.style.display = "flex";
      imageIcon.querySelector(".count").textContent = project.images.length;
    }
    
    // Mermaid badge
    const mermaidIcon = clone.querySelector(".mermaid-icon");
    if (mermaidIcon && project.mermaid && project.mermaid.trim()) {
      mermaidIcon.style.display = "block";
    }

    // Make the entire card clickable to open the modal
    if (card) {
      card.addEventListener('click', (e) => {
        // Check if the click was on the button (to avoid double event firing)
        if (!e.target.closest('.open-modal-btn')) {
          console.log('Card clicked for project:', project.id);
          openProjectModal(project.id);
        }
      });
    }

    // Also add the modal handler to the button specifically
    const modalButton = clone.querySelector(".open-modal-btn");
    if (modalButton) {
      modalButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent the card click event from firing
        console.log('Button clicked for project:', project.id);
        openProjectModal(project.id);
      });
    }

    gallery.appendChild(clone);
  });

  console.log(`Rendered ${projects.length} projects in the gallery`);
}


// Helper function to setup tooltips
function setupTooltipEvents(element, tooltipText = null) {
  element.addEventListener('mouseover', () => {
    let tooltip = element.querySelector('.tooltip-date');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip-date';
      tooltip.innerHTML = `<span style="color:white; display:inline-block;">${tooltipText || element.dataset.tooltip}</span>`;
      tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      tooltip.style.padding = '5px 8px';
      tooltip.style.zIndex = '100';
      element.appendChild(tooltip);
      void tooltip.offsetWidth;
    }
    tooltip.classList.add('visible');
  });
  
  element.addEventListener('mouseout', () => {
    const tooltip = element.querySelector('.tooltip-date');
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  });
}

// Helper function to setup badges
function setupBadges(card, project) {
  const badgeContainer = card.querySelector('.badge-container');
  
  // Setup image count badge
  const imageCountIcon = badgeContainer.querySelector('.image-count-icon');
  if (project.images && project.images.length > 1) {
    imageCountIcon.style.display = 'block';
    imageCountIcon.querySelector('.count').textContent = project.images.length;
  }
  
  // Setup mermaid badge
  const mermaidIcon = badgeContainer.querySelector('.mermaid-icon');
  if (project.mermaid && project.mermaid.trim()) {
    mermaidIcon.style.display = 'block';
  }
}

// Helper function to setup stack icons
function setupStackIcons(container, stack) {
  const template = document.getElementById('stackItemTemplate');
  const moreTemplate = document.getElementById('moreStackTemplate');
  
  const { items, remaining } = getVisibleStackItems(stack);
  
  items.forEach(tech => {
    const techSpan = template.content.cloneNode(true).querySelector('.stack-icon');
    techSpan.textContent = tech;
    container.appendChild(techSpan);
  });
  
  if (remaining > 0) {
    const moreLink = moreTemplate.content.cloneNode(true).querySelector('.more-link');
    moreLink.textContent = `+${remaining} more`;
    moreLink.addEventListener('click', e => {
      e.stopPropagation();
      expandStack(container, stack, items.length, moreLink);
    });
    container.appendChild(moreLink);
  }
}

function buildDateTooltip(dates) {
  if (!dates) {
    return "No date info available.";
  }

  // Fallback to "N/A" if any field is missing/blank
  const started = dates.started || "N/A";
  const modified = dates.modified || "N/A";
  // Some projects use "released" instead of "completed" – adapt as needed
  const completed = dates.completed || dates.released || "N/A";

  // For multiline in HTML, use <br>, or do a small template with divs
  return `
    <div>
      <strong>Started:</strong> ${started}<br>
      <strong>Modified:</strong> ${modified}<br>
      <strong>Completed:</strong> ${completed}
    </div>
  `;
}



// E/xpand stack icons 
function expandStack(container, stackArray, max, linkElement) {
  container.removeChild(linkElement);
  stackArray.slice(max).forEach(tech => {
    const techSpan = document.createElement('span');
    techSpan.classList.add('stack-icon');
    techSpan.textContent = tech;
    container.appendChild(techSpan);
  });

  // Find the parent project card
  const projectCard = container.closest('.project-card');
  if (projectCard) {
    // Find the academic label within this card
    const academicLabel = projectCard.querySelector('.academic-label');
    if (academicLabel) {
      // Toggle visibility
      if (academicLabel.style.display === 'none') {
        academicLabel.style.display = '';
      } else {
        academicLabel.style.display = 'none';
      }
    }
  }
}


function showImagesInModal(project) {
  const modalImages = document.getElementById('modalImages');
  
  // Reset views - hide all containers first
  modalImages.classList.remove('mermaid-view');
  modalImages.classList.add('images-view');
  
  const carousel = document.getElementById('projectImageCarousel');
  const fallbackPlaceholder = modalImages.querySelector('.fallback-placeholder');
  const mermaidContainer = document.getElementById('mermaidContainer');
  const noMermaidMsg = modalImages.querySelector('.no-mermaid');
  
  // Hide all elements (with null checks)
  if (carousel) carousel.style.display = 'none';
  if (fallbackPlaceholder) fallbackPlaceholder.style.display = 'none';
  if (mermaidContainer) mermaidContainer.style.display = 'none';
  if (noMermaidMsg) noMermaidMsg.style.display = 'none';
  
  // Handle project with images
  if (project.images && project.images.length > 0 && carousel) {
    const carouselInner = carousel.querySelector('.carousel-inner');
    if (carouselInner) {
      carouselInner.innerHTML = '';
      
      const template = document.getElementById('carouselItemTemplate');
      
      project.images.forEach((imgSrc, index) => {
        const carouselItem = template.content.cloneNode(true).querySelector('.carousel-item');
        if (index === 0) carouselItem.classList.add('active');
        
        const img = carouselItem.querySelector('img');
        const anchor = carouselItem.querySelector('a');
        
        const finalSrc = imgSrc.startsWith('rsc/') || imgSrc.startsWith('http')
          ? imgSrc
          : imgSrc.includes('/')
            ? `rsc/images/${imgSrc}`
            : `rsc/images/recipes/${imgSrc}`;
            
        anchor.href = finalSrc;
        // Add these attributes for simple link behavior
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        
        // Remove data-lightbox attribute if not using a lightbox library
        anchor.removeAttribute('data-lightbox');
        
        img.src = finalSrc;
        img.alt = `Project image ${index + 1}`;
        
        // Ensure the image has proper styling
        img.style.maxHeight = '350px'; // Set max height
        img.style.width = 'auto';      // Allow width to adjust proportionally
        img.style.margin = '0 auto';   // Center the image
        img.style.objectFit = 'contain'; // Ensure the image is fully visible
        
        carouselInner.appendChild(carouselItem);
      });
      
      carousel.style.display = 'block';
      carousel.style.maxHeight = '375px'; // Maintain outer container height
      modalImages.style.display = 'block'; // Ensure modalImages is displayed as block
      
      // Properly initialize the carousel
      try {
        // Ensure any existing carousel is disposed first
        bootstrap.Carousel.getInstance(carousel)?.dispose();
        new bootstrap.Carousel(carousel, { interval: false, wrap: true });
        
        // Add this block to initialize lightbox after carousel is set up
        setTimeout(() => {
          // If you're using lightbox2
          if (window.lightbox) {
            window.lightbox.option({
              'resizeDuration': 200,
              'wrapAround': true,
              'alwaysShowNavOnTouchDevices': true,
              'disableScrolling': true
            });
          }
          
          // If you're using another lightbox library like SimpleLightbox
          // Adjust based on the actual library you're using
          const lightboxLinks = carousel.querySelectorAll('a[data-lightbox]');
          lightboxLinks.forEach(link => {
            // Pre-fetch the image to prevent loading delay when clicking
            const img = new Image();
            img.src = link.href;
            
            // Make sure the link opens properly
            link.addEventListener('click', (e) => {
              e.preventDefault();
              // If you're not using lightbox2, you may need to initialize your
              // specific lightbox library here
              if (!window.lightbox) {
                window.open(link.href, '_blank');
              }
            });
          });
        }, 200);
      } catch (e) {
        console.warn('Error initializing carousel or lightbox:', e);
      }
    }
  } else {
    // Show fallback placeholder
    const placeholderImg = fallbackPlaceholder.querySelector('img');
    if (placeholderImg) {
      placeholderImg.src = getPlaceholderForStack(project);
      placeholderImg.style.maxHeight = '350px';
      placeholderImg.style.width = 'auto';
    }
    fallbackPlaceholder.style.display = 'block';
    modalImages.style.display = 'flex';
    modalImages.style.justifyContent = 'center';
    modalImages.style.alignItems = 'center';
  }
}

function showMermaidDiagramInModal(project) {
  const modalImages = document.getElementById('modalImages');
  const mermaidContainer = document.getElementById('mermaidContainer');
  const carousel = document.getElementById('projectImageCarousel');
  const fallbackPlaceholder = modalImages.querySelector('.fallback-placeholder');
  const noMermaidMsg = modalImages.querySelector('.no-mermaid');
  
  // Hide other elements with null checks
  if (carousel) carousel.style.display = 'none';
  if (fallbackPlaceholder) fallbackPlaceholder.style.display = 'none';
  
  // Update view classes
  modalImages.classList.remove('images-view');
  modalImages.classList.add('mermaid-view');
  modalImages.style.display = 'block';
  
  // Get and validate mermaid code
  const mermaidCode = parseMermaidCode(project);
  if (!mermaidCode || !mermaidCode.trim()) {
    if (mermaidContainer) mermaidContainer.style.display = 'none';
    if (noMermaidMsg) noMermaidMsg.style.display = 'block';
    return;
  }
  
  // Clear and prepare the mermaid container
  if (mermaidContainer) {
    // Important: Create a new div for mermaid to avoid issues with reinitialization
    mermaidContainer.innerHTML = '';
    const innerMermaid = document.createElement('div');
    innerMermaid.className = 'mermaid';
    innerMermaid.textContent = mermaidCode;
    mermaidContainer.appendChild(innerMermaid);
    mermaidContainer.style.display = 'block';
    
    // Use a timeout to ensure the DOM is updated before mermaid processes it
    setTimeout(() => {
      try {
        // Reset mermaid to avoid issues with previous renders
        if (window.mermaid) {
          window.mermaid.initialize({ 
            startOnLoad: false,
            securityLevel: 'loose' // This helps with SVG rendering
          });
          
          window.mermaid.init(undefined, innerMermaid).then(() => {
            console.log("Mermaid diagram rendered successfully");
            
            // Apply panzoom with a delay to ensure the SVG is fully rendered
            setTimeout(() => {
              try {
                const svgElement = innerMermaid.querySelector('svg');
                if (svgElement) {
                  // Add a border to make the diagram more visible
                  svgElement.style.border = '1px solid #ddd';
                  svgElement.style.borderRadius = '4px';
                  svgElement.style.padding = '10px';
                  
                  // Make sure SVG takes available space
                  svgElement.style.width = '100%';
                  svgElement.style.height = 'auto';
                  
                  // Apply panzoom
                  panzoom(svgElement, {
                    smoothScroll: false,
                    maxZoom: 5,
                    minZoom: 0.5,
                    boundsPadding: 0.1
                  });
                }
              } catch (pzError) {
                console.error("Panzoom error:", pzError);
              }
            }, 300);
          }).catch(error => {
            console.error("Mermaid initialization error:", error);
            innerMermaid.textContent = "Error rendering diagram. Check your mermaid syntax.";
            innerMermaid.style.color = "red";
          });
        } else {
          console.error("Mermaid library not available");
          innerMermaid.textContent = "Mermaid library failed to load.";
          innerMermaid.style.color = "red";
        }
      } catch (err) {
        console.error('Error initializing Mermaid:', err);
        innerMermaid.textContent = "Error rendering diagram: " + err.message;
        innerMermaid.style.color = "red";
      }
    }, 200);
  }
}

function setupModalToggleFABs(project) {
  const currentProject = project;
  // Remove any existing FAB container if necessary
  const existingFAB = document.querySelector('.fab-container');
  if (existingFAB) {
    existingFAB.remove();
  }
  
  // Create the container for the FABs.
  const fabContainer = document.createElement('div');
  fabContainer.className = 'fab-container';

  // Create Images FAB.
  const imagesFab = document.createElement('button');
  imagesFab.className = 'fab toggle-images';
  imagesFab.innerHTML = '<img src="rsc/images/fab-image-icon.png" alt="Images" style="width:24px; height:24px;">';
  // -- Add selected class by default --
  imagesFab.classList.add('selected');

  // Create Mermaid FAB with initial disabled state
  const mermaidFab = document.createElement('button');
  mermaidFab.className = 'fab toggle-mermaid';
  const basePath = window.location.hostname.includes('github.io') ? 
    '/Personal-Static/' : '/';
  
  // Update the img src with proper path
  mermaidFab.innerHTML = `<img src="${basePath}rsc/images/stack/MermaidJS.png" alt="Mermaid Diagram" />`;
  // Ensure absolute positioning for tooltip is relative to mermaidFab
  mermaidFab.style.position = 'relative';
  
  if (!project.mermaid || !project.mermaid.trim()) {
    mermaidFab.setAttribute('disabled', 'true');
    mermaidFab.classList.add('disabled');
  }

  // Attach tooltip on click for the mermaid FAB.
  mermaidFab.addEventListener('click', () => {
    // Only show tooltip if project has mermaid content
    let tooltip = mermaidFab.querySelector('.fab-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'fab-tooltip';
      tooltip.textContent = 'drag and scroll to explore the ERD';
      mermaidFab.appendChild(tooltip);
      
      // Compute and set the tooltip's position relative to mermaidFab
      const tooltipHeight = tooltip.offsetHeight || 30; // default if not rendered yet
      tooltip.style.position = 'absolute';
      tooltip.style.top = `-${tooltipHeight + 5}px`; // 5px above mermaidFab
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.zIndex = '20000';
      
      // Force a reflow so the transition works.
      void tooltip.offsetWidth;
      tooltip.classList.add('show');
      
      // After 3 seconds, fade out and remove the tooltip.
      setTimeout(() => {
        tooltip.classList.remove('show');
        setTimeout(() => {
          tooltip.remove();
        }, 500);
      }, 3000);
    }
  });
  
  // Remove tooltip if mouse leaves mermaidFab
  mermaidFab.addEventListener('mouseleave', () => {
    const tooltip = mermaidFab.querySelector('.fab-tooltip');
    if (tooltip) {
      setTimeout(() => {
        tooltip.remove();
      }, 500);
    }
  });

  // Toggle event listeners.
  imagesFab.addEventListener('click', () => {
    imagesFab.classList.add('selected');
    mermaidFab.classList.remove('selected');
    showImagesInModal(currentProject);
  });
  mermaidFab.addEventListener('click', () => {
    if (!mermaidFab.disabled) {  // Only execute if not disabled
      mermaidFab.classList.add('selected');
      imagesFab.classList.remove('selected');
      showMermaidDiagramInModal(currentProject);
      // (Tooltip code above handles the bubble.)
    }
  });

  // Append buttons to the container.
  fabContainer.appendChild(imagesFab);
  fabContainer.appendChild(mermaidFab);

  // Insert the container into the modal; for example, right after the vertical stack.
  const modalStack = document.getElementById('modalStack');
  if (modalStack && modalStack.parentNode) {
    modalStack.parentNode.insertBefore(fabContainer, modalStack.nextSibling);
  }
}

// Handles the FAB transitions between mermaid and image mode
function initializeFABs(project) {
  // Get references to elements
  const modalTop = document.querySelector('.modal-top');
  const mermaidFab = document.querySelector('.toggle-mermaid');
  const imagesFab = document.querySelector('.toggle-images');
  const modalImages = document.getElementById('modalImages');
  
  // Skip if no mermaid diagram
  if (!project.mermaid || !project.mermaid.trim()) {
    if (mermaidFab) mermaidFab.classList.add('disabled');
    return;
  }
  
  // Initially selected state is images
  let currentView = 'images';
  
  // Handle mermaid FAB click
  if (mermaidFab) {
    mermaidFab.addEventListener('click', () => {
      if (currentView === 'images' && !mermaidFab.classList.contains('disabled')) {
        // First, add the expanded class to change the layout
        modalTop.classList.add('mermaid-expanded');
        
        // Hide the tech stack heading instead of changing text
        const stackHeading = document.querySelector('.modal-section-heading');
        if (stackHeading) {
          // Store original visibility state for later restoration
          stackHeading.classList.add('heading-hidden');
        }
        
        // Hide images container
        const element = modalImages.querySelector('#projectImageCarousel, .fallback-placeholder');
        if (element) {
          element.style.display = 'none';
        }
                
        // Update selected state
        mermaidFab.classList.add('selected');
        imagesFab.classList.remove('selected');
        currentView = 'mermaid';
        
        // Wait for the animation to complete before showing mermaid
        setTimeout(() => {
          // Now show/initialize the mermaid diagram
          showMermaidDiagramInModal(project);
        }, 300); // Match transition duration
      }
    });
  }
  
  // Handle images FAB click
  if (imagesFab) {
    imagesFab.addEventListener('click', () => {
      if (currentView === 'mermaid') {
        // First hide the mermaid container
        const mermaidContainer = document.getElementById('mermaidContainer');
        if (mermaidContainer) {
          mermaidContainer.style.display = 'none';
        }
        
        // Start the animation to revert layout
        modalTop.classList.remove('mermaid-expanded');
        
        // Restore the tech stack heading visibility
        const stackHeading = document.querySelector('.modal-section-heading');
        if (stackHeading) {
          stackHeading.classList.remove('heading-hidden');
        }
        
        // Wait for animation to complete before showing images
        setTimeout(() => {
          // Show images after animation completes
          showImagesInModal(project);
          
          // Update selected state
          imagesFab.classList.add('selected');
          mermaidFab.classList.remove('selected');
          currentView = 'images';
        }, 300); // Match transition duration
      }
    });
  }
}

export function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }

  const modal = document.getElementById('projectModal');
  if (!modal) {
    console.warn('Modal not found in DOM. Loading modal and retrying...');
    // Modal may not be loaded yet, try to load it and then retry
    loadProjectModal().then(() => {
      // After loading, retry opening with a small delay to ensure DOM updates
      setTimeout(() => openProjectModal(projectId), 100);
    });
    return;
  }

  console.log('Opening modal for project:', project.title);
  modal.style.display = 'block';
  
  // Set modal title and description
  document.getElementById('modalTitle').textContent = project.title;
  document.getElementById('modalDescription').textContent = project.description || "No description available.";
  
  // Set project status if available
  const statusElement = document.getElementById('projectStatus');
  if (statusElement) {
    statusElement.textContent = project.status ? `Status: ${project.status}` : "";
  }
  
  // Set project type (academic or not)
  const typeElement = document.getElementById('projectType');
  if (typeElement) {
    typeElement.textContent = project.academic ? "Academic Project" : "Personal Project";
  }
  
  // Set project dates if available
  const datesElement = document.getElementById('projectDates');
  if (datesElement && project.dates) {
    datesElement.textContent = `Dates: ${project.dates}`;
  }
  
  // Clear and populate tech stack
  const stackContainer = document.getElementById('modalStack');
  if (stackContainer) {
    stackContainer.innerHTML = '';
    if (project.stack && project.stack.length > 0) {
      project.stack.forEach(tech => {
        try {
          const icon = renderOneStackIcon(tech);
          if (icon) {
            stackContainer.appendChild(icon);
          }
        } catch (e) {
          console.warn(`Failed to render stack icon for ${tech}:`, e);
          const fallback = document.createElement('div');
          fallback.className = 'stack-item';
          fallback.textContent = tech;
          stackContainer.appendChild(fallback);
        }
      });
    } else {
      const noStack = document.createElement('p');
      noStack.textContent = "No tech stack information available";
      stackContainer.appendChild(noStack);
    }
  }
  
  // Display images or mermaid diagram
  showImagesInModal(project);
  
  // Setup FABs (Floating Action Buttons)
  setupModalToggleFABs(project);
  initializeFABs(project);
}

// Add a function to load the modal if it doesn't exist
function loadProjectModal() {
  return new Promise((resolve, reject) => {
    const existingModal = document.getElementById('projectModal');
    if (existingModal) {
      resolve();
      return;
    }

    console.log('Loading project modal HTML');
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
      console.error('Modal container not found');
      reject(new Error('Modal container not found'));
      return;
    }

    // Dynamically load the modal HTML
    const basePath = window.location.hostname.includes('github.io') ? 
      '/Personal-Static/' : '/';
    
    fetch(`${basePath}htmlModules/project-modal.html`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load modal HTML');
        }
        return response.text();
      })
      .then(html => {
        modalContainer.innerHTML = html;
        
        // Set up modal close button
        const closeButton = document.getElementById('closeModal');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            document.getElementById('projectModal').style.display = 'none';
          });
        }
        
        // Set up click outside to close
        const modal = document.getElementById('projectModal');
        if (modal) {
          modal.addEventListener('click', (e) => {
            if (e.target === modal) {
              modal.style.display = 'none';
            }
          });
        }
        
        resolve();
      })
      .catch(error => {
        console.error('Error loading modal:', error);
        reject(error);
      });
  });
}

/** Close the modal and "reset" it without destroying the structure */
export function closeModal() {
  const modal = document.getElementById('projectModal');
  if (!modal) {
    console.error('Modal not found in DOM yet.');
    return;
  }
  
  modal.style.display = 'none';
  
  const fabContainer = document.querySelector('.fab-container');
  if (fabContainer) {
    fabContainer.remove();
  }
  
  // Clear content but preserve structure
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalStack = document.getElementById('modalStack');
  
  if (modalTitle) modalTitle.innerText = '';
  if (modalDescription) modalDescription.innerText = '';
  if (modalStack) modalStack.innerHTML = '';
  
  // Reset the modal images without destroying structure
  const carousel = document.getElementById('projectImageCarousel');
  if (carousel) {
    const carouselInner = carousel.querySelector('.carousel-inner');
    if (carouselInner) carouselInner.innerHTML = '';
    carousel.style.display = 'none';
  }
  
  // Reset other containers
  const modalImages = document.getElementById('modalImages');
  if (modalImages) {
    const fallbackPlaceholder = modalImages.querySelector('.fallback-placeholder');
    if (fallbackPlaceholder) fallbackPlaceholder.style.display = 'none';
    
    const mermaidContainer = modalImages.querySelector('.mermaid-container');
    if (mermaidContainer) {
      mermaidContainer.style.display = 'none';
      mermaidContainer.innerHTML = '';
    }
    
    const noMermaidMsg = modalImages.querySelector('.no-mermaid');
    if (noMermaidMsg) noMermaidMsg.style.display = 'none';
  }
}

function getVisibleStackItems(stackArray) {
  let charCount = 0;
  let visibleItems = [];

  for (const tech of stackArray) {
    if (charCount + tech.length <= MAX_STACK_CHARS) {
      charCount += tech.length;
      visibleItems.push(tech);
    } else {
      break;
    }
  }

  return {
    items: visibleItems,
    remaining: stackArray.length - visibleItems.length
  };
}

function initializeProjects() {
  // First load templates, then proceed with projects initialization
  loadTemplates()
    .then(() => {
      console.log('Templates loaded successfully');
      return loadProjects();
    })
    .then(renderProjectsGallery)
    .then(() => {
      console.log('Projects loaded and rendered');
    })
    .catch(error => {
      console.error('Failed to initialize projects:', error);
    });

  // Add event listener for modal close button
  const closeModalButton = document.getElementById('closeModal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
  }
  
  // Add event listener to close when clicking outside modal content
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  // Optional: Add ESC key listener
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  // Rest of your initialization code...
}

// Add this function to dynamically load templates
function loadTemplates() {
  const basePath = window.location.hostname.includes('github.io') ? 
    '/Personal-Static/' : '/';
    
  const templatesNeeded = [
    { 
      path: `${basePath}htmlModules/project-card.html`,
      id: 'templateContainer-projectCard'
    },
    { 
      path: `${basePath}htmlModules/stack-item-template.html`,
      id: 'templateContainer-stackItems'
    }
  ];
  
  const promises = templatesNeeded.map(template => {
    return fetch(template.path)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load template: ${template.path}`);
        return response.text();
      })
      .then(html => {
        const container = document.createElement('div');
        container.id = template.id;
        container.style.display = 'none';
        container.innerHTML = html;
        document.body.appendChild(container);
        console.log(`Loaded template: ${template.path}`);
      });
  });
  
  return Promise.all(promises);
}


