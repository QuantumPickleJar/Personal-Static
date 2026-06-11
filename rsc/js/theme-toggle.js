const STORAGE_KEY = 'theme';

function preferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.toggle('dark-mode', isDark);
}

function updateToggleVisual(button, theme) {
  const isDark = theme === 'dark';
  button.setAttribute('aria-pressed', String(isDark));
  button.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  button.textContent = isDark ? '☀' : '☾';
}

function createToggleButton() {
  const existing = document.getElementById('themeToggleBtn');
  if (existing) return existing;

  const button = document.createElement('button');
  button.id = 'themeToggleBtn';
  button.className = 'theme-toggle-btn';
  button.type = 'button';
  button.setAttribute('aria-label', 'Toggle theme');

  button.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    updateToggleVisual(button, next);
  });

  document.body.appendChild(button);
  return button;
}

export function initThemeToggle() {
  const theme = preferredTheme();
  applyTheme(theme);
  const button = createToggleButton();
  updateToggleVisual(button, theme);
}

document.addEventListener('DOMContentLoaded', initThemeToggle);
