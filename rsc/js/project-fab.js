/**
 * @file project-fab.js
 * @description Handles the Floating Action Buttons (FABs) used in the project modal
 */

import { showImagesInModal, showMermaidDiagramInModal } from './project-image-display.js';

/**
 * Sets up the FABs (Floating Action Buttons) for toggling between images and Mermaid diagrams
 * @param {Object} project - The project object
 */
export function setupModalToggleFABs(project) {
  const currentProject = project;
  const existingFAB = document.querySelector('.fab-container');
  if (existingFAB) {
    existingFAB.remove();
  }

  const fabContainer = document.createElement('div');
  fabContainer.className = 'fab-container';

  const imagesFab = document.createElement('button');
  imagesFab.className = 'fab toggle-images';
  imagesFab.innerHTML = '<img src="rsc/images/fab-image-icon.png" alt="Images" style="width:24px; height:24px;">';
  imagesFab.classList.add('selected');

  const mermaidFab = document.createElement('button');
  mermaidFab.className = 'fab toggle-mermaid';
  const basePath = window.location.hostname.includes('github.io') ? 
    '/Personal-Static/' : '/';
  mermaidFab.innerHTML = `<img src="${basePath}rsc/images/stack/MermaidJS.png" alt="Mermaid Diagram" />`;
  mermaidFab.style.position = 'relative';

  if (!project.mermaid || !project.mermaid.trim()) {
    mermaidFab.setAttribute('disabled', 'true');
    mermaidFab.classList.add('disabled');
  }

  mermaidFab.addEventListener('click', () => {
    let tooltip = mermaidFab.querySelector('.fab-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'fab-tooltip';
      tooltip.textContent = 'drag and scroll to explore the ERD';
      mermaidFab.appendChild(tooltip);

      const tooltipHeight = tooltip.offsetHeight || 30;
      tooltip.style.position = 'absolute';
      tooltip.style.top = `-${tooltipHeight + 5}px`;
      tooltip.style.left = '50%';
      tooltip.style.transform = 'translateX(-50%)';
      tooltip.style.zIndex = '20000';

      void tooltip.offsetWidth;
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
        setTimeout(() => {
          tooltip.remove();
        }, 500);
      }, 3000);
    }
  });

  mermaidFab.addEventListener('mouseleave', () => {
    const tooltip = mermaidFab.querySelector('.fab-tooltip');
    if (tooltip) {
      setTimeout(() => {
        tooltip.remove();
      }, 500);
    }
  });

  imagesFab.addEventListener('click', () => {
    imagesFab.classList.add('selected');
    mermaidFab.classList.remove('selected');
    showImagesInModal(currentProject);
  });

  mermaidFab.addEventListener('click', () => {
    if (!mermaidFab.disabled) {
      mermaidFab.classList.add('selected');
      imagesFab.classList.remove('selected');
      showMermaidDiagramInModal(currentProject);
    }
  });

  fabContainer.appendChild(imagesFab);
  fabContainer.appendChild(mermaidFab);

  const modalStack = document.getElementById('modalStack');
  if (modalStack && modalStack.parentNode) {
    modalStack.parentNode.insertBefore(fabContainer, modalStack.nextSibling);
  }
}

/**
 * Initializes FAB transitions between Mermaid and image modes
 * @param {Object} project - The project object
 */
export function initializeFABs(project) {
  const modalTop = document.querySelector('.modal-top');
  const mermaidFab = document.querySelector('.toggle-mermaid');
  const imagesFab = document.querySelector('.toggle-images');
  const modalImages = document.getElementById('modalImages');

  if (!project.mermaid || !project.mermaid.trim()) {
    if (mermaidFab) mermaidFab.classList.add('disabled');
    return;
  }

  let currentView = 'images';

  if (mermaidFab) {
    mermaidFab.addEventListener('click', () => {
      if (currentView === 'images' && !mermaidFab.classList.contains('disabled')) {
        modalTop.classList.add('mermaid-expanded');

        const stackHeading = document.querySelector('.modal-section-heading');
        if (stackHeading) {
          stackHeading.classList.add('heading-hidden');
        }

        const element = modalImages.querySelector('#projectImageCarousel, .fallback-placeholder');
        if (element) {
          element.style.display = 'none';
        }

        mermaidFab.classList.add('selected');
        imagesFab.classList.remove('selected');
        currentView = 'mermaid';

        setTimeout(() => {
          showMermaidDiagramInModal(project);
        }, 300);
      }
    });
  }

  if (imagesFab) {
    imagesFab.addEventListener('click', () => {
      if (currentView === 'mermaid') {
        const mermaidContainer = document.getElementById('mermaidContainer');
        if (mermaidContainer) {
          mermaidContainer.style.display = 'none';
        }

        modalTop.classList.remove('mermaid-expanded');

        const stackHeading = document.querySelector('.modal-section-heading');
        if (stackHeading) {
          stackHeading.classList.remove('heading-hidden');
        }

        setTimeout(() => {
          showImagesInModal(project);
          imagesFab.classList.add('selected');
          mermaidFab.classList.remove('selected');
          currentView = 'images';
        }, 300);
      }
    });
  }
}