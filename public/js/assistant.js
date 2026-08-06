/* Assistant Rahma — chatbot guidé, sans serveur ni IA.
   Les réponses sont construites à partir des données du site
   (content/config.json), injectées par <script id="assistant-config">.
   Aucune donnée visiteur n'est collectée ni transmise. */
(function () {
  var cfgEl = document.getElementById('assistant-config');
  if (!cfgEl) return;
  var C = JSON.parse(cfgEl.textContent);

  var fmt = function (n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  var mono = function (t) { return '<span class="mono">' + t + '</span>'; };

  /* ---- les canaux de don, selon ce qui est réellement configuré ---- */
  var canauxMali = [];
  if (C.telMali) canauxMali.push('Orange Money ou Wave au ' + mono(C.telMali));
  var canauxEurope = [];
  if (C.telFrance) canauxEurope.push('Wero au ' + mono(C.telFrance));
  canauxEurope.push('PayPal ou virement (coordonnées sur la page don)');

  var medersaTexte = 'Le projet prioritaire : acquérir un terrain et construire une vraie médersa (salles de classe, bibliothèque, sanitaires, cour sécurisée, salle de prière…).<br><br>';
  if (C.objectifEUR != null) {
    medersaTexte += '<b>Objectif de collecte : ' + fmt(C.objectifEUR) + ' €</b>';
    if (C.collecteFCFA != null && C.pctCollecte > 0) {
      medersaTexte += ' — déjà ' + fmt(C.collecteFCFA) + ' FCFA collectés (' + String(C.pctCollecte).replace('.', ',') + ' %)';
    }
    medersaTexte += '. Chaque contribution est une pierre posée. 🧱';
  }

  var parrainageMontant = C.parrainageFCFA != null
    ? '<b>Montant mensuel :</b> ' + mono(fmt(C.parrainageFCFA) + ' FCFA') + ' depuis l’Afrique' +
      (C.parrainageEUR != null ? ' ou ' + mono(C.parrainageEUR + ' €') + ' depuis l’Europe' : '')
    : 'Le montant mensuel est indiqué sur la page Parrainage';

  var SUJETS = {
    accueil: {
      reponses: ["<b>Assalamu alaykum, bienvenue !</b> 👋 Je suis l'assistant du Centre Coranique Rahma, l'école coranique gratuite de l'AMAAFE à Yirimadio (Bamako). Que souhaitez-vous savoir ?"],
      choix: [
        ['💛', 'Faire un don', 'don'],
        ['🤝', 'Parrainer un enfant', 'parrainage'],
        ['🕌', 'Le projet de médersa', 'medersa'],
        ['📖', 'Le centre et ses horaires', 'centre'],
        ['🧕', "L'association AMAAFE", 'amaafe'],
        ['📱', 'Nos réseaux sociaux', 'reseaux'],
        ['📞', 'Parler à une vraie personne', 'humain'],
      ],
    },
    don: {
      moi: 'Faire un don',
      reponses: [
        "Qu'Allah récompense votre générosité ! 🤲 Chaque don est une <b>Sadaqa Jâriya</b>. Vous pouvez donner :",
        '<ul><li><b>Depuis le Mali :</b> ' + canauxMali.join(', ') + '</li>' +
        '<li><b>Depuis l’Europe :</b> ' + canauxEurope.join(', ') + '</li></ul>' +
        'Après votre envoi, déclarez votre don sur la page — c’est ce qui permet au centre de le retrouver et de vous remercier.',
      ],
      choix: [
        ['🧾', 'Et la Zakat ?', 'zakat'],
        ['🇫🇷', "Réduction d'impôt en France ?", 'fiscal'],
        ['➡️', 'Aller à la page don', 'lien:/faire-un-don/'],
        ['🏠', 'Autres questions', 'accueil'],
      ],
    },
    zakat: {
      moi: 'Et la Zakat ?',
      reponses: ["Oui, l'association <b>accepte la Zakat</b>. Précisez-le simplement lors de votre déclaration de don : elle sera comptabilisée et utilisée séparément, conformément à son statut."],
      choix: [['➡️', 'Faire un don maintenant', 'lien:/faire-un-don/'], ['🏠', 'Autres questions', 'accueil']],
    },
    fiscal: {
      moi: "Réduction d'impôt en France ?",
      reponses: ["Oui ! AMAAFE / France dispose d'un <b>rescrit fiscal</b> : les dons versés en France ouvrent droit à une <b>réduction d'impôt de 66 %</b> (dans les limites légales), avec reçu fiscal délivré. Un don de 100 € ne vous coûte réellement que 34 €."],
      choix: [['➡️', 'Faire un don maintenant', 'lien:/faire-un-don/'], ['🏠', 'Autres questions', 'accueil']],
    },
    parrainage: {
      moi: 'Parrainer un enfant',
      reponses: [
        'Le parrainage garantit à un enfant la continuité de son parcours : scolarité, fournitures et accompagnement.',
        parrainageMontant + '.<br><br>Chaque trimestre, vous recevez des nouvelles de votre filleul : son évolution, ses messages ou ses dessins — jusqu’à ses ' + C.suiviJusquaAge + ' ans et son orientation vers un métier.',
      ],
      choix: [
        ['👧', 'Voir les enfants à parrainer', 'lien:/parrainage/'],
        ['💬', "Contacter l'équipe parrainage", 'humain'],
        ['🏠', 'Autres questions', 'accueil'],
      ],
    },
    medersa: {
      moi: 'Le projet de médersa',
      reponses: [
        "Aujourd'hui, les " + (C.eleves != null ? C.eleves + ' ' : '') + 'élèves étudient sous un <b>hangar en tôle</b> prêté par la mosquée du quartier — chaleur, bruit, risques à la saison des pluies.',
        medersaTexte,
      ],
      choix: [
        ['🧱', 'Poser une pierre (donner)', 'lien:/faire-un-don/'],
        ['📄', 'Découvrir le projet en détail', 'lien:/notre-projet/'],
        ['🏠', 'Autres questions', 'accueil'],
      ],
    },
    centre: {
      moi: 'Le centre et ses horaires',
      reponses: [
        'Le Centre Coranique Rahma, créé en ' + C.anneeCreation + ' à Yirimadio (Bamako), accueille <b>' + C.eleves + ' élèves</b> encadrés par ' + C.enseignants + ' enseignants — entièrement <b>gratuit</b> : scolarité, fournitures et uniformes offerts.',
        (C.horaires ? '<b>Horaires de visite :</b> ' + C.horaires + '.<br>' : '') + '<b>Adresse :</b> ' + C.adresse + '.',
      ],
      choix: [
        ['📖', 'En savoir plus sur le centre', 'lien:/le-centre/'],
        ['🗺️', 'Nous contacter / venir', 'lien:/contact/'],
        ['🏠', 'Autres questions', 'accueil'],
      ],
    },
    amaafe: {
      moi: "L'association AMAAFE",
      reponses: [
        "L'<b>AMAAFE</b> agit depuis 2010 au Mali (et 2012 en France) pour les femmes et les enfants : scolarisation, aide alimentaire, forages, autonomie des femmes… Le Centre Rahma est l'une de ses actions.",
        'Quelques chiffres : <b>832 enfants</b> accompagnés vers l’école, <b>4 800 repas</b> offerts au Ramadan 2026, <b>2 forages</b> réalisés. Ses comptes sont publiés sur la page Transparence.',
      ],
      choix: [
        ['🧕', "Découvrir l'AMAAFE", 'lien:/l-amaafe/'],
        ['🔍', 'Voir la transparence financière', 'lien:/transparence/'],
        ['🏠', 'Autres questions', 'accueil'],
      ],
    },
    reseaux: {
      moi: 'Nos réseaux sociaux',
      reponses: ["Suivez les actions de l'AMAAFE et la vie du centre en images : distributions, sorties éducatives, avancement du projet de médersa… 🔥 Rejoignez-nous :"],
      liens: [
        (C.reseaux || {}).facebook && ['wa', '👍 Facebook', C.reseaux.facebook],
        (C.reseaux || {}).instagram && ['or', '📷 Instagram', C.reseaux.instagram],
        (C.reseaux || {}).tiktok && ['wa', '🎵 TikTok', C.reseaux.tiktok],
        (C.reseaux || {}).youtube && ['or', '▶️ YouTube', C.reseaux.youtube],
        (C.reseaux || {}).whatsapp && ['wa', '💬 Canal WhatsApp', C.reseaux.whatsapp],
      ].filter(Boolean),
      choix: [['🏠', 'Autres questions', 'accueil']],
    },
    humain: {
      moi: 'Parler à une vraie personne',
      reponses: [
        "Avec plaisir ! L'équipe répond rapidement sur WhatsApp :<ul>" +
        (C.telMali ? '<li><b>Mali :</b> ' + C.telMali + '</li>' : '') +
        (C.telFrance ? '<li><b>France :</b> ' + C.telFrance + '</li>' : '') +
        '</ul>Ou par écrit : ' + C.email,
      ],
      liens: [
        C.waMali && ['wa', '💬 Ouvrir WhatsApp (équipe Mali)', 'https://wa.me/' + C.waMali],
        C.waFrance && ['wa', '💬 Ouvrir WhatsApp (équipe France)', 'https://wa.me/' + C.waFrance],
        ['or', '✉️ Écrire par e-mail', '/contact/'],
      ].filter(Boolean),
      choix: [['🏠', 'Autres questions', 'accueil']],
    },
  };

  var flux = document.getElementById('cb-flux');
  var cb = document.getElementById('cb');
  var bulle = document.getElementById('cb-ouvre');
  var coucou = document.getElementById('cb-coucou');
  if (!flux || !cb || !bulle) return;

  function bulleBot(html) {
    var d = document.createElement('div');
    d.className = 'cb__msg cb__msg--bot';
    d.innerHTML = html;
    flux.appendChild(d);
    flux.scrollTop = flux.scrollHeight;
  }
  function bulleMoi(texte) {
    var d = document.createElement('div');
    d.className = 'cb__msg cb__msg--moi';
    d.textContent = texte;
    flux.appendChild(d);
    flux.scrollTop = flux.scrollHeight;
  }
  function tape(fin) {
    var t = document.createElement('div');
    t.className = 'cb__typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    flux.appendChild(t);
    flux.scrollTop = flux.scrollHeight;
    setTimeout(function () { t.remove(); fin(); }, 620);
  }
  function montreChoix(sujet) {
    var wrap = document.createElement('div');
    wrap.className = 'cb__chx';
    (sujet.liens || []).forEach(function (l) {
      var a = document.createElement('a');
      a.href = l[2];
      if (l[2].indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener'; }
      if (l[0] === 'or') a.className = 'or';
      a.textContent = l[1];
      wrap.appendChild(a);
    });
    (sujet.choix || []).forEach(function (c) {
      if (c[2].indexOf('lien:') === 0) {
        var a = document.createElement('a');
        a.href = c[2].slice(5);
        a.className = 'or';
        a.innerHTML = '<span class="em">' + c[0] + '</span>' + c[1] + ' ↗';
        wrap.appendChild(a);
      } else {
        var b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = '<span class="em">' + c[0] + '</span>' + c[1];
        b.addEventListener('click', function () { va(c[2]); });
        wrap.appendChild(b);
      }
    });
    flux.appendChild(wrap);
    flux.scrollTop = flux.scrollHeight;
  }
  function va(cle) {
    var s = SUJETS[cle];
    if (!s) return;
    Array.prototype.forEach.call(document.querySelectorAll('.cb__chx'), function (el) { el.remove(); });
    if (s.moi) bulleMoi(s.moi);
    var i = 0;
    (function suivant() {
      if (i < s.reponses.length) {
        tape(function () { bulleBot(s.reponses[i]); i++; suivant(); });
      } else {
        montreChoix(s);
      }
    })();
  }

  function ouvreFerme() {
    var ouvert = cb.hasAttribute('hidden');
    if (ouvert) {
      cb.removeAttribute('hidden');
      cb.classList.add('ouvert');
      if (!flux.hasChildNodes()) va('accueil');
    } else {
      cb.setAttribute('hidden', '');
      cb.classList.remove('ouvert');
    }
    bulle.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    coucou.hidden = true;
    try { sessionStorage.setItem('rahma-coucou', '1'); } catch (e) {}
  }
  bulle.addEventListener('click', ouvreFerme);
  document.getElementById('cb-ferme').addEventListener('click', ouvreFerme);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !cb.hasAttribute('hidden')) ouvreFerme();
  });

  /* nuage messager : questions tournantes, une fois par session,
     disparaît dès que l'assistant a été ouvert */
  var MESSAGES = [
    'Assalamu alaykum 👋 Je peux vous aider',
    'Une question sur les dons ? 💛',
    'Comment parrainer un enfant ? 🤝',
    'Où en est la médersa ? 🕌',
  ];
  var coucouTxt = document.getElementById('cb-coucou-txt');
  var iMsg = 0;
  var rotation = null;
  var dejaVu = false;
  try { dejaVu = sessionStorage.getItem('rahma-coucou') === '1'; } catch (e) {}
  if (!dejaVu && coucouTxt) {
    setTimeout(function () {
      if (!cb.hasAttribute('hidden')) return;
      coucou.hidden = false;
      rotation = setInterval(function () {
        if (coucou.hidden) { clearInterval(rotation); return; }
        coucouTxt.classList.add('fondu');
        setTimeout(function () {
          iMsg = (iMsg + 1) % MESSAGES.length;
          coucouTxt.textContent = MESSAGES[iMsg];
          coucouTxt.classList.remove('fondu');
        }, 300);
      }, 4200);
    }, 3500);
  }
})();
