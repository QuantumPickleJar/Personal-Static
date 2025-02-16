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
    if (!stack || stack.length === 0) {
      // Just return a generic placeholder file if you have one
      console.error('Project has no stack!');
      // return 'rsc/images/placeholder-generic.png';
    }
  
    // Read placeholder data from project.json in the tech’s folder
    const [mainTech] = stack;
    const projectJsonPath = `rsc/stack/${mainTech}/project.json`;
    let placeholder = 'rsc/images/placeholder-generic.png';

    try {
      // Synchronously load the JSON from the project's folder
      const xhr = new XMLHttpRequest();
      xhr.open('GET', projectJsonPath, false); // synchronous request
      xhr.send(null);
      
      if (xhr.status === 200) {
      const projectData = JSON.parse(xhr.responseText);
      // If the project's images array is empty, use the stack placeholder
      if (!Array.isArray(projectData.images) || projectData.images.length === 0) {
        placeholder = projectData.stack || placeholder;
      }
      }
    } catch (error) {
      console.error('Error loading project.json:', error);
    }
    
    return placeholder;
  }
  