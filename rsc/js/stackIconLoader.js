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
  console.log(`Looking up icon for tech: "${normalizedTech}"`);
  // Attempt to find an inline SVG from the map
  const rawSvg = iconSvgs[normalizedTech];
  console.log(`Found icon:`, rawSvg);
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
  // Attempt to load an inline SVG
  const iconUrl = getIcon(normalizedTech);
  if (iconUrl) {
    // Use the inline SVG data URI
    const imgEl = document.createElement('img');
    imgEl.src = iconUrl;
    imgEl.alt = normalizedTech;
    imgEl.classList.add('stack-image');
    return imgEl;
  } else {
    // If not found, fallback to local PNG in the "rsc/images/stack" directory
    const fallback = document.createElement('img');
    fallback.src = `rsc/images/stack/${normalizedTech.toLowerCase()}.png`;
    fallback.alt = normalizedTech;
    fallback.classList.add('stack-image');
    return fallback;
  }
}
