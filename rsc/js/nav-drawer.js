// rsc/js/nav-drawer.js

/**
 * Initialize the navigation drawer functionality.
 * This generated drawer is used by the webpack/main.js path, so the Profile
 * item must navigate to profile.html instead of acting as a dead dropdown-only link.
 */
export function initNavDrawer() {
  console.log('Initializing navigation drawer');

  if (!document.getElementById('menuToggle')) {
    createNavDrawerMarkup();
  }

  const drawer = document.getElementById('mainDrawer');
  if (!drawer) {
    return;
  }

  document.body.addEventListener('click', function(e) {
    const toggle = e.target.closest('#menuToggle');
    const inDrawer = e.target.closest('#mainDrawer');

    if (toggle) {
      drawer.classList.toggle('open');
    } else if (drawer.classList.contains('open') && !inDrawer) {
      drawer.classList.remove('open');
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
    }
  });
}

/**
 * Create and inject the navigation drawer markup into the document.
 */
function createNavDrawerMarkup() {
  const toggleButton = document.createElement('button');
  toggleButton.id = 'menuToggle';
  toggleButton.setAttribute('aria-label', 'Open navigation menu');
  toggleButton.innerHTML = '<span class="material-symbols-outlined">menu</span>';

  const drawer = document.createElement('div');
  drawer.id = 'mainDrawer';

  const drawerHeader = document.createElement('div');
  drawerHeader.className = 'drawer-header';
  drawerHeader.textContent = 'Navigation';

  const navList = document.createElement('ul');
  navList.className = 'drawer-nav-list';

  const navItems = [
    { text: 'Home', icon: 'home', href: 'index.html' },
    { text: 'Projects', icon: 'code', href: 'projects.html' },
    { text: '3D Printing', icon: 'precision_manufacturing', href: '3d-printing.html' },
    { text: 'Resources', icon: 'book', href: 'resources.html' },
    {
      text: 'Profile',
      icon: 'person',
      href: 'profile.html',
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

    const a = document.createElement('a');
    a.href = item.href;
    a.innerHTML = `<span class="material-symbols-outlined">${item.icon}</span>${item.text}`;
    li.appendChild(a);

    if (item.dropdown) {
      li.classList.add('has-dropdown');
      const dropdown = document.createElement('div');
      dropdown.className = 'profile-dropdown';

      item.dropdownItems.forEach(sub => {
        const dropdownItem = document.createElement('a');
        dropdownItem.href = sub.href;
        dropdownItem.className = 'profile-dropdown-item';
        dropdownItem.innerHTML = `<span class="material-symbols-outlined">${sub.icon}</span>${sub.text}`;
        dropdown.appendChild(dropdownItem);
      });

      li.appendChild(dropdown);
    }

    navList.appendChild(li);
  });

  drawer.appendChild(drawerHeader);
  drawer.appendChild(navList);

  document.body.appendChild(toggleButton);
  document.body.appendChild(drawer);

  addNavDrawerStyles();
}

/**
 * Add the required CSS for the navigation drawer.
 */
function addNavDrawerStyles() {
  if (document.getElementById('nav-drawer-styles')) {
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'nav-drawer-styles';
  styleElement.textContent = `
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

    .drawer-header {
      font-size: 1.25rem;
      padding: 16px;
      font-weight: 500;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.08));
      margin-bottom: 8px;
    }

    .drawer-nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .drawer-nav-item {
      padding: 4px 0;
      position: relative;
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

    .has-dropdown:hover .profile-dropdown,
    .has-dropdown:focus-within .profile-dropdown {
      display: flex;
    }

    .profile-dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      text-decoration: none;
      border-radius: 4px;
      transition: background-color 0.2s ease;
      white-space: nowrap;
    }

    .profile-dropdown-item:hover {
      background-color: var(--md-sys-color-surface-variant, rgba(103, 80, 164, 0.08));
      color: var(--md-sys-color-primary, #6750A4);
    }
  `;

  document.head.appendChild(styleElement);
}
