import { getStackImages } from './stackParser.js';

export async function loadStackImages(stack) {
  const stackBox = document.getElementById('stackBox');
  if (!stackBox) return;
  
  try {
    // Clear existing content if needed
    stackBox.innerHTML = '';
    
    const parsedStack = getStackImages(stack);
    
    parsedStack.forEach(item => {
      if (item.src) {
        // Create an image element if mapping was found
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.name;
        stackBox.appendChild(img);
      } else {
        // Fallback: render stack item as plaintext
        const textNode = document.createElement('span');
        textNode.textContent = item.name;
        stackBox.appendChild(textNode);
      }
    });
    
    // Optionally, reinitialize layout after images load:
    // import { initStackLayout } from './stackLayout.js';
    // initStackLayout();
  } catch (error) {
    console.error('Error loading stack images:', error);
  }
}