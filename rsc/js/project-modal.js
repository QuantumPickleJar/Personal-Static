import panzoom from 'panzoom';
import mermaid from 'mermaid';
import { getPlaceholderForStack } from './placeholderBuilder.js';
import { renderOneStackIcon } from './stackIconLoader.js';
import { parseMermaidCode } from './json-parser.js';
import { showImagesInModal, showMermaidDiagramInModal } from './project-image-display.js';

// Track current project in the modal
let currentProject = null;

/**
 * Opens the project modal for a given project ID
 * @param {string|Object} projectIdOrObject - Either a project ID or the project object itself
 * @param {Array} allProjects - Array of all projects (needed if projectIdOrObject is an ID)
 */
export function openProjectModal(projectIdOrObject, allProjects = []) {
  const project = typeof projectIdOrObject === 'string'
    ? allProjects.find(p => p.id === projectIdOrObject)
    : projectIdOrObject;

  if (!project) {
    console.error('Project not found:', projectIdOrObject);
    return;
  }

  const modal = document.getElementById('projectModal');
  if (!modal) {
    console.warn('Modal not found in DOM. Loading modal and retrying...');
    loadProjectModal().then(() => {
      setTimeout(() => openProjectModal(projectIdOrObject, allProjects), 100);
    });
    return;
  }

  console.log('Opening modal for project:', project.title);
  modal.style.display = 'block';

  document.getElementById('modalTitle').textContent = project.title;
  document.getElementById('modalDescription').innerHTML = project.description || "No description available.";

  const statusElement = document.getElementById('projectStatus');
  if (statusElement) {
    statusElement.textContent = project.status ? `Status: ${project.status}` : "";
  }

  const typeElement = document.getElementById('projectType');
  if (typeElement) {
    typeElement.textContent = project.academic ? "Academic Project" : "Personal Project";
  }

  const datesElement = document.getElementById('projectDates');
  if (datesElement && project.dates) {
    datesElement.textContent = `Dates: ${project.dates}`;
  }

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

  showImagesInModal(project);
}

/**
 * Load the project modal HTML if it doesn't exist in the DOM
 * @returns {Promise} - Resolves when modal is loaded
 */
export function loadProjectModal() {
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

        const closeButton = document.getElementById('closeModal');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            document.getElementById('projectModal').style.display = 'none';
          });
        }

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

/**
 * Close the modal and "reset" it without destroying the structure
 */
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

  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalStack = document.getElementById('modalStack');

  if (modalTitle) modalTitle.innerText = '';
  if (modalDescription) modalDescription.innerText = '';
  if (modalStack) modalStack.innerHTML = '';

  const carousel = document.getElementById('projectImageCarousel');
  if (carousel) {
    const carouselInner = carousel.querySelector('.carousel-inner');
    if (carouselInner) carouselInner.innerHTML = '';
    carousel.style.display = 'none';
  }

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

/**
 * Initialize the modal event listeners
 */
export function initializeModalEventListeners() {
  const closeModalButton = document.getElementById('closeModal');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal);
  }

  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}