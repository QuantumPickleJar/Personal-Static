// rsc/js/theme-toggle.js
// Using unpkg instead of skypack for tslib
import { LitElement, html, css } from 'https://esm.sh/lit@2.8.0';
import 'https://esm.sh/@material/web/switch/switch.js';

class ThemeToggle extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
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
    const isDark = e.target.selected;
    document.body.classList.toggle('dark-mode', isDark);
    document.body.style.setProperty('--md-sys-color-surface', isDark ? '#1a1a1a' : '#ffffff');
    document.body.style.setProperty('--md-sys-color-on-surface', isDark ? '#ffffff' : '#000000');
  }
}

customElements.define('theme-toggle', ThemeToggle);
