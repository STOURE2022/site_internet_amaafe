/* Comportements communs à toutes les pages : navigation collante,
   menu mobile, révélation au défilement, barres de progression,
   boutons « Copier » des blocs e-mail. */

/* Lien de composition d'un e-mail selon la messagerie : les webmails
   (Gmail, Outlook, Yahoo) s'ouvrent dans le navigateur ; « appareil »
   utilise l'application configurée localement (mailto). Utilisé par les
   blocs e-mail dynamiques (contact, déclaration de don, parrainage). */
window.lienEmailRahma = function (service, dest, sujet, corps) {
  var s = encodeURIComponent(sujet), c = encodeURIComponent(corps), d = encodeURIComponent(dest);
  if (service === 'gmail') return 'https://mail.google.com/mail/?view=cm&fs=1&to=' + d + '&su=' + s + '&body=' + c;
  if (service === 'outlook') return 'https://outlook.live.com/mail/0/deeplink/compose?to=' + d + '&subject=' + s + '&body=' + c;
  if (service === 'yahoo') return 'https://compose.mail.yahoo.com/?to=' + d + '&subject=' + s + '&body=' + c;
  return 'mailto:' + dest + '?subject=' + s + '&body=' + c;
};

(function () {
  document.documentElement.classList.remove('no-js');

  /* Blocs e-mail : copie de l'adresse ou du message (délégation, les
     blocs peuvent être générés ou remplis dynamiquement). */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copie], [data-copie-bloc]');
    if (!btn) return;
    var bloc = btn.closest('.bmail');
    var texte = btn.dataset.copie || (bloc && bloc.querySelector('pre') ? bloc.querySelector('pre').textContent : '');
    if (!texte) return;
    var ok = function () {
      var t = btn.textContent;
      btn.textContent = 'Copié ✓';
      setTimeout(function () { btn.textContent = t; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(ok);
    } else {
      var ta = document.createElement('textarea');
      ta.value = texte;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      ok();
    }
  });

  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var burger = document.getElementById('burger');
  var mmenu = document.getElementById('mmenu');
  var mvoile = document.getElementById('mvoile');
  var mmenuX = document.getElementById('mmenu-x');
  if (burger && mmenu) {
    var basculeMenu = function (ouvrir) {
      mmenu.classList.toggle('is-open', ouvrir);
      if (mvoile) mvoile.classList.toggle('is-open', ouvrir);
      document.body.classList.toggle('menu-ouvert', ouvrir);
      burger.setAttribute('aria-expanded', ouvrir ? 'true' : 'false');
    };
    burger.addEventListener('click', function () {
      basculeMenu(!mmenu.classList.contains('is-open'));
    });
    if (mmenuX) mmenuX.addEventListener('click', function () { basculeMenu(false); });
    if (mvoile) mvoile.addEventListener('click', function () { basculeMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mmenu.classList.contains('is-open')) basculeMenu(false);
    });
    mmenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) basculeMenu(false);
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
