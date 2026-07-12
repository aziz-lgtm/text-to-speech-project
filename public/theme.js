(function () {
  var link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  var thisScript = document.currentScript;
  var base = thisScript ? thisScript.src.replace(/theme\.js.*$/, '') : '';
  link.href = base + 'favicon.svg';

  var KEY = 'koe-theme';

  function preferred() {
    var stored = localStorage.getItem(KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var icon = document.querySelector('#themeToggle .icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  apply(preferred());

  document.addEventListener('DOMContentLoaded', function () {
    apply(preferred());
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      localStorage.setItem(KEY, next);
      apply(next);
    });
  });
})();
