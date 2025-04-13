// rsc/js/theme-toggle.js
import { LitElement, html, css } from 'https://esm.sh/lit@2.8.0';
import 'https://esm.sh/@material/web/switch/switch.js';

class ThemeToggle extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 1.25rem;
      right: 1.25rem;
      z-index: 1000;
      --switch-size: 1.2;
    }
    
    md-switch {
      transform: scale(var(--switch-size));
      margin: 4px;
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
    
    // Enhanced color scheme for better overall look
    document.body.style.setProperty('--md-sys-color-surface', isDark ? '#1a1a1a' : '#ffffff');
    document.body.style.setProperty('--md-sys-color-on-surface', isDark ? '#ffffff' : '#000000');
    
    // Save user preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
  
  // Check for user's preferred theme when component is first added
  firstUpdated() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial state based on saved preference or system preference
    const shouldBeDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
    
    // Update the toggle switch to match
    const switchEl = this.shadowRoot.querySelector('md-switch');
    if (switchEl) {
      switchEl.selected = shouldBeDark;
    }
    
    // Update the body class and properties
    document.body.classList.toggle('dark-mode', shouldBeDark);
    document.body.style.setProperty('--md-sys-color-surface', shouldBeDark ? '#1a1a1a' : '#ffffff');
    document.body.style.setProperty('--md-sys-color-on-surface', shouldBeDark ? '#ffffff' : '#000000');
  }
}

customElements.define('theme-toggle', ThemeToggle);
