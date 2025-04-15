/**
 * @file project-image-display.js
 * @description Handles displaying project images and mermaid diagrams in the modal
 */

import * as bootstrap from 'bootstrap';
import panzoom from 'panzoom';
import mermaid from 'mermaid';
import { getPlaceholderForStack } from './placeholderBuilder.js';
import { parseMermaidCode } from './json-parser.js';

/**
 * Display project images in the modal
 * @param {Object} project - The project object
 */
export function showImagesInModal(project) {
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
        const bootstrapCarousel = bootstrap.Carousel.getInstance(carousel);
        if (bootstrapCarousel) bootstrapCarousel.dispose();
        new bootstrap.Carousel(carousel, { interval: false, wrap: true });
        
        // Initialize lightbox if available
        initializeLightbox(carousel);
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

/**
 * Initialize lightbox functionality for carousel images
 * @param {HTMLElement} carousel - The carousel element
 */
function initializeLightbox(carousel) {
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
}

/**
 * Display mermaid diagram in the modal
 * @param {Object} project - The project object
 */
export function showMermaidDiagramInModal(project) {
  const modalImages = document.getElementById('modalImages');
  const mermaidContainer = document.getElementById('mermaidContainer');
  const carousel = document.getElementById('projectImageCarousel');
  const fallbackPlaceholder = modalImages.querySelector('.fallback-placeholder');
  const noMermaidMsg = modalImages.querySelector('.no-mermaid');

  if (carousel) carousel.style.display = 'none';
  if (fallbackPlaceholder) fallbackPlaceholder.style.display = 'none';

  modalImages.classList.remove('images-view');
  modalImages.classList.add('mermaid-view');
  modalImages.style.display = 'block';

  const mermaidCode = parseMermaidCode(project);
  if (!mermaidCode || !mermaidCode.trim()) {
    if (mermaidContainer) mermaidContainer.style.display = 'none';
    if (noMermaidMsg) noMermaidMsg.style.display = 'block';
    return;
  }

  if (mermaidContainer) {
    mermaidContainer.innerHTML = '';
    const innerMermaid = document.createElement('div');
    innerMermaid.className = 'mermaid';
    innerMermaid.textContent = mermaidCode;
    mermaidContainer.appendChild(innerMermaid);
    mermaidContainer.style.display = 'block';

    renderMermaidDiagram(innerMermaid);
  }
}

/**
 * Renders a mermaid diagram in the given element
 * @param {HTMLElement} mermaidElement - The element containing the mermaid code
 */
export function renderMermaidDiagram(mermaidElement) {
  setTimeout(() => {
    try {
      if (window.mermaid) {
        window.mermaid.initialize({ 
          startOnLoad: false,
          securityLevel: 'loose' // This helps with SVG rendering
        });

        window.mermaid.init(undefined, mermaidElement).then(() => {
          console.log("Mermaid diagram rendered successfully");
          applyPanzoomToSvg(mermaidElement);
        }).catch(error => {
          console.error("Mermaid initialization error:", error);
          mermaidElement.textContent = "Error rendering diagram. Check your mermaid syntax.";
          mermaidElement.style.color = "red";
        });
      } else {
        console.error("Mermaid library not available");
        mermaidElement.textContent = "Mermaid library failed to load.";
        mermaidElement.style.color = "red";
      }
    } catch (err) {
      console.error('Error initializing Mermaid:', err);
      mermaidElement.textContent = "Error rendering diagram: " + err.message;
      mermaidElement.style.color = "red";
    }
  }, 200);
}

/**
 * Applies panzoom to the SVG element within the mermaid container
 * @param {HTMLElement} mermaidElement - The element containing the mermaid diagram
 */
export function applyPanzoomToSvg(mermaidElement) {
  setTimeout(() => {
    try {
      const svgElement = mermaidElement.querySelector('svg');
      if (svgElement) {
        svgElement.style.border = '1px solid #ddd';
        svgElement.style.borderRadius = '4px';
        svgElement.style.padding = '10px';
        svgElement.style.width = '100%';
        svgElement.style.height = 'auto';

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
}