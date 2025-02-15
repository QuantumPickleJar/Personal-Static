import { getIconPath } from 'tech-stack-icons';

export function getStackImages(stackArray) {
  return stackArray.map(item => {
    const src = getIconPath(item); // Assume getIconPath returns an icon path or undefined
    return { name: item, src: src || null };
  });
}

export function initStackLayout() {
    const stackBox = document.getElementById('stackBox');
    console.debug("[stackParser] Initializing stack layout...");
    if (!stackBox) {
        console.error("[stackParser] No element with id 'stackBox' found.");
        return;
    }

    // Example layout initialization logic
    const images = stackBox.getElementsByTagName('img');
    console.debug(`[stackParser] Found ${images.length} image(s) in stackBox.`);
    for (let img of images) {
        img.style.margin = '10px';
        img.style.border = '1px solid #ccc';
        console.debug(`[stackParser] Applied styles to image with src: ${img.src}`);
    }

    // Additional layout logic can be added here
    console.log("Stack layout initialized");
}