import { getIcon, renderOneStackIcon } from './stackIconLoader.js';

/**
 * Returns a placeholder image for a project
 * @param {Object} project - The project object
 * @returns {string} Image URL or data URI
 */
export function getPlaceholderForStack(project) {
  const basePath = window.location.hostname.includes('github.io') ? '/Personal-Static/' : '/';
    
  // Use first image if available
  if (project.images?.length > 0) return `${basePath}rsc/images/${project.images[0]}`;

  // Fall back to stack-based placeholder or generic
  return (!project.stack?.length) ? 
    `${basePath}rsc/images/placeholder-generic.png` : 
    createCircularPlaceholder(project.stack);
}

/**
 * Create text fallback icon
 */
function createTextIcon(tech, x, y) {
  const letters = tech.substring(0, 2).toUpperCase();
  return `<circle cx="${x + 10}" cy="${y + 10}" r="10" fill="#f0f0f0" stroke="#ccc" />
    <text x="${x + 10}" y="${y + 14}" text-anchor="middle" font-size="10px" fill="#333">${letters}</text>`;
}

/**
 * Builds a circular SVG with stack icons
 * @param {string[]} stack - Technology stack
 * @returns {string} SVG data URI
 */
function createCircularPlaceholder(stack) {
  const centerX = 50, centerY = 50, radius = 45;
  const basePath = window.location.hostname.includes('github.io') ? '/Personal-Static/' : '/';
  let iconsSVG = '';
  
  stack.forEach((tech, i) => {
    const angle = (2 * Math.PI / stack.length) * i;
    const iconX = centerX + 30 * Math.cos(angle) - 10;
    const iconY = centerY + 30 * Math.sin(angle) - 10;
    
    // Try SVG from getIcon first
    const iconDataUri = getIcon(tech);
    
    if (iconDataUri) {
      const safeIcon = iconDataUri.replace(/"/g, "'").replace(/#/g, '%23');
      iconsSVG += `<image href="${safeIcon}" x="${iconX}" y="${iconY}" width="20" height="20" />`;
    } else {
      // Fallback to image or text
      const normalizedTech = tech.trim().toLowerCase();
      iconsSVG += `<g>${createTextIcon(tech, iconX, iconY)}
        <image href="${basePath}rsc/images/stack/${normalizedTech}.png" x="${iconX}" y="${iconY}" width="20" height="20" onerror="this.style.display='none'" />
        <image href="${basePath}rsc/images/stack/${tech}.png" x="${iconX}" y="${iconY}" width="20" height="20" onerror="this.style.display='none'" />
      </g>`;
    }
  });

  try {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#fff" stroke="#ccc" stroke-width="2" />
        ${iconsSVG}
      </svg>`
    );
  } catch (e) {
    console.error('SVG error:', e);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="45" fill="#fff" stroke="#ccc" stroke-width="2" /></svg>');
  }
}

/**
 * Sets up stack icons in a container
 * @param {HTMLElement} container - Container element
 * @param {Array} stack - Technology names
 */
export function setupStackIcons(container, stack) {
  container.innerHTML = '';
  if (!stack || stack.length === 0) return;
  
  // Use renderOneStackIcon for better visualization with icons
  stack.forEach(tech => {
    if (!tech) return;
    const iconContainer = renderOneStackIcon(tech);
    container.appendChild(iconContainer);
  });
}
