/**
 * @file stackIconLoader.js
 * @description Handles fetching tech-stack-icons from the internet or falling back to local icons.
 */

/** 
 * Example usage: 
 *   const iconUrl = await loadTechIcon('React');
 *   // iconUrl => remote SVG if found, else local fallback.
 */

import { iconSvgs } from './stackSvgMap.js';
import { allProjects } from './projects.js';
import { initPagination } from './pagination.js';
import { projectsPerPage } from './perPageSettings.js';

// Export mapping of tech names to icons for external use
export const stackSvgMap = iconSvgs;

/**
 * @function getIcon
 * @description Looks up an inline SVG by name and returns it as a base64 Data URI
 *              so it can be used in <img src="...">.
 * @param {string} techName - e.g. 'React', 'NodeJS', 'dotNet'
 * @returns {string|null} - data URI of the inline SVG or null if not found
 */
export function getIcon(techName) {
  // Trim whitespace from the techName for consistency
  const normalizedTech = techName.trim();
  // Debug: log the normalized name and lookup result
  // console.log(`Looking up icon for tech: "${normalizedTech}"`);
  // Attempt to find an inline SVG from the map
  const rawSvg = iconSvgs[normalizedTech];
  // console.log(`Found icon:`, rawSvg);
  if (!rawSvg) {
    // not found -> return null so you can fallback to local .png
    return null;
  }

  // Convert the raw <svg> string to base64
  const base64 = btoa(rawSvg);
  // Return as a data URI
  return `data:image/svg+xml;base64,${base64}`;
}

export function renderOneStackIcon(tech) {
  const normalizedTech = tech.trim();
  // Add path prefix handling for GitHub Pages
  const basePath = window.location.hostname.includes('github.io') ? 
    '/Personal-Static/' : '/';
  
  // Create container for icon + text
  const container = document.createElement('div');
  container.classList.add('stack-item-container');
  
  // Store tech name as data attribute for tooltip
  container.setAttribute('data-tech', tech);
  
  // Attempt to load an inline SVG
  let iconUrl = getIcon(normalizedTech);
  let iconElement;
  
  if (iconUrl) {
    // Use the inline SVG data URI
    iconElement = document.createElement('img');
    iconElement.src = iconUrl;
    iconElement.alt = normalizedTech;
    iconElement.classList.add('stack-image');
  } else {
    // If not found, fallback to local PNG with correct base path
    let pngPath = `${basePath}rsc/images/stack/${normalizedTech.toLowerCase()}.png`;
    // TODO:
    // # debug
    console.log(`Fallback triggered for ${normalizedTech}. Attempting to load PNG from: ${pngPath}`);
    iconElement = document.createElement('img');
    iconElement.src = pngPath;
    iconElement.alt = normalizedTech;
    iconElement.classList.add('stack-image');
    
    // Track if we've already tried fallbacks to avoid infinite retries
    let fallbackAttempted = false;
    
    iconElement.onerror = () => {
      if (fallbackAttempted) {
        console.warn(`Unable to load icon for ${tech}, using text label instead`);
        // Create a text fallback instead of trying another image
        const textFallback = document.createElement('span');
        textFallback.textContent = tech.substring(0, 2).toUpperCase();
        textFallback.classList.add('stack-text-fallback');
        textFallback.style.padding = '3px 5px';
        textFallback.style.backgroundColor = '#f0f0f0';
        textFallback.style.borderRadius = '3px';
        textFallback.style.fontSize = '0.8em';
        
        // Replace the img with this span in the container
        if (container.contains(iconElement)) {
          container.replaceChild(textFallback, iconElement);
        }
        return;
      }
      
      fallbackAttempted = true;
      console.error(`Failed to load image: ${iconElement.src}`);
      
      // Try with original casing one time only
      pngPath = `${basePath}rsc/images/stack/${tech}.png`;
      iconElement.src = pngPath;
    };
  }
  
  // Add icon to container
  container.appendChild(iconElement);
  
  // Add label with tech name
  const label = document.createElement('span');
  label.textContent = tech;
  label.classList.add('stack-label');
  container.appendChild(label);
  
  return container;
}

/**
 * Initialize stack filter chips for technology filtering
 */
export function initializeStackFilterChips() {
  const chipContainer = document.getElementById('stackFilterChips');
  // # debug
  // console.log('Initializing stack filter chips');
  
  if (!chipContainer) {
    console.error('Stack filter chip container not found');
    return;
  }
 
  // Clear existing chips
  chipContainer.innerHTML = '';
  
  // Create custom chips for each technology
  Object.keys(stackSvgMap).sort().forEach(tech => {
    const chip = document.createElement('div');
    chip.className = 'custom-filter-chip';
    chip.textContent = tech;
    chip.dataset.tech = tech;
    
    chip.addEventListener('click', (e) => {
      // Toggle selection state
      chip.classList.toggle('selected');
      
      // Don't close the menu or card when clicking chips
      e.stopPropagation();
      
      // Apply filters immediately using unified logic
      if (window.applyAllFilters) window.applyAllFilters();
    });
    
    chipContainer.appendChild(chip);
  });
  
  // Make the tech filter card stay visible when interacting with it
  const techFilterCard = document.getElementById('techFilterCard');
  const filterTechTrigger = document.getElementById('filterTechTrigger');
  if (techFilterCard && filterTechTrigger) {
    // Prevent clicks inside the card from closing the menu
    techFilterCard.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Show/hide the card on hover (desktop)
    filterTechTrigger.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        techFilterCard.classList.add('visible');
      }
    });
    techFilterCard.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        techFilterCard.classList.add('visible');
      }
    });
    techFilterCard.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768) {
        setTimeout(() => {
          if (!document.querySelector(':hover').closest('#filterTechTrigger')) {
            techFilterCard.classList.remove('visible');
          }
        }, 50);
      }
    });

    // Show/hide the card on click (mobile/small screens)
    filterTechTrigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.stopPropagation();
        techFilterCard.classList.toggle('visible');
        // Close when clicking outside
        if (techFilterCard.classList.contains('visible')) {
          document.addEventListener('click', closeTechCardOnClickOutside, { once: true });
        }
      }
    });
    function closeTechCardOnClickOutside(ev) {
      if (!techFilterCard.contains(ev.target) && ev.target !== filterTechTrigger) {
        techFilterCard.classList.remove('visible');
      }
    }
  }
  
  console.log(`Created ${Object.keys(stackSvgMap).length} technology filter chips`);
}

// Call this function when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize stack filter chips
  initializeStackFilterChips();
});
