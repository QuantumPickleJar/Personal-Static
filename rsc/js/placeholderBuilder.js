import { getIcon } from './stackIconLoader.js';

/**
 * Returns a default placeholder image for a project without images.
 * If project.images is non-empty, returns the first image.
 * Otherwise, generates a circular SVG composed of the tech icons from project.stack.
 * @param {Object} project - The project object from projects.js.
 * @param {string[]} project.stack - The technology stack for the project.
 * @param {string[]} [project.images] - Optional images array.
 * @returns {string} A URL (or data URI) representing the placeholder image.
 */
export function getPlaceholderForStack(project) {
  // Add path prefix handling for GitHub Pages
  const basePath = window.location.hostname.includes('github.io') ? 
    '/Personal-Static/' : '/';
    
  // If the project already has images defined, use the first one
  if (Array.isArray(project.images) && project.images.length > 0) {
    return `${basePath}rsc/images/${project.images[0]}`;
  }

  const stack = project.stack;
  if (!stack || stack.length === 0) {
    console.error('Project has no stack!');
    return `${basePath}rsc/images/placeholder-generic.png`;
  }

  return createCircularPlaceholder(stack);
}

/**
 * Create a text-based SVG icon from technology name
 * @param {string} tech - Technology name 
 * @param {number} x - X position in SVG
 * @param {number} y - Y position in SVG
 * @returns {string} SVG markup for icon
 */
function createTextIcon(tech, x, y) {
  const letters = tech.substring(0, 2).toUpperCase();
  return `
    <circle cx="${x + 10}" cy="${y + 10}" r="10" fill="#f0f0f0" stroke="#ccc" />
    <text x="${x + 10}" y="${y + 14}" text-anchor="middle" font-size="10px" fill="#333">
      ${letters}
    </text>
  `;
}

/**
 * Builds a circular SVG image of icons arranged around a circle.
 * Each technology in the stack is mapped to its icon using getIcon from stackIconLoader.
 * Returns the SVG as a Base64-encoded data URI.
 * @param {string[]} stack - The technology stack.
 * @returns {string} A data URI representing the generated SVG image.
 */
function createCircularPlaceholder(stack) {
  // Set up an SVG viewbox of 100x100 pixels with a circle background.
  const centerX = 50;  
  const centerY = 50;
  const radius = 45;
  let iconsSVG = '';
  const total = stack.length;
  
  // Add path prefix handling for GitHub Pages
  const basePath = window.location.hostname.includes('github.io') ? 
    '/Personal-Static/' : '/';
  
  stack.forEach((tech, index) => {
    const angle = (2 * Math.PI / total) * index;
    const iconRadius = 30;  // Arrange all tech icons in a circular layout.
    const iconX = centerX + iconRadius * Math.cos(angle) - 10;
    const iconY = centerY + iconRadius * Math.sin(angle) - 10;
    
    // First try - SVG from getIcon
    let iconDataUri = getIcon(tech);
    
    if (iconDataUri) {
      // SVG found, use it directly
      iconsSVG += `<image href="${iconDataUri}" x="${iconX}" y="${iconY}" width="20" height="20" />`;
    } 
    else {
      // Try multiple path variations for better compatibility with stackIconLoader.js
      const normalizedTech = tech.trim().toLowerCase();
      
      // Create a group that will contain both the image attempt and fallback text
      iconsSVG += `
        <g>
          <!-- Fallback text will be visible if the image fails to load -->
          ${createTextIcon(tech, iconX, iconY)}
          
          <!-- Try both lowercase and original casing for the image -->
          <image href="${basePath}rsc/images/stack/${normalizedTech}.png" x="${iconX}" y="${iconY}" width="20" height="20" />
          <image href="${basePath}rsc/images/stack/${tech}.png" x="${iconX}" y="${iconY}" width="20" height="20" />
        </g>
      `;
    }
  });

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#fff" stroke="#ccc" stroke-width="2" />
      ${iconsSVG}
    </svg>
  `;

  return 'data:image/svg+xml;base64,' + btoa(svg);
}
