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
  
  // Remove existing FAB container if it exists (to avoid duplicates)
  const existingFAB = document.querySelector('.fab-container');
  if (existingFAB) {
    existingFAB.remove();
  }

  // Create a new FAB container
  const fabContainer = document.createElement('div');
  fabContainer.className = 'fab-container';

  // Create the Images FAB
  const imagesFab = document.createElement('button');
  imagesFab.className = 'fab toggle-images';
  imagesFab.innerHTML = '<img src="rsc/images/fab-image-icon.png" alt="Images" style="width:24px; height:24px;">';
  imagesFab.classList.add('selected'); // Images view is default

  // Create the Mermaid FAB
  const mermaidFab = document.createElement('button');
  mermaidFab.className = 'fab toggle-mermaid';
  const basePath = window.location.hostname.includes('github.io') ? 
    '/Personal-Static/' : '/';
  mermaidFab.innerHTML = `<img src="${basePath}rsc/images/stack/MermaidJS.png" alt="Mermaid Diagram" />`;
  mermaidFab.style.position = 'relative';

  // Disable mermaid button if project doesn't have a diagram
  if (!project.mermaid || !project.mermaid.trim()) {
    mermaidFab.setAttribute('disabled', 'true');
    mermaidFab.classList.add('disabled');
  }

  // Current view tracking
  let currentView = 'images';
  const modalTop = document.querySelector('.modal-top');
  const modalImages = document.getElementById('modalImages');
  const modalBottom = document.querySelector('.modal-bottom');
  const modalTitle = document.getElementById('modalTitle');
  const modalTopRightUpper = document.querySelector('.modal-top-right-upper');
  const modalStack = document.getElementById('modalStack');

  // Set up event handlers for toggling between views
  mermaidFab.addEventListener('click', () => {
    if (currentView === 'images' && !mermaidFab.disabled) {
      // Show tooltip for mermaid diagram interactions
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
      
      // Update UI for mermaid view
      modalTop.classList.add('mermaid-expanded');
      mermaidFab.classList.add('selected');
      imagesFab.classList.remove('selected');

      // Hide the description section with animation
      if (modalBottom) {
        modalBottom.style.transition = 'all 0.4s ease-out';
        modalBottom.style.transform = 'translateY(100%)';
        modalBottom.style.opacity = '0';
        modalBottom.style.height = '0';
        modalBottom.style.overflow = 'hidden';
        modalBottom.style.margin = '0';
        modalBottom.style.padding = '0';
      }

      // Reposition tech stack icons to be horizontal
      if (modalStack) {
        modalStack.style.display = 'flex';
        modalStack.style.flexDirection = 'row';
        modalStack.style.flexWrap = 'wrap';
        modalStack.style.justifyContent = 'flex-end';
        
        // Make stack icons more compact
        const stackItems = modalStack.querySelectorAll('.stack-item-container');
        stackItems.forEach(item => {
          item.style.width = '32px';
          item.style.height = '32px';
          item.style.padding = '4px';
          item.style.display = 'flex';
          item.style.justifyContent = 'center';
          item.style.alignItems = 'center';
        });
      }

      const stackHeading = document.querySelector('.modal-section-heading');
      if (stackHeading) {
        stackHeading.classList.add('heading-hidden');
      }

      // Hide carousel or placeholder
      const element = modalImages.querySelector('#projectImageCarousel, .fallback-placeholder');
      if (element) {
        element.style.display = 'none';
      }

      // Make title more subtle
      if (modalTitle) {
        modalTitle.style.fontSize = '1.2rem';
        modalTitle.style.opacity = '0.7';
      }

      currentView = 'mermaid';
      
      // Show mermaid diagram with maximum space
      setTimeout(() => {
        showMermaidDiagramInModal(currentProject);
        
        // Ensure the mermaid container takes up the full available width
        const mermaidContainer = document.getElementById('mermaidContainer');
        if (mermaidContainer) {
          mermaidContainer.style.width = '100%';
          mermaidContainer.style.maxWidth = '100%';
        }
      }, 300);
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
    if (currentView === 'mermaid') {
      // Hide mermaid container
      const mermaidContainer = document.getElementById('mermaidContainer');
      if (mermaidContainer) {
        mermaidContainer.style.display = 'none';
      }

      // Restore UI for images view
      modalTop.classList.remove('mermaid-expanded');
      imagesFab.classList.add('selected');
      mermaidFab.classList.remove('selected');

      // Show the description section with animation
      if (modalBottom) {
        modalBottom.style.transition = 'all 0.4s ease-in';
        modalBottom.style.transform = 'translateY(0)';
        modalBottom.style.opacity = '1';
        modalBottom.style.height = 'auto';
        modalBottom.style.overflow = 'visible';
        modalBottom.style.marginTop = '20px';
        modalBottom.style.padding = '';
      }

      // Restore tech stack layout
      if (modalStack) {
        modalStack.style.display = '';
        modalStack.style.flexDirection = '';
        modalStack.style.flexWrap = '';
        modalStack.style.justifyContent = '';
        
        // Restore normal stack icon styles
        const stackItems = modalStack.querySelectorAll('.stack-item-container');
        stackItems.forEach(item => {
          item.style.width = '';
          item.style.height = '';
          item.style.padding = '';
          item.style.display = '';
          item.style.justifyContent = '';
          item.style.alignItems = '';
        });
      }

      // Restore title styling
      if (modalTitle) {
        modalTitle.style.fontSize = '';
        modalTitle.style.opacity = '';
      }

      const stackHeading = document.querySelector('.modal-section-heading');
      if (stackHeading) {
        stackHeading.classList.remove('heading-hidden');
      }

      // Show images
      setTimeout(() => {
        showImagesInModal(currentProject);
        currentView = 'images';
      }, 300);
    }
  });

  // Add FABs to container
  fabContainer.appendChild(imagesFab);
  fabContainer.appendChild(mermaidFab);

  // Position FABs in the upper right of the modal
  const modalTopRight = document.querySelector('.modal-top-right');
  if (modalTopRight) {
    // Create a container for the FABs that's absolutely positioned
    fabContainer.style.position = 'absolute';
    fabContainer.style.top = '10px';
    fabContainer.style.right = '10px';
    
    // Insert FABs into modal-top-right for proper positioning
    modalTopRight.appendChild(fabContainer);
  } else {
    // Fallback
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      // Ensure proper positioning even in fallback case
      fabContainer.style.position = 'absolute';
      fabContainer.style.top = '10px';
      fabContainer.style.right = '10px';
      modalContent.appendChild(fabContainer);
    }
  }
}

/**
 * Initializes FABs when added to DOM
 * @param {Object} project - The project object
 */
export function initializeFABs(project) {
  // The functionality has been consolidated into setupModalToggleFABs
  // This function is kept for backward compatibility
  console.log('FABs initialized with project:', project.title || 'Unknown project');
}