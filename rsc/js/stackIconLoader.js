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
  console.log('Initializing stack filter chips');
  const chipContainer = document.getElementById('stackFilterChips');
  
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
      
      // Apply filters immediately
      applyTechFilters();
    });
    
    chipContainer.appendChild(chip);
  });
  
  // Make the tech filter card stay visible when interacting with it
  const techFilterCard = document.getElementById('techFilterCard');
  if (techFilterCard) {
    // Prevent clicks inside the card from closing the menu
    techFilterCard.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Show the card when hovering over the trigger
    const filterTechTrigger = document.getElementById('filterTechTrigger');
    if (filterTechTrigger) {
      filterTechTrigger.addEventListener('mouseenter', () => {
        techFilterCard.classList.add('visible');
      });
      
      // Additional event listeners for better UX
      techFilterCard.addEventListener('mouseenter', () => {
        techFilterCard.classList.add('visible');
      });
      
      techFilterCard.addEventListener('mouseleave', () => {
        // Small delay to prevent flickering when moving between trigger and card
        setTimeout(() => {
          if (!document.querySelector(':hover').closest('#filterTechTrigger')) {
            techFilterCard.classList.remove('visible');
          }
        }, 50);
      });
    }
  }
  
  console.log(`Created ${Object.keys(stackSvgMap).length} technology filter chips`);
}

/**
 * Apply technology filters based on selected chips
 */
function applyTechFilters() {
  // Get all selected technologies
  const selectedTechs = Array.from(
    document.querySelectorAll('.custom-filter-chip.selected')
  ).map(chip => chip.dataset.tech);
  
  console.log('Filtering by technologies:', selectedTechs);
  
  // If no tech filters selected, show all cards
  if (selectedTechs.length === 0) {
    // Check if other filters are applied
    const hasImagesFilter = document.getElementById('filterImages')?.classList.contains('selected');
    const hasMermaidFilter = document.getElementById('filterMermaid')?.classList.contains('selected');
    
    if (!hasImagesFilter && !hasMermaidFilter) {
      // No filters at all, show all projects
      initPagination(allProjects, projectsPerPage);
    } else {
      // Other filters applied but no tech filters
      window.applyAllFilters();
    }
    return;
  }
  
  // Get filtered projects based on selected technologies
  const filteredProjects = allProjects.filter(project => {
    // Check if project has any of the selected technologies
    if (!project.stack || !Array.isArray(project.stack)) return false;
    
    return selectedTechs.some(tech => 
      project.stack.some(projectTech => 
        projectTech.toLowerCase().includes(tech.toLowerCase())
      )
    );
  });
  
  console.log(`Found ${filteredProjects.length} projects matching selected technologies`);
  
  // Also check other filters (images and mermaid)
  const hasImagesFilter = document.getElementById('filterImages')?.classList.contains('selected');
  const hasMermaidFilter = document.getElementById('filterMermaid')?.classList.contains('selected');
  
  const finalFilteredProjects = filteredProjects.filter(project => {
    if (hasImagesFilter && (!project.images || project.images.length === 0)) {
      return false;
    }
    
    if (hasMermaidFilter && (!project.mermaid || project.mermaid.trim().length === 0)) {
      return false;
    }
    
    return true;
  });
  
  // Apply pagination with filtered projects
  initPagination(finalFilteredProjects, projectsPerPage);
}

// Call this function when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize stack filter chips
  initializeStackFilterChips();
  
  // Add global applyFilters function (combines all filter types)
  window.applyAllFilters = function() {
    // First apply image and mermaid filters
    const hasImagesFilter = document.getElementById('filterImages')?.classList.contains('selected') || false;
    const hasMermaidFilter = document.getElementById('filterMermaid')?.classList.contains('selected') || false;
    
    // If no filters, reset to all projects
    if (!hasImagesFilter && !hasMermaidFilter) {
      // Get selected tech filters
      const selectedTechs = Array.from(
        document.querySelectorAll('.custom-filter-chip.selected')
      );
      
      // If no tech filters either, show all projects and reset to page 1
      if (selectedTechs.length === 0) {
        initPagination(allProjects, projectsPerPage);
        return;
      }
    }
    
    // Get all project cards
    const projectCards = document.querySelectorAll('.project-card');
    const filteredProjects = [];
    
    projectCards.forEach(card => {
      let showCard = true;
      
      // Check image filter
      if (hasImagesFilter) {
        const hasImages = card.querySelector('.image-count-icon')?.style.display !== 'none';
        if (!hasImages) showCard = false;
      }
      
      // Check mermaid filter
      if (hasMermaidFilter && showCard) {
        const hasMermaid = card.querySelector('.mermaid-icon')?.style.display !== 'none';
        if (!hasMermaid) showCard = false;
      }
      
      if (showCard) {
        filteredProjects.push(card);
      }
      
      // Apply initial display state
      card.style.display = showCard ? '' : 'none';
    });
    
    // Reset pagination to page 1 with filtered projects
    if (filteredProjects.length > 0) {
      initPagination(filteredProjects, projectsPerPage);
    }
    
    // Then apply tech filters on cards that are still visible
    applyTechFilters();
  };
});
