export function initStackLayout() {
  const stackBox = document.getElementById('stackBox');
  if (!stackBox) return;
  
  // Determine layout mode via data attribute (default: gallery/horizontal)
  const layoutMode = stackBox.dataset.layout || 'gallery';
  if (layoutMode === 'gallery') {
    stackBox.classList.add('horizontal-stack');
  } else if (layoutMode === 'modal') {
    stackBox.classList.add('vertical-stack');
  }
  
  // If no images exist, generate a placeholder element
  const images = stackBox.querySelectorAll('img');
  if (images.length === 0) {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.textContent = 'No stack images available';
    stackBox.appendChild(placeholder);
  }
}
