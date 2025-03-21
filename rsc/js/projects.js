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
  // Add this check at the beginning of the function
  const gallery = document.getElementById('projectsGallery');
  if (!gallery) {
    console.log('No projects gallery found on this page - skipping render');
    return;
  }
  
  // Rest of your existing code...
  gallery.innerHTML = ''; // Clear existing content

  projects.forEach(project => {
    const card = document.createElement('div');
    card.classList.add('project-card');
    card.dataset.projectId = project.id;
    card.style.position = 'relative';

    // Thumbnail
    const thumb = document.createElement('img');
    thumb.classList.add('project-thumbnail');
    thumb.src = project.thumbnail || 'images/placeholder.jpg';
    thumb.alt = project.title;
    card.appendChild(thumb);

    // Academic label (top right corner)
    const labelRow = document.createElement('div');
    labelRow.classList.add('label-row');
    card.appendChild(labelRow);

    // Date label (top left corner)
    const dateLabel = document.createElement('span');
    dateLabel.classList.add('date-label');

    // Use date instead of dates as instructed
    const dateText = project.date || project.dates || 'No date';
    dateLabel.textContent = dateText;
    dateLabel.dataset.tooltip = dateText; // Store date in a data attribute for the tooltip

    // Add mouseover event to show tooltip
    dateLabel.addEventListener('mouseover', (e) => {
      // Create tooltip if it doesn't exist
      let tooltip = dateLabel.querySelector('.tooltip-date');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip-date';
        
        // Use innerHTML with inline styles to ensure text visibility
        tooltip.innerHTML = `<span style="color:white; display:inline-block;">${dateText}</span>`;
        
        // Add some insurance that the tooltip will be visible
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.padding = '5px 8px';
        tooltip.style.zIndex = '100';
        
        dateLabel.appendChild(tooltip);
        
        // Force render before adding visible class
        void tooltip.offsetWidth;
      }
      tooltip.classList.add('visible');
    });

    // Hide tooltip on mouseout
    dateLabel.addEventListener('mouseout', () => {
      const tooltip = dateLabel.querySelector('.tooltip-date');
      if (tooltip) {
        tooltip.classList.remove('visible');
      }
    });

    labelRow.appendChild(dateLabel);


    // Academic label
    const academicLabel = document.createElement('span');
    academicLabel.classList.add('academic-label');
    academicLabel.textContent = project.academic ? "Academic" : "Personal";
    if (project.academic) {
      academicLabel.classList.add('academic');
    } else {
      academicLabel.classList.add('personal');
    }
    card.appendChild(academicLabel);

    // Add mouseover event to show tooltip
    academicLabel.addEventListener('mouseover', (e) => {
      // Create tooltip if it doesn't exist
      let tooltip = academicLabel.querySelector('.tooltip-date');
      if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'tooltip-date';
        
        // Use innerHTML with inline styles to ensure text visibility
        tooltip.innerHTML = `<span style="color:white; display:inline-block;">${dateText}</span>`;
        
        // Add some insurance that the tooltip will be visible
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        tooltip.style.padding = '5px 8px';
        tooltip.style.zIndex = '100';
        
        academicLabel.appendChild(tooltip);
        
        // Force render before adding visible class
        void tooltip.offsetWidth;
      }
      tooltip.classList.add('visible');
    });

    // Hide tooltip on mouseout
    academicLabel.addEventListener('mouseout', () => {
      const tooltip = academicLabel.querySelector('.tooltip-date');
      if (tooltip) {
        tooltip.classList.remove('visible');
      }
    });

    // If multiple images, show an icon
    if (project.images && project.images.length > 1) {
      const imageCountIcon = document.createElement('div');
      imageCountIcon.classList.add('image-count-icon');
      imageCountIcon.innerHTML = `<span class="icon">&#128247;</span><span class="count">${project.images.length}</span>`;
      card.appendChild(imageCountIcon);
    }

    // Add Mermaid diagram badge if project has mermaid content
    if (project.mermaid && project.mermaid.trim()) {
      const mermaidIcon = document.createElement('div');
      mermaidIcon.classList.add('mermaid-icon');
      mermaidIcon.innerHTML = '<img src=" rsc/images/stack/MermaidJS.png" alt="Has Mermaid Diagram" />';
      card.appendChild(mermaidIcon);
    }

    // Title
    const titleDiv = document.createElement('div');
    titleDiv.classList.add('project-title');
    titleDiv.textContent = project.title;
    card.appendChild(titleDiv);

    // TODO: move to html
    // Use createTruncatedSpan to show shortForm (or fallback to description) in a tooltip if > 100 chars
    const shortOrDesc = project.shortForm || project.description || '';
    const truncatedSpan = createTruncatedSpan(shortOrDesc, 100);
    truncatedSpan.classList.add('short-form-truncated'); 
    card.appendChild(truncatedSpan);

    // Stack Icons
    const stackContainer = document.createElement('div');
    stackContainer.classList.add('stack-icons');
    const { items, remaining } = getVisibleStackItems(project.stack);

    items.forEach(tech => {
      const techSpan = document.createElement('span');
      techSpan.classList.add('stack-icon');
      techSpan.textContent = tech;
      stackContainer.appendChild(techSpan);
    });

    if (remaining > 0) {
      const moreLink = document.createElement('span');
      moreLink.classList.add('more-link');
      moreLink.textContent = `+${remaining} more`;
      moreLink.addEventListener('click', e => {
        e.stopPropagation();
        expandStack(stackContainer, project.stack, items.length, moreLink);
      });
      stackContainer.appendChild(moreLink);
    }
    card.appendChild(stackContainer);

    // Inside renderProjectsGallery(), appending badges 
    if ((project.images && project.images.length > 1) || (project.mermaid && project.mermaid.trim())) {
      const badgeContainer = document.createElement('div');
      badgeContainer.classList.add('badge-container');
      
      if (project.images && project.images.length > 1) {
        const imageCountIcon = document.createElement('div');
        imageCountIcon.classList.add('image-count-icon');
        imageCountIcon.innerHTML = `<span class="icon">&#128247;</span><span class="count">${project.images.length}</span>`;
        badgeContainer.appendChild(imageCountIcon);
      }
      
      if (project.mermaid && project.mermaid.trim()) {
        const mermaidIcon = document.createElement('div');
        mermaidIcon.classList.add('mermaid-icon');
        mermaidIcon.innerHTML = '<img src="/./rsc/images/stack/MermaidJS.png" alt="Has Mermaid Diagram" />';
        badgeContainer.appendChild(mermaidIcon);
      }
      
      card.appendChild(badgeContainer);
    }

    // Click => open modal
    card.addEventListener('click', () => {
      openProjectModal(project.id);
    });

    gallery.appendChild(card);
  });
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
}


function showImagesInModal(project) {
  const modalImages = document.getElementById('modalImages');
  // Clear container and reset classes/inline styles
  modalImages.innerHTML = '';
  modalImages.classList.remove('mermaid-view');
  modalImages.classList.add('images-view');
  modalImages.style.maxHeight = '';
  modalImages.style.overflow = '';

  if (project.images && project.images.length > 0) {
    // Render the carousel view if images exist
    const carousel = document.createElement('div');
    carousel.id = 'projectImageCarousel';
    carousel.className = 'carousel slide';
    const carouselInner = document.createElement('div');
    carouselInner.className = 'carousel-inner';

    project.images.forEach((imgSrc, index) => {
      const carouselItem = document.createElement('div');
      carouselItem.classList.add('carousel-item');
      if (index === 0) carouselItem.classList.add('active');

      const img = document.createElement('img');
      const finalSrc = imgSrc.startsWith('rsc/') || imgSrc.startsWith('http')
        ? imgSrc
        : imgSrc.includes('/')
          ? `rsc/images/${imgSrc}`
          : `rsc/images/recipes/${imgSrc}`;
      const anchor = document.createElement('a');
      anchor.href = finalSrc;
      anchor.setAttribute('data-lightbox', 'carousel-images');
      anchor.appendChild(img);
      carouselItem.appendChild(anchor);

      img.src = finalSrc;
      img.classList.add('d-block', 'w-100');
      img.alt = `Project image ${index + 1}`;

      carouselInner.appendChild(carouselItem);
    });

    carousel.appendChild(carouselInner);
    // Create carousel controls
    const btnPrev = document.createElement('button');
    btnPrev.className = 'carousel-control-prev';
    btnPrev.setAttribute('type', 'button');
    btnPrev.setAttribute('data-bs-target', '#projectImageCarousel');
    btnPrev.setAttribute('data-bs-slide', 'prev');
    btnPrev.innerHTML = `
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Previous</span>
    `;
    const btnNext = document.createElement('button');
    btnNext.className = 'carousel-control-next';
    btnNext.setAttribute('type', 'button');
    btnNext.setAttribute('data-bs-target', '#projectImageCarousel');
    btnNext.setAttribute('data-bs-slide', 'next');
    btnNext.innerHTML = `
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Next</span>
    `;
    carousel.appendChild(btnPrev);
    carousel.appendChild(btnNext);
    modalImages.appendChild(carousel);
    carousel.style.maxHeight = '375px';
    new bootstrap.Carousel(carousel, { interval: false, wrap: true });
  }  else {
    // Render fallback placeholder.
    const fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'fallback-placeholder';
    // Ensure the fallback has fixed dimensions.
    fallbackDiv.style.width = '250px';
    fallbackDiv.style.height = '250px';
    fallbackDiv.style.flex = '0 0 auto'; // Prevent flex from stretching it.
    const img = document.createElement('img');
    img.src = getPlaceholderForStack(project);
    img.alt = 'Project placeholder';
    // Remove any conflicting inline styles from img.
    img.removeAttribute('style');
    fallbackDiv.appendChild(img);
    // Center the fallbackDiv within modalImages.
    modalImages.style.display = 'flex';
    modalImages.style.justifyContent = 'center';
    modalImages.style.alignItems = 'center';
    modalImages.appendChild(fallbackDiv);
  }
}



function showMermaidDiagramInModal(project) {
  const modalImages = document.getElementById('modalImages');
  // Switch to mermaid view
  modalImages.innerHTML = '';
  modalImages.classList.remove('images-view');
  modalImages.classList.add('mermaid-view');
  modalImages.style.display = 'block';

  const mermaidContainer = document.createElement('div');
  mermaidContainer.id = 'mermaidContainer';
  mermaidContainer.className = 'mermaid';
  // Remove any inline overflow that might clip the fallback
  mermaidContainer.style.overflow = '';
  modalImages.appendChild(mermaidContainer);

  const mermaidCode = parseMermaidCode(project);
  if (!mermaidCode.trim()) {
    // Render fallback with a red slash overlay
    // Set inline style to force a min-height if needed:
    mermaidContainer.style.minHeight = '300px';
    mermaidContainer.innerHTML = '<div class="no-mermaid">No Mermaid Diagram Available</div>';
    return;
  }

  // Otherwise, render the Mermaid diagram.
  mermaidContainer.textContent = mermaidCode;
  setTimeout(() => {
    try {
      mermaid.init(undefined, mermaidContainer);
      panzoom(mermaidContainer, {
        smoothScroll: false,
        maxZoom: 5,
        minZoom: 0.5
      });
    } catch (err) {
      console.error('Error initializing Mermaid or panzoom:', err);
    }
  }, 100);
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

export function openProjectModal(projectId) {
  const project = allProjects.find(p => p.id === projectId);
  if (!project) {
    console.error('Project not found:', projectId);
    return;
  }

  // Show the modal and set the title.
  const modal = document.getElementById('projectModal');
  modal.style.display = 'block';
  const modalTitle = document.getElementById('modalTitle');
  modalTitle.textContent = project.title;

  // Render the images view (or fallback).
  showImagesInModal(project);

  // Render stack icons.
  const modalStack = document.getElementById('modalStack');
  modalStack.innerHTML = '';
  project.stack.forEach(tech => {
    const iconEl = renderOneStackIcon(tech);
    modalStack.appendChild(iconEl);
  });

  // Remove any existing FAB container.
  const existingFAB = document.querySelector('.fab-container');
  if (existingFAB) {
    existingFAB.remove();
  }
  setupModalToggleFABs(project);

  // Render bottom container details.
  const projectStatus = document.getElementById('projectStatus');
  projectStatus.textContent = `Status: ${project.status || 'N/A'}`;
  const projectDates = document.getElementById('projectDates');
  projectDates.textContent = `Dates: ${project.dates || 'Unknown'}`;
  const modalDesc = document.getElementById('modalDescription');
  modalDesc.textContent = project.description || 'No description available';
}


/** Close the modal and "reset" it*/
export function closeModal() {
  const modal = document.getElementById('projectModal');
  modal.style.display = 'none';
  
  const fabContainer = document.querySelector('.fab-container');
  if (fabContainer) {
    fabContainer.remove();
  }
  
  // Optionally clear fields so it’s fresh next time
  document.getElementById('modalTitle').innerText = '';
  document.getElementById('modalDescription').innerText = '';
  document.getElementById('modalStack').innerHTML = '';
  document.getElementById('modalImages').innerHTML = '';
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
  // Existing code...
  
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
  loadProjects()
    .then(renderProjectsGallery)
    .then(() => {
      console.log('Projects loaded and rendered');
    });
}


