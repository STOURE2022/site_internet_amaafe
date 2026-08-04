/* Comportements communs à toutes les pages : navigation collante,
   menu mobile, révélation au défilement, barres de progression. */
(function () {
  document.documentElement.classList.remove('no-js');

  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mmenu');
  if (burger && mmenu) {
    burger.addEventListener('click', function () {
      var open = mmenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    mmenu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mmenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.width = (e.target.dataset.fill || 0) + '%';
        bio.unobserve(e.target);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.bar i, .collecte__jt i').forEach(function (el) { bio.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('is-in'); });
    document.querySelectorAll('.bar i, .collecte__jt i').forEach(function (el) { el.style.width = (el.dataset.fill || 0) + '%'; });
  }
})();
