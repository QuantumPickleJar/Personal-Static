/**
 * @file project-image-display.js
 * @description Handles displaying project images and mermaid diagrams in the modal
 */

import panzoom from 'panzoom';
// Remove the mermaid import since we're using the global instance
import { getPlaceholderForStack } from './placeholderBuilder.js';
import { parseMermaidCode } from './json-parser.js';

/**
 * Ensure modal structure is reset when switching views
 */
function resetModalStructure() {
  const modalImages = document.getElementById('modalImages');
  if (!modalImages) return;

  // Clear existing content
  modalImages.innerHTML = '';

  // Recreate the initial structure
  const mermaidContainer = document.createElement('div');
  mermaidContainer.id = 'mermaidContainer';
  mermaidContainer.className = 'mermaid';
  mermaidContainer.style.display = 'none';
  mermaidContainer.style.overflow = 'visible';
  modalImages.appendChild(mermaidContainer);

  const noMermaidMsg = document.createElement('div');
  noMermaidMsg.className = 'no-mermaid';
  noMermaidMsg.style.display = 'none';
  noMermaidMsg.textContent = 'No Mermaid Diagram Available';
  modalImages.appendChild(noMermaidMsg);
}

/**
 * Ensure the modal layout is reset when switching from mermaid view
 */
function resetModalLayout() {
  const modalImages = document.getElementById('modalImages');
  if (modalImages) {
    // Remove mermaid view class
    modalImages.classList.remove('mermaid-view');
    // Add images view class if not already present
    if (!modalImages.classList.contains('images-view')) {
      modalImages.classList.add('images-view');
    }
    
    // Reset the images container with proper structure
    modalImages.innerHTML = `
        <div id="imageArea"></div>
        <div id="mermaidContainer" class="mermaid" style="display: none; overflow: visible;"></div>
        <div class="no-mermaid" style="display: none;">No Mermaid Diagram Available</div>
    `;
  }
  
  // Fix modal content scrolling
  const modalContent = document.getElementById('modalContent');
  const modalBottom = document.querySelector('.modal-bottom');
  
  if (modalContent && modalBottom) {
    // Ensure modal content doesn't have fixed height
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflowY = 'auto';
    
    // Make sure modal-bottom is properly scrollable
    modalBottom.style.maxHeight = '300px';
    modalBottom.style.overflowY = 'auto';
    modalBottom.style.paddingRight = '5px';
  }
  
  // Restore normal modal-top layout if it was changed
  const modalTop = document.querySelector('.modal-top');
  if (modalTop && modalTop.classList.contains('mermaid-expanded')) {
    modalTop.classList.remove('mermaid-expanded');
  }
}

/**
 * Call resetModalLayout when switching back to project information view
 */
function switchToProjectInfoView() {
  resetModalLayout();
  console.log('Switched back to project information view.');
}

/**
 * Display project images in the modal (simple horizontal slider version)
 * @param {Object} project - The project object
 */
export function showImagesInModal(project) {
  console.log('showImagesInModal called with project:', project.title);

  const modalImages = document.getElementById('modalImages');
  if (!modalImages) return;

  let imageArea = document.getElementById('imageArea');
  if (!imageArea) {
    imageArea = document.createElement('div');
    imageArea.id = 'imageArea';
    modalImages.prepend(imageArea);
  }
  imageArea.innerHTML = '';

  modalImages.classList.remove('mermaid-view');
  modalImages.classList.add('images-view');

  // Ensure proper scrolling for project description
  const modalBottom = document.querySelector('.modal-bottom');
  if (modalBottom) {
    modalBottom.style.maxHeight = '300px';
    modalBottom.style.overflowY = 'auto';
    modalBottom.style.paddingRight = '5px';
  }

  // Remove mermaid container if present
  const mermaidContainer = document.getElementById('mermaidContainer');
  if (mermaidContainer) {
    mermaidContainer.style.display = 'none';
    mermaidContainer.innerHTML = '';
  }
  const noMermaidMsg = modalImages.querySelector('.no-mermaid');
  if (noMermaidMsg) noMermaidMsg.style.display = 'none';

  // If there are no images, show the placeholder instead of the slider
  const images = (project.images || []);
  if (!images.length) {
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
    imageArea.appendChild(placeholderDiv);
    return;
  }

  // Create slider container
  const slider = document.createElement('div');
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
  imagesWrapper.style.width = '100%'; // Ensure full width
  imagesWrapper.style.overflow = 'visible'; // Allow overflow for the sliding effect

  // Add images
  images.forEach((imgSrc, idx) => {
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
  });

  slider.appendChild(imagesWrapper);

  // Add arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-arrow simple-prev';
  prevBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#fff"/><path d="M14.7 17.3a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4l4-4a1 1 0 1 1 1.4 1.4L11.42 12l3.3 3.3a1 1 0 0 1 0 1.4z" fill="#6750A4"/></svg>`;
  prevBtn.style.position = 'absolute';
  prevBtn.style.left = '10px';
  prevBtn.style.top = '50%';
  prevBtn.style.transform = 'translateY(-50%)';
  prevBtn.style.zIndex = '200'; // Increased z-index to ensure visibility
  prevBtn.style.background = 'rgba(255,255,255,0.8)';
  prevBtn.style.border = 'none';
  prevBtn.style.borderRadius = '50%';
  prevBtn.style.width = '40px';
  prevBtn.style.height = '40px';
  prevBtn.style.fontSize = '1.5rem';
  prevBtn.style.cursor = 'pointer';
  prevBtn.style.display = 'flex'; // Ensure display is explicitly set to flex
  prevBtn.style.alignItems = 'center';
  prevBtn.style.justifyContent = 'center';
  prevBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)'; // More visible shadow

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-arrow simple-next';
  nextBtn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="#fff"/><path d="M9.3 6.7a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 1 1-1.4-1.4L12.58 12l-3.3-3.3a1 1 0 0 1 0-1.4z" fill="#6750A4"/></svg>`;
  nextBtn.style.position = 'absolute';
  nextBtn.style.right = '10px';
  nextBtn.style.top = '50%';
  nextBtn.style.transform = 'translateY(-50%)';
  nextBtn.style.zIndex = '200'; // Increased z-index to ensure visibility
  nextBtn.style.background = 'rgba(255,255,255,0.8)';
  nextBtn.style.border = 'none';
  nextBtn.style.borderRadius = '50%';
  nextBtn.style.width = '40px';
  nextBtn.style.height = '40px';
  nextBtn.style.fontSize = '1.5rem';
  nextBtn.style.cursor = 'pointer';
  nextBtn.style.display = 'flex'; // Ensure display is explicitly set to flex
  nextBtn.style.alignItems = 'center';
  nextBtn.style.justifyContent = 'center';
  nextBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)'; // More visible shadow

  slider.appendChild(prevBtn);
  slider.appendChild(nextBtn);

  // Hide arrows if only one image
  if (images.length === 1) {
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
  }

  // Add slider to imageArea (not the whole modalImages)
  imageArea.appendChild(slider);

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
  // #debug
  console.log('showMermaidDiagramInModal called with project:', project.title);

  const modalImages = document.getElementById('modalImages');
  if (!modalImages) return;

  // Reset modal structure before rendering Mermaid diagram
  resetModalStructure();
  
  // Update modal classes for mermaid view
  modalImages.classList.remove('images-view');
  modalImages.classList.add('mermaid-view');

  const mermaidContainer = document.getElementById('mermaidContainer');
  if (!mermaidContainer) {
    console.error('mermaidContainer not found');
    return;
  }

  // Ensure proper scrolling behavior for description
  const modalBottom = document.querySelector('.modal-bottom');
  if (modalBottom) {
    // Make sure modal-bottom maintains its scrollable behavior
    modalBottom.style.maxHeight = '300px';
    modalBottom.style.overflowY = 'auto';
  }

  // Guard against multiple renders
  if (mermaidContainer.dataset.rendered) {
    mermaidContainer.style.display = 'flex';
    const noMermaidMsg = modalImages.querySelector('.no-mermaid');
    if (noMermaidMsg) noMermaidMsg.style.display = 'none';
    return;
  }

  const noMermaidMsg = modalImages.querySelector('.no-mermaid');

  const mermaidCode = parseMermaidCode(project);
  // #debug
  console.log('Parsed mermaid code:', mermaidCode ? `${mermaidCode.slice(0, 50)}...` : 'None');

  if (!mermaidCode || !mermaidCode.trim()) {
    // #debug
    if (mermaidContainer) mermaidContainer.style.display = 'none';
    if (noMermaidMsg) noMermaidMsg.style.display = 'block';
    return;
  }

  if (mermaidContainer) {
  // #debug
    console.log('Found mermaid container, setting up for rendering');
    mermaidContainer.style.display = 'flex';
    if (mermaidCode.trim().startsWith('<svg')) {
      mermaidContainer.innerHTML = mermaidCode;
      mermaidContainer.dataset.rendered = 'true';
    } else {
      mermaidContainer.textContent = mermaidCode;
      renderMermaidDiagram(mermaidContainer);
    }
  } else {
    console.error('mermaidContainer not found in DOM!');
  }
}

/**
 * Renders a mermaid diagram in the given element
 * @param {HTMLElement} mermaidElement - The element containing the mermaid code
 */
export function renderMermaidDiagram(mermaidElement) {
  console.log('renderMermaidDiagram called with element:', mermaidElement);
  console.log('mermaidElement content:', mermaidElement.textContent);

  setTimeout(() => {
    try {
      // Ensure mermaid is properly initialized
      if (typeof window.mermaid !== 'undefined') {
      // # debug
        console.log('Mermaid is defined globally. Initializing with theme:', document.body.classList.contains('dark-mode') ? 'dark' : 'default');
        window.mermaid.initialize({ 
          startOnLoad: false,
          securityLevel: 'loose',
          theme: document.body.classList.contains('dark-mode') ? 'dark' : 'default'
        });

        const mermaidInstance = window.mermaid;
        if (mermaidInstance && typeof mermaidInstance.render === 'function') {
          console.log('Using mermaid.render() function');
          const svgId = `mermaid-svg-${Date.now()}`;

          const diagramCode = mermaidElement.textContent || '';
          console.log('Diagram code to render:', diagramCode);

          const renderResult = mermaidInstance.render(svgId, diagramCode);
          if (renderResult && typeof renderResult.then === 'function') {
            renderResult
              .then(result => {
                console.log('Mermaid render successful:', result);
                mermaidElement.innerHTML = result.svg;
                mermaidElement.dataset.rendered = 'true';

                setTimeout(() => {
                  const svg = mermaidElement.querySelector('svg');
                  if (svg) {
                    svg.style.display = 'block';
                    svg.style.width = '100%';
                    svg.style.height = 'auto';
                    applyPanzoomToSvg(mermaidElement);
                  } else {
                    console.warn('SVG not found after mermaid render');
                  }
                }, 50);
              })
              .catch(error => {
                console.error('Mermaid rendering error:', error);
                mermaidElement.textContent = 'Error rendering diagram. Check your mermaid syntax.';
                mermaidElement.style.color = 'red';
              });
          } else if (renderResult && typeof renderResult.svg === 'string') {
            console.log('Synchronous render successful');
            mermaidElement.innerHTML = renderResult.svg;
            mermaidElement.dataset.rendered = 'true';
            setTimeout(() => {
              const svg = mermaidElement.querySelector('svg');
              if (svg) {
                svg.style.display = 'block';
                svg.style.width = '100%';
                svg.style.height = 'auto';
                applyPanzoomToSvg(mermaidElement);
              } else {
                console.warn('SVG not found after mermaid render');
              }
            }, 50);
          } else {
            console.error('Mermaid render did not return expected result:', renderResult);
          }
        } else if (mermaidInstance && typeof mermaidInstance.init === 'function') {
          console.log('Falling back to mermaid.init() function');
          mermaidInstance.init(undefined, mermaidElement);
          mermaidElement.dataset.rendered = 'true';
          console.log("Mermaid diagram rendered with init");
          applyPanzoomToSvg(mermaidElement);
        } else {
          console.error('Neither mermaid.render nor mermaid.init is available');
          throw new Error("Mermaid API not available");
        }
      } else {
        console.error("Mermaid library not available, attempting to load from CDN");

        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js";
        script.onload = () => {
          console.log("Mermaid loaded from CDN, retrying render");
          renderMermaidDiagram(mermaidElement);
        };
        script.onerror = () => {
          console.error("Failed to load mermaid from CDN");
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

        // Constrain panzoom to the mermaidElement container
        panzoom(svgElement, {
          smoothScroll: false,
          maxZoom: 5,
          minZoom: 0.5,
          bounds: true,
          boundsPadding: 0.05,
        });
      }
    } catch (pzError) {
      console.error("Panzoom error:", pzError);
    }
  }, 300);

  // Ensure the Mermaid container and SVG are visible after rendering
  setTimeout(() => {
    const svgElement = mermaidElement.querySelector('svg');
    if (svgElement) {
      svgElement.style.display = 'block';
      svgElement.style.width = '100%';
      svgElement.style.height = 'auto';
      mermaidElement.style.display = 'flex';
      mermaidElement.style.justifyContent = 'center';
      mermaidElement.style.alignItems = 'center';
    } else {
      console.warn('SVG not found after Mermaid render');
    }
  }, 100);
}