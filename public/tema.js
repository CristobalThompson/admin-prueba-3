(() => {
  'use strict';

  const preferenceKey = 'admin-catedra3-theme';
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try {
    const saved = localStorage.getItem(preferenceKey);
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {
    // Follow the system preference when storage is unavailable.
  }

  const page = document.documentElement;
  const activeTheme = () => preference ?? (systemTheme.matches ? 'dark' : 'light');
  page.dataset.theme = activeTheme();

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#theme-toggle');
    function applyTheme() {
      const theme = activeTheme();
      page.dataset.theme = theme;
      button.setAttribute('aria-pressed', String(theme === 'dark'));
    }

    button.addEventListener('click', () => {
      preference = activeTheme() === 'dark' ? 'light' : 'dark';
      applyTheme();
      try {
        localStorage.setItem(preferenceKey, preference);
      } catch {
        // Keep the chosen theme until the page is closed.
      }
    });

    systemTheme.addEventListener('change', applyTheme);
    applyTheme();
    button.hidden = false;
  });
})();
