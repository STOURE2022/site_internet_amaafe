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
    wero: 'Wero (Europe)',
    paypal: 'PayPal',
    helloasso: 'HelloAsso (carte bancaire)'
  };
  /* Équipe qui reçoit la déclaration WhatsApp : celle qui détient les
     relevés du canal. Si son numéro manque, repli vers l'autre équipe. */
  var EQUIPE_CANAL = { om: 'ml', wave: 'ml', 'vir-ml': 'ml', 'vir-fr': 'fr', wero: 'fr', paypal: 'fr', helloasso: 'fr' };

  function destWhatsApp() {
    var w = CFG.whatsapp || {};
    var demandeFr = EQUIPE_CANAL[pay] === 'fr';
    var equipe = demandeFr ? (w.fr ? 'fr' : 'ml') : (w.ml ? 'ml' : 'fr');
    var numero = equipe === 'fr' ? w.fr : w.ml;
    if (!numero) return null;
    return { numero: numero, equipe: equipe, affiche: equipe === 'fr' ? w.frAffiche : w.mlAffiche };
  }

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
      case 'paypal':
        return { t: 'PayPal', v: p.paypal.lien,
                 s: p.paypal.lien
                   ? 'Ouvrez ce lien (ou copiez-le) pour envoyer votre don via PayPal. Indiquez en note : ' + motif + '.'
                   : NOTE_TBD };
      case 'helloasso':
        return { t: 'HelloAsso — carte bancaire', lienExterne: (p.helloasso || {}).lien,
                 s: (p.helloasso || {}).lien
                   ? 'Paiement en ligne sécurisé par carte bancaire. HelloAsso vous envoie automatiquement un reçu — inutile de déclarer votre don ensuite.'
                   : NOTE_TBD };
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
    if (c.lienExterne) {
      html += '<a class="btn btn--or" style="display:inline-flex;margin-block:10px 8px" href="' + esc(c.lienExterne) + '" target="_blank" rel="noopener">Ouvrir HelloAsso ↗</a><br>';
      html += '<span>' + esc(c.s) + '</span>';
      paybox.innerHTML = html;
      return;
    }
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

  /* ---- grille d'impact : équivalence en mois de prise en charge d'un enfant.
     Calculée pour le FCFA et l'euro (parité fixe 1 € = 655,957 FCFA) ;
     texte générique pour le dollar, dont le cours varie. ---- */
  var COUT_MOIS = CFG.coutMensuelEnfantFCFA || null;
  var EUR_FCFA = 655.957;

  function descImpact(mensuel) {
    var generique = 'une part concrète de la scolarité d’un enfant';
    var enFCFA = cur === 'FCFA' ? amount : cur === 'EUR' ? amount * EUR_FCFA : null;
    if (!COUT_MOIS || !enFCFA) return generique;
    var mois = Math.floor(enFCFA / COUT_MOIS);
    if (mensuel) {
      return mois >= 1
        ? 'chaque mois la prise en charge complète ' + (mois > 1 ? 'de ' + mois + ' enfants' : 'd’un enfant')
        : generique;
    }
    if (mois >= 12) {
      var ans = Math.floor(mois / 12);
      return 'la prise en charge complète d’un enfant pendant ' + (ans > 1 ? ans + ' ans' : 'un an');
    }
    if (mois >= 1) return (mois > 1 ? mois + ' mois' : 'un mois') + ' de prise en charge complète d’un enfant';
    return generique;
  }

  function render() {
    var mensuel = freq === 'month';
    if (curLabel) curLabel.textContent = cur;
    if (impactT) {
      impactT.innerHTML = 'Donnez <b>' + fmt(amount) + ' ' + cur + '</b>' + (mensuel ? ' par mois' : '') +
        ' et vous financez <b>' + descImpact(mensuel) + '</b>.';
    }
    if (impactN) {
      impactN.textContent = mensuel
        ? 'Le don mensuel sera à renouveler manuellement tant que le prélèvement automatique n’est pas en place.'
        : COUT_MOIS
          ? 'Base : ' + fmt(COUT_MOIS) + ' FCFA par mois et par enfant, soit ' + fmt(COUT_MOIS * 12) + ' FCFA par an — scolarité, fournitures et accompagnement.'
          : 'La grille d’impact précise sera affichée dès que le coût annuel par enfant aura été communiqué par le centre.';
    }
    renderPaybox();
    if (versDecl) {
      versDecl.href = '/faire-un-don/?freq=' + freq + '&devise=' + cur + '&montant=' + amount + '&canal=' + pay + '#declarer';
    }
    var dest = destWhatsApp();
    if (waLink) {
      waLink.href = dest
        ? 'https://wa.me/' + dest.numero + '?text=' + encodeURIComponent(messageWhatsApp())
        : '#declarer';
    }
    /* Déclaration par e-mail (repli sans WhatsApp) : même contenu que le
       message WhatsApp, mis à jour à chaque changement du parcours. */
    var emailDecl = $('emailDecl');
    if (emailDecl) {
      var msgDecl = messageWhatsApp();
      emailDecl.textContent = 'Objet : Déclaration de don\n\n' + msgDecl;
      if (CFG.email && window.lienEmailRahma) {
        [['emailDeclGmail', 'gmail'], ['emailDeclOutlook', 'outlook'], ['emailDeclYahoo', 'yahoo'], ['emailDeclLien', 'appareil']]
          .forEach(function (paire) {
            var lien = $(paire[0]);
            if (lien) lien.href = window.lienEmailRahma(paire[1], CFG.email, 'Déclaration de don', msgDecl);
          });
      }
    }
    var waDest = $('waDest');
    if (waDest) {
      if (dest) {
        waDest.hidden = false;
        waDest.className = 'wadest wadest--' + dest.equipe;
        waDest.innerHTML = dest.equipe === 'fr'
          ? '<span aria-hidden="true">🇫🇷</span><p>Votre déclaration sera envoyée à <b>l’équipe de France</b>' +
            (dest.affiche ? ' (<span class="num">' + esc(dest.affiche) + '</span>)' : '') +
            ', qui pointe les relevés bancaires, Wero et PayPal.</p>'
          : '<span aria-hidden="true">🇲🇱</span><p>Votre déclaration sera envoyée à <b>l’équipe du Mali</b>' +
            (dest.affiche ? ' (<span class="num">' + esc(dest.affiche) + '</span>)' : '') +
            ', qui pointe les relevés Orange Money et Wave.</p>';
      } else {
        waDest.hidden = true;
      }
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
