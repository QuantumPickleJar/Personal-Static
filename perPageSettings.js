// Helper to compute the number of projects that fit without vertical scrolling
export function computeProjectsPerPage() {
  const gap = 16; // gap between cards
  const isLarge = window.innerWidth >= 768;
  // Use smaller cards for large screens so 4 can fit
  const cardWidth = isLarge ? 300 + gap : 350 + gap;
  const cardHeight = isLarge ? 325 + gap : 425 + gap;
  
  // Columns based on available viewport width
  const columns = Math.max(1, Math.floor(window.innerWidth / cardWidth));
  // Full rows based on viewport height
  const rows = Math.max(1, Math.floor(window.innerHeight / cardHeight));
  
  // Ensure at least 6 cards fit
  return Math.max(6, columns * rows);
}

// Initialize projectsPerPage value
export let projectsPerPage = computeProjectsPerPage();

// Update projectsPerPage on resize
window.addEventListener('resize', () => {
  projectsPerPage = computeProjectsPerPage();
});