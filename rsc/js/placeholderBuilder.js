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
  // If the project already has images defined, use the first one.
  if (Array.isArray(project.images) && project.images.length > 0) {
    return project.images[0];
  }

  const stack = project.stack;
  if (!stack || stack.length === 0) {
    console.error('Project has no stack!');
    return 'rsc/images/placeholder-generic.png';
  }

  return createCircularPlaceholder(stack);
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
  // Arrange all tech icons in a circular layout.
  stack.forEach((tech, index) => {
    // Use getIcon to fetch the inline SVG as a data URI.
    let iconDataUri = getIcon(tech);
    // Fallback: if no inline SVG is available, use a local PNG.
    if (!iconDataUri) {
      iconDataUri = `rsc/images/stack/${tech.toLowerCase()}.png`;
    }
    // Calculate angle for even placement.
    const angle = (2 * Math.PI / total) * index;
    // Place icons on a smaller circle.
    const iconRadius = 30;
    const iconX = centerX + iconRadius * Math.cos(angle) - 10; // Centering the 20px wide icon.
    const iconY = centerY + iconRadius * Math.sin(angle) - 10; // Centering the 20px tall icon.
    iconsSVG += `<image href="${iconDataUri}" x="${iconX}" y="${iconY}" width="20" height="20" />`;
  });

  // Build the complete SVG string.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
      <circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="#fff" stroke="#ccc" stroke-width="2" />
      ${iconsSVG}
    </svg>
  `;
  
  // Return the SVG as a Base64-encoded data URI.
  return 'data:image/svg+xml;base64,' + btoa(svg);
}
