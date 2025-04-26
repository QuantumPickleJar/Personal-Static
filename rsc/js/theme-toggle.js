// rsc/js/theme-toggle.js
import { LitElement, html, css } from 'https://esm.sh/lit@2.8.0';
import 'https://esm.sh/@material/web/switch/switch.js';

class ThemeToggle extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 1050; /* Increased z-index to ensure visibility */
      --switch-size: 1.2;
      display: block; /* Ensure the component is always displayed */
    }
    
    md-switch {
      transform: scale(var(--switch-size));
      margin: 4px;
      background-color: rgba(255, 255, 255, 0.9); /* Add semi-transparent background */
      border-radius: 24px; /* Rounded edges */
      padding: 2px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Add shadow for visibility */
    }
    
    span[slot="on-icon"],
    span[slot="off-icon"] {
      font-size: 16px;
      padding: 2px;
    }
    
    @media (max-width: 768px) {
      :host {
        top: 0.75rem;
        right: 0.75rem;
        --switch-size: 1;
      }
    }
  `;

  render() {
    return html`
      <md-switch @input=${this.toggleTheme} icons>
        <span slot="on-icon">🌙</span>
        <span slot="off-icon">☀️</span>
      </md-switch>
    `;
  }

  toggleTheme(e) {
    if (!e || !e.target) return;
    
    const isDark = e.target.selected;
    document.body.classList.toggle('dark-mode', isDark);
    
    // Apply theme to document body (global scope)
    this._applyThemeToBody(isDark);
    
    // Save user preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Log message to verify toggle is working
    console.log('Theme toggle activated, dark mode:', isDark);
  }
  
  _applyThemeToBody(isDark) {
    // Enhanced color scheme for better overall look
    document.body.style.setProperty('--md-sys-color-surface', isDark ? '#1a1a1a' : '#ffffff');
    document.body.style.setProperty('--md-sys-color-on-surface', isDark ? '#ffffff' : '#000000');
    
    // Improve footer text contrast in dark mode
    document.body.style.setProperty('--md-sys-color-on-surface-variant', isDark ? '#e1e1fc' : '#49454f');
    document.body.style.setProperty('--md-sys-color-outline', isDark ? '#938f99' : '#79747e');
    document.body.style.setProperty('--md-sys-color-outline-variant', isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)');
    
    // Project card specific colors for backward compatibility
    const projectCards = document.querySelectorAll('md-elevated-card.project-card');
    projectCards.forEach(card => {
      if (isDark) {
        card.style.backgroundColor = 'var(--md-sys-color-surface-container, #1d1b20)';
        card.style.color = 'var(--md-sys-color-on-surface, #e6e0e9)';
      } else {
        card.style.backgroundColor = 'var(--md-sys-color-surface-container, #f9f9f9)';
        card.style.color = 'var(--md-sys-color-on-surface, #1c1b1f)';
      }
    });
    
    // Directly target sidebar element
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.style.backgroundColor = isDark ? 
        'var(--md-sys-color-surface-container, #1d1b20)' : 
        'var(--md-sys-color-surface-container, #f3f3f3)';
      sidebar.style.borderRightColor = isDark ? 
        'var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.1))' : 
        'var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.08))';
    }
    
    // Directly target footer element and all its content
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.backgroundColor = isDark ? 
        'var(--md-sys-color-surface-container, #1d1b20)' : 
        'var(--md-sys-color-surface-container, #f3f3f3)';
      footer.style.borderTopColor = isDark ? 
        'var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.1))' : 
        'var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.08))';
      
      // Ensure all footer text has proper contrast
      footer.style.color = isDark ? 
        'var(--md-sys-color-on-surface, #e6e0e9)' : 
        'var(--md-sys-color-on-surface, #1c1b1f)';
        
      // Target footer text elements specifically for better contrast
      const footerParagraphs = footer.querySelectorAll('p');
      footerParagraphs.forEach(p => {
        p.style.color = isDark ? '#e1e1fc' : '#49454f';
      });
      
      // Make footer links more visible in dark mode
      const footerLinks = footer.querySelectorAll('a');
      footerLinks.forEach(link => {
        link.style.color = isDark ? '#90caf9' : '#006782';
      });
      
      // Target footer sections and headings
      const footerHeadings = footer.querySelectorAll('h3, h4');
      footerHeadings.forEach(heading => {
        heading.style.color = isDark ? 
          'var(--md-sys-color-primary, #d0bcff)' : 
          'var(--md-sys-color-primary, #6750a4)';
      });
    }
  }
  
  // Check for user's preferred theme when component is first added
  firstUpdated() {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial state based on saved preference or system preference
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    
    // Update the toggle switch to match
    const switchEl = this.shadowRoot.querySelector('md-switch');
    if (switchEl) {
      switchEl.selected = shouldBeDark;
    }
    
    // Apply theme to document body
    document.body.classList.toggle('dark-mode', shouldBeDark);
    this._applyThemeToBody(shouldBeDark);
    
    console.log('Theme initialized, dark mode:', shouldBeDark);
  }
  
  connectedCallback() {
    super.connectedCallback();
    console.log('Theme toggle component connected to DOM');
    
    // Force theme application when component connects to DOM
    const isDark = localStorage.getItem('theme') === 'dark' || 
                  (localStorage.getItem('theme') === null && 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
                   
    document.body.classList.toggle('dark-mode', isDark);
    this._applyThemeToBody(isDark);
    
    // Make sure current page knows its theme state
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}

customElements.define('theme-toggle', ThemeToggle);

// Global function to apply theme (can be called from any page)
window.applyTheme = function(isDark) {
  document.body.classList.toggle('dark-mode', isDark);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  
  // Apply same style properties as in the component
  document.body.style.setProperty('--md-sys-color-surface', isDark ? '#1a1a1a' : '#ffffff');
  document.body.style.setProperty('--md-sys-color-on-surface', isDark ? '#ffffff' : '#000000');
  document.body.style.setProperty('--md-sys-color-on-surface-variant', isDark ? '#e1e1fc' : '#49454f');
  document.body.style.setProperty('--md-sys-color-outline', isDark ? '#938f99' : '#79747e');
  document.body.style.setProperty('--md-sys-color-outline-variant', isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)');
};

// Add a fallback to make sure the theme toggle is always visible
document.addEventListener('DOMContentLoaded', () => {
  // Get theme from localStorage and apply it immediately to the document
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
  
  // Apply theme to document body immediately, don't wait for component
  document.body.classList.toggle('dark-mode', isDark);
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  window.applyTheme(isDark);
  
  // Apply theme to any elements that might exist in a partial loaded after component initialization
  const applyThemeToLoadedPartials = () => {
    const isDark = document.body.classList.contains('dark-mode');
    
    // Check if sidebar was loaded after theme initialization
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.style.backgroundColor = isDark ? 
        'var(--md-sys-color-surface-container, #1d1b20)' : 
        'var(--md-sys-color-surface-container, #f3f3f3)';
      sidebar.style.borderRightColor = isDark ? 
        'var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.1))' : 
        'var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.08))';
    }
    
    // Check if footer was loaded after theme initialization
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.backgroundColor = isDark ? 
        'var(--md-sys-color-surface-container, #1d1b20)' : 
        'var(--md-sys-color-surface-container, #f3f3f3)';
      footer.style.borderTopColor = isDark ? 
        'var(--md-sys-color-outline-variant, rgba(255, 255, 255, 0.1))' : 
        'var(--md-sys-color-outline-variant, rgba(0, 0, 0, 0.08))';
      
      // Ensure all footer text has proper contrast
      footer.style.color = isDark ? 
        'var(--md-sys-color-on-surface, #e6e0e9)' : 
        'var(--md-sys-color-on-surface, #1c1b1f)';
        
      // Target footer text elements specifically for better contrast
      const footerParagraphs = footer.querySelectorAll('p');
      footerParagraphs.forEach(p => {
        p.style.color = isDark ? '#e1e1fc' : '#49454f';
      });
      
      // Make footer links more visible in dark mode
      const footerLinks = footer.querySelectorAll('a');
      footerLinks.forEach(link => {
        link.style.color = isDark ? '#90caf9' : '#006782';
      });
      
      // Target footer sections and headings
      const footerHeadings = footer.querySelectorAll('h3, h4');
      footerHeadings.forEach(heading => {
        heading.style.color = isDark ? 
          'var(--md-sys-color-primary, #d0bcff)' : 
          'var(--md-sys-color-primary, #6750a4)';
      });
    }
  };

  // Create a mutation observer to detect when footer or sidebar is loaded
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        // Check if sidebar or footer was added
        const addedFooter = Array.from(mutation.addedNodes).find(node => 
          node.nodeName === 'FOOTER' || 
          (node.querySelector && node.querySelector('footer'))
        );
        
        const addedSidebar = Array.from(mutation.addedNodes).find(node => 
          (node.id === 'sidebar') || 
          (node.querySelector && node.querySelector('#sidebar'))
        );
        
        if (addedFooter || addedSidebar) {
          console.log('Footer or sidebar loaded, applying theme');
          applyThemeToLoadedPartials();
        }
      }
    });
  });

  // Start observing document body for added nodes
  observer.observe(document.body, { childList: true, subtree: true });

  // Check if the theme-toggle component exists and is visible
  setTimeout(() => {
    const themeToggle = document.querySelector('theme-toggle');
    if (!themeToggle || getComputedStyle(themeToggle).display === 'none') {
      console.log('Theme toggle not found or hidden, creating fallback');
      // Create a fallback toggle if component is missing or hidden
      const fallbackToggle = document.createElement('div');
      fallbackToggle.id = 'fallback-theme-toggle';
      fallbackToggle.style.cssText = `
        position: fixed;
        top: 1.25rem;
        right: 1.25rem;
        z-index: 1100;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 20px;
        padding: 8px;
        cursor: pointer;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      `;
      
      const isDark = document.body.classList.contains('dark-mode');
      fallbackToggle.innerHTML = isDark ? '☀️' : '🌙';
      
      fallbackToggle.addEventListener('click', () => {
        const currentIsDark = document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', !currentIsDark);
        fallbackToggle.innerHTML = !currentIsDark ? '☀️' : '🌙';
        localStorage.setItem('theme', !currentIsDark ? 'dark' : 'light');
        
        // Apply theme to entire document
        window.applyTheme(!currentIsDark);
        
        // Apply theme to sidebar and footer
        applyThemeToLoadedPartials();
      });
      
      document.body.appendChild(fallbackToggle);
    }
    
    // Apply theme immediately in case elements already exist
    applyThemeToLoadedPartials();
  }, 1000); // Check after 1 second
});
