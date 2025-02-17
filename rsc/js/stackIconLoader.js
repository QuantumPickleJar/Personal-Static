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


/**
 * Load an icon from 'tech-stack-icons' if possible, else fallback.
 * @param {string} techName - The technology name, e.g. 'React', 'NodeJS', 'DotNet'.
 * @param {string} localPath - Path to local fallback icons directory.
 * @returns {Promise<string>} The URL (or data URI) of the icon.
 */
import { iconSvgs } from './stackIconMap.js';

/**
 * @function getIcon
 * @description Looks up an inline SVG by name and returns it as a base64 Data URI
 *              so it can be used in `<img src="...">` directly
 * @param {string} techName - e.g. 'C#', 'Angular'
 * @returns {string|null} data URI of the inline SVG or null if not found
 */
export function getIcon(techName) {
  const svg = iconSvgs[techName];
  if (!svg) return null; // or fallback to a local .png

  const base64Encoded = btoa(svg);
  return `data:image/svg+xml;base64,${base64Encoded}`;
}


  // this might be redundant code, wrote this in a daze
  /** Supposed to make a default image for projects lacking any for the carousel
   * to be populated with
   */
  export function createStackImage(tech) {
  try {
    const iconUrl = getIcon(tech);
    if (iconUrl) {
      const img = document.createElement('img');
      img.src = iconUrl;
      img.alt = tech;
      return img;
    }
  } catch (err) {
    console.error('Failed to load icon for', tech, err);
  }
  // fallback if no icon
  const fallbackImg = document.createElement('img');
  fallbackImg.src = `rsc/images/${tech.toLowerCase()}.png`;
  return fallbackImg;
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

  