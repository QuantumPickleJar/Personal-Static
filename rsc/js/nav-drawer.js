// rsc/js/nav-drawer.js

/**
 * Initialize the navigation drawer functionality
 * Uses standard DOM APIs rather than web components to work with webpack
 */
export function initNavDrawer() {
  console.log('Initializing navigation drawer');

  // Create markup if it doesn't exist
  if (!document.getElementById('menuToggle')) {
    createNavDrawerMarkup();
  }

  const drawer = document.getElementById('mainDrawer');

  // Delegate clicks on body for toggle and outside clicks
  document.body.addEventListener('click', function(e) {
    const toggle = e.target.closest('#menuToggle');
    const inDrawer = e.target.closest('#mainDrawer');
    if (toggle) {
      // Toggle drawer open/close
      drawer.classList.toggle('open');
    } else if (drawer.classList.contains('open') && !inDrawer) {
      // Click outside drawer - close it
      drawer.classList.remove('open');
    }
  });

  // Close drawer on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
    }
  });
}

/**
 * Create and inject the navigation drawer markup into the document
 */
function createNavDrawerMarkup() {
  // Create the menu toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'menuToggle';
  toggleButton.setAttribute('aria-label', 'Open navigation menu');
  toggleButton.innerHTML = '<span class="material-symbols-outlined">menu</span>';
  
  // Create drawer element
  const drawer = document.createElement('div');
  drawer.id = 'mainDrawer';
  
  // Drawer header
  const drawerHeader = document.createElement('div');
  drawerHeader.className = 'drawer-header';
  drawerHeader.textContent = 'Navigation';
  
  // Drawer navigation list
  const navList = document.createElement('ul');
  navList.className = 'drawer-nav-list';
  
  // Navigation items
  const navItems = [
    { text: 'Home', icon: 'home', href: 'index.html' },
    { text: 'Projects', icon: 'code', href: 'projects.html' },
    { text: 'Resources', icon: 'book', href: 'resources.html' },
    {
      text: 'Profile',
      icon: 'person',
      dropdown: true,
      dropdownItems: [
        { href: 'https://github.com/QuantumPickleJar', text: 'GitHub', icon: 'code_blocks' },
        { href: 'https://www.linkedin.com/in/vincent-morrill/', text: 'LinkedIn', icon: 'work' },
        { href: 'mailto:contact@vincentmorrill.com', text: 'Email', icon: 'mail' }
      ]
    }
  ];
  
  navItems.forEach(item => {
    const li = document.createElement('li');
    li.className = 'drawer-nav-item';

    if (item.dropdown) {
      li.classList.add('has-dropdown');
      const a = document.createElement('a');
      a.href = '#';
      a.innerHTML = `<span class="material-symbols-outlined">${item.icon}</span>${item.text}`;
      a.addEventListener('click', e => e.preventDefault());
      // Dropdown container
      const dropdown = document.createElement('div');
      dropdown.className = 'profile-dropdown';
      item.dropdownItems.forEach(sub => {
        const dropdownItem = document.createElement('a');
        dropdownItem.href = sub.href;
        dropdownItem.className = 'profile-dropdown-item';
        dropdownItem.innerHTML = `<span class="material-symbols-outlined">${sub.icon}</span>${sub.text}`;
        dropdown.appendChild(dropdownItem);
      });
      li.appendChild(a);
      li.appendChild(dropdown);
    } else {
      const a = document.createElement('a');
      a.href = item.href;
      a.innerHTML = `<span class="material-symbols-outlined">${item.icon}</span>${item.text}`;
      li.appendChild(a);
    }
    navList.appendChild(li);
  });
  
  // Assemble the drawer
  drawer.appendChild(drawerHeader);
  drawer.appendChild(navList);
  
  // Add elements to the document
  document.body.appendChild(toggleButton);
  document.body.appendChild(drawer);
  
  // Add CSS for the nav drawer
  addNavDrawerStyles();
}

/**
 * Add the required CSS for the navigation drawer
 */
function addNavDrawerStyles() {
  if (document.getElementById('nav-drawer-styles')) {
    return;
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'nav-drawer-styles';
  styleElement.textContent = `
    /* Menu toggle button */
    #menuToggle {
      position: fixed;
      top: 1.25rem;
      left: 1.25rem;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: var(--md-sys-color-primary, #6750A4);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
      z-index: 1000;
    }
    
    #menuToggle:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    }
    
    #menuToggle:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    /* Navigation drawer */
    #mainDrawer {
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      width: 260px;
      background-color: var(--md-sys-color-surface, #FFFFFF);
      color: var(--md-sys-color-on-surface, #1c1b1f);
      box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 1001;
      overflow-y: auto;
    }
    
    #mainDrawer.open {
      transform: translateX(0);
    }
    
    /* Drawer header */
    .drawer-header {
      font-size: 1.25rem;
      padding: 16px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.08));
      margin-bottom: 8px;
    }
    
    /* Drawer navigation list */
    .drawer-nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    /* Drawer navigation items */
    .drawer-nav-item {
      padding: 4px 0;
    }
    
    .drawer-nav-item a {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      text-decoration: none;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      transition: background-color 0.2s ease;
    }
    
    .drawer-nav-item a:hover {
      background-color: var(--md-sys-color-surface-variant, rgba(103, 80, 164, 0.08));
      color: var(--md-sys-color-primary, #6750A4);
      text-decoration: none;
    }
    
    /* Dropdown styles */
    .has-dropdown .profile-dropdown {
      display: none;
      flex-direction: column;
      padding: 8px 16px;
      background-color: var(--md-sys-color-surface, #FFFFFF);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      position: absolute;
      left: 100%;
      top: 0;
      z-index: 1002;
    }

    .has-dropdown:hover .profile-dropdown {
      display: flex;
    }

    .profile-dropdown-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 16px;
      text-decoration: none;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      transition: background-color 0.2s ease;
    }

    .profile-dropdown-item:hover {
      background-color: var(--md-sys-color-surface-variant, rgba(103, 80, 164, 0.08));
      color: var(--md-sys-color-primary, #6750A4);
    }
    
    /* Backdrop overlay */
    #drawerOverlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }
    
    #drawerOverlay.visible {
      opacity: 1;
      visibility: visible;
    }
    
    /* Dark mode adjustments */
    body.dark-mode #mainDrawer {
      background-color: #1a1a1a;
      color: #ffffff;
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    body.dark-mode .drawer-header {
      color: #ffffff;
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }
    
    body.dark-mode .drawer-nav-item a {
      color: #ffffff;
    }
    
    body.dark-mode .drawer-nav-item a:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: var(--md-sys-color-primary, #d0bcff);
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      #menuToggle {
        top: 0.75rem;
        left: 0.75rem;
        width: 40px;
        height: 40px;
      }
      
      #mainDrawer {
        width: 240px;
      }
    }
  `;
  
  document.head.appendChild(styleElement);
}