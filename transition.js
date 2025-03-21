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
            
            // Check if we're on the projects page and initialize if needed
            if (window.location.pathname.includes('projects.html')) {
              console.log('Barba transition to projects page detected, checking if projects need initialization');
              const projectsGallery = container.querySelector('#projectsGallery');
              if (projectsGallery && (!projectsGallery.innerHTML || projectsGallery.innerHTML.trim() === '')) {
                console.log('Projects gallery is empty, triggering initialization');
                // Create and dispatch a custom event that projects.html script will listen for
                const event = new CustomEvent('initializeProjects');
                document.dispatchEvent(event);
              }
            }
            
            resolve();
          }, 300);
        });
      }
    }]
  });
}

// Expose loadPartial to window scope for Barba transitions
window.loadPartial = async function(containerId, partialPath) {
  try {
    // Import the main.js module dynamically to access its loadPartial function
    const mainModule = await import('./main.js');
    
    // Check if the module exports loadPartial
    if (mainModule && typeof mainModule.loadPartial === 'function') {
      await mainModule.loadPartial(containerId, partialPath);
    } else {
      // Fallback implementation if we can't get the main loadPartial function
      console.log(`Fallback: Loading partial ${partialPath} into ${containerId}`);
      
      // Basic implementation to avoid recursion
      const response = await fetch(`partials/${partialPath}`, { 
        cache: 'no-store'
      });
      
      if (response.ok) {
        const html = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = html;
          setTimeout(() => {
            if (container.classList.contains('slide-left')) {
              container.classList.remove('slide-left');
            }
            container.classList.add('loaded');
          }, 100);
        }
      } else {
        throw new Error(`Failed to load partial ${partialPath}`);
      }
    }
  } catch (error) {
    console.error('Error in window.loadPartial:', error);
    // Basic fallback content
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `<div class="error-partial">Failed to load ${partialPath}.</div>`;
    }
  }
};
