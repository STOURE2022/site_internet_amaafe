/* Parcours de don — utilisé par la page d'accueil (bloc don)
   et par la page /faire-un-don (parcours complet en 4 étapes).
   Le site n'encaisse rien : il guide le donateur vers le bon canal
   puis recueille sa déclaration (WhatsApp en priorité).
   Les coordonnées de paiement viennent de content/config.json,
   injectées dans la page via <script id="don-config">. */
(function () {
  var cfgEl = document.getElementById('don-config');
  if (!cfgEl) return;
  var CFG = JSON.parse(cfgEl.textContent);

  var fmt = function (n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  var PRESETS = {
    FCFA: [2500, 5000, 10000, 25000, 50000, 100000],
    EUR: [5, 10, 20, 50, 100, 200],
    USD: [5, 10, 25, 50, 100, 200]
  };
  var NOMS_CANAL = {
    om: 'Orange Money',
    wave: 'Wave',
    'vir-ml': 'Virement bancaire (Mali)',
    'vir-fr': 'Virement bancaire (France)',
    wero: 'Wero (Europe)'
  };

  /* ---- état, initialisé depuis l'URL si on arrive de l'accueil ---- */
  var params = new URLSearchParams(location.search);
  var cur = PRESETS[params.get('devise')] ? params.get('devise') : 'FCFA';
  var amount = parseInt(params.get('montant'), 10) > 0 ? parseInt(params.get('montant'), 10) : PRESETS[cur][2];
  var freq = params.get('freq') === 'month' ? 'month' : 'once';
  var pay = NOMS_CANAL[params.get('canal')] ? params.get('canal') : 'om';

  var $ = function (id) { return document.getElementById(id); };
  var amtsEl = $('amts'), curLabel = $('curLabel'), custom = $('custom'),
      paybox = $('paybox'), impactT = $('impactText'), impactN = $('impactNote'),
      versDecl = $('versDeclaration'), waLink = $('waLink');

  function group(list, btn) {
    list.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  var TBD = '<span class="tbd">à communiquer</span>';
  var NOTE_TBD = 'Cette coordonnée sera publiée ici dès qu’elle aura été confirmée par le bureau.';

  /* ---- contenu de l'encart « instructions » selon le canal ---- */
  function infosCanal() {
    var p = CFG.paiement;
    var motif = p.motif || 'DON RAHMA - VOTRE NOM';
    switch (pay) {
      case 'om':
        return { t: 'Orange Money — Mali', v: p.orangeMoney.numero,
                 s: p.orangeMoney.numero ? 'Le nom affiché à la validation doit être celui de l’association.' : NOTE_TBD };
      case 'wave':
        return { t: 'Wave — Mali', v: p.wave.numero,
                 s: p.wave.numero ? 'Vérifiez le nom du destinataire avant de valider.' : NOTE_TBD };
      case 'vir-ml':
        return { t: 'Virement — compte Mali', v: p.virementMali.rib,
                 s: (p.virementMali.banque ? 'Banque : ' + p.virementMali.banque + '. ' : '') +
                    'Motif à indiquer : ' + motif + '.', tbdSeul: !p.virementMali.rib };
      case 'vir-fr':
        return { t: 'Virement — compte France (EUR)', v: p.virementFrance.iban,
                 s: (p.virementFrance.bic ? 'BIC : ' + p.virementFrance.bic + '. ' : '') +
                    'Motif à indiquer : ' + motif + '.', tbdSeul: !p.virementFrance.iban };
      case 'wero':
        return { t: 'Wero — Europe (EUR)', v: p.wero.numero,
                 s: p.wero.numero
                   ? 'Envoyez avec Wero depuis l’application de votre banque, à ce numéro.' +
                     (p.wero.titulaire ? ' Le destinataire affiché doit être « ' + p.wero.titulaire + ' ».' : '') +
                     ' Message à indiquer : ' + motif + '.'
                   : NOTE_TBD };
    }
  }

  function renderPaybox() {
    if (!paybox) return;
    var c = infosCanal();
    var html = '<span>' + esc(c.t) + '</span>';
    if (c.v) {
      html += '<b>' + esc(c.v) + '</b>';
      html += '<span>' + esc(c.s) + '</span><br>';
      html += '<button type="button" class="copy" data-copy="' + esc(c.v) + '">Copier</button>';
    } else {
      html += '<b>' + TBD + '</b>';
      html += '<span>' + esc(c.tbdSeul === undefined ? c.s : NOTE_TBD) + '</span>';
    }
    paybox.innerHTML = html;
  }

  function messageWhatsApp() {
    var nom = ($('d-nom') && $('d-nom').value.trim()) || '…';
    var num = ($('d-num') && $('d-num').value.trim()) || '…';
    var date = ($('d-date') && $('d-date').value) || '…';
    return 'Bonjour, je déclare un don au Centre Coranique Rahma.\n' +
      'Montant : ' + fmt(amount) + ' ' + cur + (freq === 'month' ? ' (don mensuel)' : ' (don ponctuel)') + '\n' +
      'Canal : ' + NOMS_CANAL[pay] + '\n' +
      'Numéro émetteur : ' + num + '\n' +
      'Nom : ' + nom + '\n' +
      'Date d’envoi : ' + date;
  }

  function render() {
    var mensuel = freq === 'month';
    if (curLabel) curLabel.textContent = cur;
    if (impactT) {
      impactT.innerHTML = 'Donnez <b>' + fmt(amount) + ' ' + cur + '</b>' + (mensuel ? ' par mois' : '') +
        ' et vous financez <b>une part concrète</b> de la scolarité d’un enfant.';
    }
    if (impactN) {
      impactN.textContent = mensuel
        ? 'Le don mensuel sera à renouveler manuellement tant que le prélèvement automatique n’est pas en place.'
        : 'La grille d’impact précise sera affichée dès que le coût annuel par enfant aura été communiqué par le centre.';
    }
    renderPaybox();
    if (versDecl) {
      versDecl.href = '/faire-un-don/?freq=' + freq + '&devise=' + cur + '&montant=' + amount + '&canal=' + pay + '#declarer';
    }
    if (waLink) {
      waLink.href = CFG.whatsapp
        ? 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(messageWhatsApp())
        : '#declarer';
    }
  }

  function drawAmounts() {
    if (!amtsEl) return;
    amtsEl.innerHTML = '';
    PRESETS[cur].forEach(function (v) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = fmt(v);
      b.setAttribute('aria-pressed', v === amount ? 'true' : 'false');
      b.addEventListener('click', function () {
        amount = v;
        if (custom) custom.value = '';
        group([].slice.call(amtsEl.querySelectorAll('button')), b);
        render();
      });
      amtsEl.appendChild(b);
    });
  }

  document.querySelectorAll('[data-freq]').forEach(function (b) {
    if (b.dataset.freq === freq) group([].slice.call(document.querySelectorAll('[data-freq]')), b);
    b.addEventListener('click', function () {
      freq = b.dataset.freq;
      group([].slice.call(document.querySelectorAll('[data-freq]')), b);
      render();
    });
  });
  document.querySelectorAll('[data-cur]').forEach(function (b) {
    if (b.dataset.cur === cur) group([].slice.call(document.querySelectorAll('[data-cur]')), b);
    b.addEventListener('click', function () {
      cur = b.dataset.cur;
      amount = PRESETS[cur][2];
      if (custom) custom.value = '';
      group([].slice.call(document.querySelectorAll('[data-cur]')), b);
      drawAmounts();
      render();
    });
  });
  document.querySelectorAll('[data-pay]').forEach(function (b) {
    if (b.dataset.pay === pay) group([].slice.call(document.querySelectorAll('[data-pay]')), b);
    b.addEventListener('click', function () {
      pay = b.dataset.pay;
      group([].slice.call(document.querySelectorAll('[data-pay]')), b);
      render();
    });
  });
  if (custom) {
    custom.addEventListener('input', function () {
      var v = parseInt(custom.value, 10);
      if (v > 0) {
        amount = v;
        group([].slice.call(amtsEl.querySelectorAll('button')), null);
        render();
      }
    });
  }
  ['d-nom', 'd-num', 'd-date'].forEach(function (id) {
    var el = $(id);
    if (el) el.addEventListener('input', render);
  });

  /* ---- boutons « Copier » (délégation, le contenu est re-rendu) ---- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy');
    if (!btn) return;
    var texte = btn.dataset.copy || '';
    var ok = function () {
      btn.classList.add('is-done');
      btn.textContent = 'Copié ✓';
      setTimeout(function () { btn.classList.remove('is-done'); btn.textContent = 'Copier'; }, 2200);
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

  drawAmounts();
  render();
})();
