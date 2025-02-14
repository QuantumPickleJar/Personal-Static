import { getStackImages, initStackLayout } from './stackParser.js';

export async function loadStackImages(stack) {
  console.debug("[imageLoader] Starting loadStackImages with stack:", stack);
  const stackBox = document.getElementById('stackBox');
  if (!stackBox) {
    console.error("[imageLoader] No element with id 'stackBox' found.");
    return;
  }
  
  try {
    // Clear existing content if needed
    stackBox.innerHTML = '';
    console.debug("[imageLoader] Cleared stackBox content.");
    
    const parsedStack = getStackImages(stack);
    console.debug("[imageLoader] Parsed stack images:", parsedStack);
    
    parsedStack.forEach(item => {
      if (item.src) {
        // Create an image element if mapping was found
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.name;
        stackBox.appendChild(img);
        console.debug(`[imageLoader] Appended image for ${item.name} with src: ${item.src}`);
      } else {
        // Fallback: render stack item as plaintext
        const textNode = document.createElement('span');
        textNode.textContent = item.name;
        stackBox.appendChild(textNode);
        console.debug(`[imageLoader] Appended text node for ${item.name}`);
      }
    });
    
    initStackLayout();
  } catch (error) {
    console.error("[imageLoader] Error loading stack images:", error);
  }
}