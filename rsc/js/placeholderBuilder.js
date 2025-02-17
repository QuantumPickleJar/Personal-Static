/**
 * @file placeholderBuilder.js
 * @summary Holds functions for generating a default image for projects
 * that do not have an image by checking the `stack` attribute 
 * @description Generates or selects a default placeholder if a project has no images.
 * @see projects.json
 * @see stackIconLoader.js
 * 
 */

/**
 * Generate a local placeholder path or create an SVG dynamically.
 * @param {string[]} stack - The technology stack for the project.
 * @returns {string} A URL or data URI representing the placeholder image.
 */
export function getPlaceholderForStack(stack) {
  // If there's no stack, use a generic placeholder
  if (!stack || stack.length === 0) {
    return 'rsc/images/placeholder-generic.png';
  }
  // Example: return an SVG data URI with the first tech name
  const mainTech = stack[0];
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="90" fill="lightgray" stroke="black" stroke-width="2"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-size="16" fill="black">
        ${mainTech}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
  