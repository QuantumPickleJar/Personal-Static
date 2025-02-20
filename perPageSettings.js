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
  
  return columns * rows;
}

export function applyPagination() {
  // Read settings from localStorage or global state
  const storedSettings = localStorage.getItem('paginationSettings');
  if (storedSettings) {
    const parsedSettings = JSON.parse(storedSettings);
    // If a projectsPerPage value is stored, override the computed value
    if (parsedSettings.projectsPerPage) {
      projectsPerPage = parsedSettings.projectsPerPage;
    }
  }
}

// Load pagination settings from localStorage (returns an object or an empty object)
export function loadPaginationSettings() {
  const storedSettings = localStorage.getItem('paginationSettings');
  return storedSettings ? JSON.parse(storedSettings) : {};
}

// Save the entire settings object to localStorage
export function savePaginationSettings(settings) {
  localStorage.setItem('paginationSettings', JSON.stringify(settings));
}

// Update settings (merging new settings into existing ones)
export function updatePaginationSettings(newSettings) {
  const currentSettings = loadPaginationSettings();
  const updatedSettings = { ...currentSettings, ...newSettings };
  savePaginationSettings(updatedSettings);
  // If projectsPerPage is updated, update the global variable as well
  if (updatedSettings.projectsPerPage) {
    projectsPerPage = updatedSettings.projectsPerPage;
  }
}


// Initialize projectsPerPage value
export let projectsPerPage = computeProjectsPerPage();

// Update projectsPerPage on resize
window.addEventListener('resize', () => {
  projectsPerPage = computeProjectsPerPage();
});

