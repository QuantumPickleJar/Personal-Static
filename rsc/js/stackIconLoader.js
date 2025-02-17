/**
 * @file stackIconLoader.js
 * @description Handles fetching tech-stack-icons from the internet or falling back to local icons.
 */

/** 
 * Example usage: 
 *   const iconUrl = await loadTechIcon('React');
 *   // iconUrl => remote SVG if found, else local fallback.
 */

// NOTE: If you're using 'tech-stack-icons' in a purely client-side environment,
// you'll need to ensure the package is either shipped as a compiled library
// or you have a bundler that includes it. If that’s too tricky, you can
// store a small local library of icons in rsc/images/stack/.

import { iconSvgs } from './stackSvgMap.js';

/**
 * @function getIcon
 * @description Looks up an inline SVG by name and returns it as a base64 Data URI
 *              so it can be used in <img src="...">.
 * @param {string} techName - e.g. 'React', 'NodeJS', 'dotNet'
 * @returns {string|null} - data URI of the inline SVG or null if not found
 */
export function getIcon(techName) {
  // Attempt to find an inline SVG from the map
  const rawSvg = iconSvgs[techName];
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
    // Attempt to load an inline SVG
    const iconUrl = getIcon(tech);
    if (iconUrl) {
      // Use a data URI
      const imgEl = document.createElement('img');
      imgEl.src = iconUrl;
      imgEl.alt = tech;
      imgEl.classList.add('stack-image');
      return imgEl;
    } else {
      // If not found, fallback to local .png
      const fallback = document.createElement('img');
      fallback.src = `rsc/images/${tech.toLowerCase()}.png`;
      fallback.alt = tech;
      fallback.classList.add('stack-image');
      return fallback;
    }
  }