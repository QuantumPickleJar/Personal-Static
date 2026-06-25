const basePath = window.location.hostname.includes('github.io') ? 
  '/Personal-Static/' : '/';

const fullRefreshPages = ['projects.html', 'index.html', 'resources.html', 'profile.html', '3d-printing.html'];

function shouldUseFullPageLoad(urlOrPath) {
  return fullRefreshPages.some(page => String(urlOrPath || '').includes(page));
}

// Barba/PJAX does not execute the destination page's inline scripts on navigation.
// profile.html is intentionally self-contained, so it must be reached with a normal
// browser navigation rather than an in-place Barba transition.
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const anchor = event.target.closest('a[href]');
  if (!anchor) return;

  if ((anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return;

  const destination = new URL(anchor.href, window.location.href);
  if (destination.origin !== window.location.origin || !shouldUseFullPageLoad(destination.pathname)) return;

  event.preventDefault();
  event.stopPropagation();
  window.location.assign(anchor.href);
}, true);

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
  
  // Add this to your barba.init configuration before any other hooks
  barba.hooks.before((data) => {
    if (shouldUseFullPageLoad(data.next.url.path)) {
      console.log('Navigating to page that needs refresh - bypassing Barba');
      window.location.href = data.next.url.href;
      return false; // Cancel Barba transition
    }
  });

  // Initialize Barba with default transitions
  barba.init({
    debug: true,
    prevent: ({ href }) => shouldUseFullPageLoad(href),
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
