const basePath = window.location.hostname.includes('github.io') ? 
  '/Personal-Static/' : '/';

// Ensure Barba is loaded before running initialization
document.addEventListener('DOMContentLoaded', () => {
  // Check if Barba is available
  if (typeof barba === 'undefined') {
    console.warn('Barba.js is not loaded. Loading it dynamically...');
    loadBarba();
  } else {
    initBarba();
  }
});

// Function to dynamically load Barba.js if needed
function loadBarba() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/@barba/core';
  script.onload = initBarba;
  script.onerror = () => {
    console.error('Failed to load Barba.js. Falling back to normal page loads.');
  };
  document.head.appendChild(script);
}

// Initialize Barba transitions
function initBarba() {
  if (typeof barba === 'undefined') {
    console.error('Barba.js still not available after loading attempt.');
    return;
  }

  console.log('Initializing Barba.js transitions');
  
  // Insert this near the top of your file
  barba.hooks.before((data) => {
    // Check if we're navigating to projects page
    if (data.next.url.path.includes('projects.html')) {
      console.log('Navigating to projects page - bypassing Barba transition');
      window.location.href = data.next.url.href;
      return false; // Cancel Barba transition
    }
  });

  // Initialize Barba with default transitions
  barba.init({
    debug: true,
    transitions: [{
      name: 'default-transition',
      leave(data) {
        return new Promise(resolve => {
          const container = data.current.container;
          container.classList.add('page-exit');
          
          // Make sure container is visible during exit animation
          if (container.querySelector('#sidebar') && 
              container.querySelector('#sidebar').classList.contains('slide-left')) {
            container.querySelector('#sidebar').classList.remove('slide-left');
          }
          
          setTimeout(resolve, 300);
        });
      },
      enter(data) {
        return new Promise(resolve => {
          const container = data.next.container;
          container.classList.add('page-enter');
          
          // Make sure sidebar animations work
          setTimeout(() => {
            // Load partials if not already loaded
            const partials = [
              { id: 'headerContainer', path: 'header.html' },
              { id: 'sidebarContainer', path: 'sidebar.html' },
              { id: 'footerContainer', path: 'footer.html' }
            ];
            
            partials.forEach(partial => {
              if (container.querySelector(`#${partial.id}`) && 
                  !container.querySelector(`#${partial.id}`).innerHTML.trim()) {
                console.log(`Loading partial ${partial.path} after transition`);
                window.loadPartial(partial.id, partial.path);
              }
            });
            
            // Remove transition classes
            container.classList.remove('page-enter');
          }, 300);
          
          resolve();
        });
      }
    }]
  });
}

// Replace your current loadPartial function with this straightforward version
window.loadPartial = async function(containerId, partialPath) {
  try {
    // Use straightforward string concatenation instead of template literals
    const basePath = window.location.hostname.includes('github.io') ? 
      '/Personal-Static/' : '/';
    
    console.log('Loading partial:', containerId, partialPath, 'with base path:', basePath);
    
    // Use simple string concatenation to avoid template string issues
    const url = basePath + 'partials/' + partialPath;
    console.log('Final URL:', url);
    
    const response = await fetch(url, { cache: 'no-store' });
    
    if (response.ok) {
      const html = await response.text();
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = html;
        setTimeout(() => container.classList.add('loaded'), 100);
      }
    } else {
      console.error('Failed to load partial:', url, response.status);
      document.getElementById(containerId).innerHTML = 
        `<div class="error-partial">Failed to load ${partialPath}.</div>`;
    }
  } catch (error) {
    console.error('Error in loadPartial:', error);
    document.getElementById(containerId).innerHTML = 
      `<div class="error-partial">Error: ${error.message}</div>`;
  }
};
