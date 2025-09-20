document.addEventListener('DOMContentLoaded', () => {
  fetch('/components/header.html')
    .then(r => r.text())
    .then(html => {
      const slot = document.getElementById('header-container') || (() => {
        const d = document.createElement('div'); d.id = 'header-container';
        document.body.insertBefore(d, document.body.firstChild);
        return d;
      })();
      slot.innerHTML = html;

      const mobileMenu = document.querySelector('.mobile-menu');
      const navLinks   = document.querySelector('.nav-links');
      if (mobileMenu && navLinks) {
        mobileMenu.addEventListener('click', (e) => {
          e.stopPropagation();
          navLinks.classList.toggle('open');
        });
        document.addEventListener('click', () => {
          if (navLinks.classList.contains('open')) navLinks.classList.remove('open');
        });
        window.addEventListener('resize', () => {
          if (window.innerWidth > 576) navLinks.classList.remove('open');
        }, { passive: true });
      }

      document.querySelectorAll('.scroll-link').forEach(link => {
        link.addEventListener('click', (e) => {
          const id = link.getAttribute('href');
          if (!id || !id.startsWith('#')) return;
          const target = document.querySelector(id);
          if (!target) { e.preventDefault(); return; }
          e.preventDefault();
          const header = document.querySelector('header');
          const hh = header ? header.offsetHeight : 0;
          const top = target.getBoundingClientRect().top + window.pageYOffset - hh;
          window.scrollTo({ top, behavior: 'smooth' });
        });
      });
    })
    .catch(console.error);
});
