/**
 * @file project-image-display.js
 * @description Handles displaying project images and mermaid diagrams in the modal
 */

import panzoom from 'panzoom';
import mermaid from 'mermaid';
import { getPlaceholderForStack } from './placeholderBuilder.js';
import { parseMermaidCode } from './json-parser.js';

/**
 * Display project images in the modal (simple horizontal slider version)
 * @param {Object} project - The project object
 */
export function showImagesInModal(project) {
  const modalImages = document.getElementById('modalImages');
  modalImages.classList.remove('mermaid-view');
  modalImages.classList.add('images-view');

  // Remove any previous slider
  let slider = document.getElementById('simpleImageSlider');
  if (slider) slider.remove();

  // Remove fallback/mermaid containers
  const fallbackPlaceholder = modalImages.querySelector('.fallback-placeholder');
  if (fallbackPlaceholder) fallbackPlaceholder.style.display = 'none';
  const mermaidContainer = document.getElementById('mermaidContainer');
  if (mermaidContainer) mermaidContainer.style.display = 'none';
  const noMermaidMsg = modalImages.querySelector('.no-mermaid');
  if (noMermaidMsg) noMermaidMsg.style.display = 'none';

  // Create slider container
  slider = document.createElement('div');
  slider.id = 'simpleImageSlider';
  slider.style.display = 'flex';
  slider.style.overflow = 'hidden';
  slider.style.width = '100%';
  slider.style.position = 'relative';
  slider.style.alignItems = 'center';
  slider.style.justifyContent = 'center';
  slider.style.height = '350px';

  // Images wrapper (for sliding)
  const imagesWrapper = document.createElement('div');
  imagesWrapper.className = 'slider-images-wrapper';
  imagesWrapper.style.display = 'flex';
  imagesWrapper.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
  imagesWrapper.style.height = '100%';

  // Add images
  const images = (project.images || []).map((imgSrc, idx) => {
    const img = document.createElement('img');
    img.src = imgSrc.startsWith('rsc/') || imgSrc.startsWith('http')
      ? imgSrc
      : imgSrc.includes('/')
        ? `rsc/images/${imgSrc}`
        : `rsc/images/recipes/${imgSrc}`;
    img.alt = `Project image ${idx + 1}`;
    img.style.maxHeight = '100%';
    img.style.width = 'auto';
    img.style.flex = '0 0 100%';
    img.style.objectFit = 'contain';
    img.style.margin = '0 auto';
    imagesWrapper.appendChild(img);
    return img;
  });

  // If there are no images, show the placeholder instead of the slider
  if (!images.length) {
    modalImages.innerHTML = '';
    const placeholderDiv = document.createElement('div');
    placeholderDiv.className = 'fallback-placeholder';
    placeholderDiv.style.display = 'flex';
    placeholderDiv.style.justifyContent = 'center';
    placeholderDiv.style.alignItems = 'center';
    placeholderDiv.style.width = '250px';
    placeholderDiv.style.height = '250px';
    placeholderDiv.style.margin = '0 auto';
    const img = document.createElement('img');
    img.src = getPlaceholderForStack(project);
    img.alt = 'Project placeholder';
    img.style.maxHeight = '100%';
    img.style.width = 'auto';
    img.style.borderRadius = '50%';
    placeholderDiv.appendChild(img);
    modalImages.appendChild(placeholderDiv);
    return;
  }

  slider.appendChild(imagesWrapper);

  // Add arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-arrow simple-prev';
  prevBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#fff"/><path d="M14.7 17.3a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 1 1 1.4 1.4L11.42 12l3.3 3.3a1 1 0 0 1 0 1.4z" fill="#6750A4"/></svg>`;
  prevBtn.style.position = 'absolute';
  prevBtn.style.left = '10px';
  prevBtn.style.top = '50%';
  prevBtn.style.transform = 'translateY(-50%)';
  prevBtn.style.zIndex = '10';
  prevBtn.style.background = 'rgba(255,255,255,0.8)';
  prevBtn.style.border = 'none';
  prevBtn.style.borderRadius = '50%';
  prevBtn.style.width = '40px';
  prevBtn.style.height = '40px';
  prevBtn.style.fontSize = '1.5rem';
  prevBtn.style.cursor = 'pointer';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-arrow simple-next';
  nextBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#fff"/><path d="M9.3 6.7a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 1 1-1.4-1.4L12.58 12l-3.3-3.3a1 1 0 0 1 0-1.4z" fill="#6750A4"/></svg>`;
  nextBtn.style.position = 'absolute';
  nextBtn.style.right = '10px';
  nextBtn.style.top = '50%';
  nextBtn.style.transform = 'translateY(-50%)';
  nextBtn.style.zIndex = '10';
  nextBtn.style.background = 'rgba(255,255,255,0.8)';
  nextBtn.style.border = 'none';
  nextBtn.style.borderRadius = '50%';
  nextBtn.style.width = '40px';
  nextBtn.style.height = '40px';
  nextBtn.style.fontSize = '1.5rem';
  nextBtn.style.cursor = 'pointer';

  slider.appendChild(prevBtn);
  slider.appendChild(nextBtn);

  // Hide arrows if no images or only one image
  if (!images.length || images.length === 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }

  // Add slider to modal
  modalImages.innerHTML = '';
  modalImages.appendChild(slider);

  // Slider logic
  let currentIdx = 0;
  function updateSlider() {
    imagesWrapper.style.transform = `translateX(-${currentIdx * 100}%)`;
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === images.length - 1;
  }
  prevBtn.onclick = () => {
    if (currentIdx > 0) {
      currentIdx--;
      updateSlider();
    }
  };
  nextBtn.onclick = () => {
    if (currentIdx < images.length - 1) {
      currentIdx++;
      updateSlider();
    }
  };
  updateSlider();
}

/**
 * Display mermaid diagram in the modal
 * @param {Object} project - The project object
 */
export function showMermaidDiagramInModal(project) {
  const modalImages = document.getElementById('modalImages');
  const mermaidContainer = document.getElementById('mermaidContainer');
  const fallbackPlaceholder = modalImages.querySelector('.fallback-placeholder');
  const noMermaidMsg = modalImages.querySelector('.no-mermaid');

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
    mermaidContainer.style.position = 'absolute';
    mermaidContainer.style.top = '0';
    mermaidContainer.style.left = '0';
    mermaidContainer.style.width = '100%';
    mermaidContainer.style.height = '100%';
    mermaidContainer.style.zIndex = '10';
    mermaidContainer.style.overflow = 'hidden';
    mermaidContainer.style.paddingTop = '50px';

    const innerMermaid = document.createElement('div');
    innerMermaid.className = 'mermaid';
    innerMermaid.textContent = mermaidCode;
    innerMermaid.style.width = '100%';
    innerMermaid.style.height = '100%';
    innerMermaid.style.display = 'flex';
    innerMermaid.style.justifyContent = 'center';
    innerMermaid.style.alignItems = 'center';

    mermaidContainer.appendChild(innerMermaid);
    mermaidContainer.style.display = 'flex';

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
      // Ensure mermaid is properly initialized
      if (typeof mermaid !== 'undefined') {
        // First make sure mermaid is initialized only once
        mermaid.initialize({ 
          startOnLoad: false,
          securityLevel: 'loose',
          theme: document.body.classList.contains('dark-mode') ? 'dark' : 'default'
        });

        // Log the mermaid code for debugging
        console.log("Attempting to render mermaid diagram");
        
        // Use either the imported mermaid or window.mermaid (whichever is available)
        const mermaidInstance = mermaid || window.mermaid;
        
        if (mermaidInstance && typeof mermaidInstance.render === 'function') {
          // Modern mermaid API uses render instead of init
          const id = `mermaid-${Date.now()}`;
          mermaidElement.id = id;
          
          mermaidInstance.render(id)
            .then(result => {
              console.log("Mermaid diagram rendered successfully");
              mermaidElement.innerHTML = result.svg;
              applyPanzoomToSvg(mermaidElement);
            })
            .catch(error => {
              console.error("Mermaid rendering error:", error);
              mermaidElement.textContent = "Error rendering diagram. Check your mermaid syntax.";
              mermaidElement.style.color = "red";
            });
        } else if (mermaidInstance && typeof mermaidInstance.init === 'function') {
          // Fallback to older mermaid API
          mermaidInstance.init(undefined, mermaidElement)
            .then(() => {
              console.log("Mermaid diagram rendered successfully using init");
              applyPanzoomToSvg(mermaidElement);
            })
            .catch(error => {
              console.error("Mermaid initialization error:", error);
              mermaidElement.textContent = "Error rendering diagram. Check your mermaid syntax.";
              mermaidElement.style.color = "red";
            });
        } else {
          throw new Error("Mermaid API not available");
        }
      } else {
        console.error("Mermaid library not available");
        
        // Try loading mermaid from CDN as a fallback
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js";
        script.onload = () => {
          console.log("Mermaid loaded from CDN, retrying render");
          renderMermaidDiagram(mermaidElement);
        };
        script.onerror = () => {
          mermaidElement.textContent = "Failed to load Mermaid library.";
          mermaidElement.style.color = "red";
        };
        document.head.appendChild(script);
      }
    } catch (err) {
      console.error('Error initializing Mermaid:', err);
      mermaidElement.textContent = "Error rendering diagram: " + err.message;
      mermaidElement.style.color = "red";
    }
  }, 300); // Increased timeout for better reliability
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