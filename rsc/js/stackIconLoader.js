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
  
  // Attempt to load an inline SVG
  let iconUrl = getIcon(normalizedTech);
  if (iconUrl) {
    // Use the inline SVG data URI
    const imgEl = document.createElement('img');
    imgEl.src = iconUrl;
    imgEl.alt = normalizedTech;
    imgEl.classList.add('stack-image');
    return imgEl;
  } else {
    // If not found, fallback to local PNG with correct base path
    let pngPath = `${basePath}rsc/images/stack/${normalizedTech.toLowerCase()}.png`;
    console.log(`Fallback triggered for ${normalizedTech}. Attempting to load PNG from: ${pngPath}`);
    const fallback = document.createElement('img');
    fallback.src = pngPath;
    fallback.alt = normalizedTech;
    fallback.classList.add('stack-image');
    fallback.onerror = () => {
      console.error(`Failed to load image: ${fallback.src}`);
      // Attempt to load the image with the original casing
      pngPath = `${basePath}rsc/images/stack/${tech}.png`;
      fallback.src = pngPath;
      fallback.onerror = () => {
        console.error(`Failed to load image with original casing: ${fallback.src}`);
        fallback.src = `${basePath}rsc/images/placeholder-generic.png`; // Use a generic placeholder
      };
    };
    return fallback;
  }
}
