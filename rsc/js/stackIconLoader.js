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
export async function loadTechIcon(techName, localPath = './rsc/images/stack') {
    try {
      // This import will fail if you're not bundling your code. 
      // If you see errors, either bundle the app or store icons locally.
      const { getIcon } = await import('tech-stack-icons');
  
      // Try to fetch the remote icon. This returns an SVG data URI.
      const remoteUrl = await getIcon(techName);
      if (remoteUrl) return remoteUrl;
    } catch (error) {
      console.warn(`Remote icon fetch failed for ${techName}`, error);
    }
  
    // Fallback to a local icon
    const fallbackFileName = techName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') + '.png'; 
    // e.g. "React" -> "react.png"
  
    return `${localPath}/${fallbackFileName}`;
  }
  