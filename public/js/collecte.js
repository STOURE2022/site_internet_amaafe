/* Jauge de collecte combinée : les pages affichent d'abord les saisies
   manuelles de l'équipe (rendues au build), puis ce script ajoute la part
   HelloAsso lue sur /api/collecte (cache 1 h côté serveur).
   Contrat de balisage, sur un conteneur [data-collecte] portant
   data-objectif-fcfa et data-manuel-fcfa :
     [data-ctotal]    texte du total (« X FCFA »)
     [data-cpct]      texte du pourcentage (« 63,2 % »)
     [data-cbar-m]    segment or (saisies manuelles)
     [data-cbar-h]    segment vert (HelloAsso), positionné après le segment or
     [data-cdet]      ligne de détail HelloAsso (masquée par défaut)
     [data-cdet-mnt]  montant dans la ligne de détail
     [data-clive]     badge « mise à jour auto » (masqué par défaut)
     [data-cmaj]      mention de fraîcheur (masquée par défaut)
     [data-cprep]     variante « collecte en préparation », masquée dès
                      qu'un montant HelloAsso arrive
     [data-cjauge]    jauge complète masquée au build (aucune saisie
                      manuelle), révélée dès qu'un montant arrive */
(function () {
  var zones = document.querySelectorAll('[data-collecte]');
  if (!zones.length) return;

  var fmt = function (n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  var EUR_FCFA = 655.957;

  fetch('/api/collecte')
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (!d || !d.eur || d.eur <= 0) return;
      var helloFCFA = Math.round(d.eur * EUR_FCFA);

      zones.forEach(function (z) {
        var objectif = parseFloat(z.dataset.objectifFcfa || '0');
        var manuel = parseFloat(z.dataset.manuelFcfa || '0');
        if (!(objectif > 0)) return;
        var total = manuel + helloFCFA;
        var pctM = Math.min(100, (manuel / objectif) * 100);
        var pctH = Math.min(100 - pctM, (helloFCFA / objectif) * 100);
        var pct = Math.min(100, Math.round((pctM + pctH) * 10) / 10);

        z.querySelectorAll('[data-cprep]').forEach(function (e) { e.hidden = true; });
        z.querySelectorAll('[data-cjauge]').forEach(function (e) { e.hidden = false; });

        var el = function (s) { return z.querySelector(s); };
        var t = el('[data-ctotal]');
        if (t) t.textContent = fmt(total) + ' FCFA';
        var p = el('[data-cpct]');
        if (p) p.textContent = String(pct).replace('.', ',') + ' %';
        var bm = el('[data-cbar-m]');
        if (bm) bm.style.width = pctM + '%';
        var bh = el('[data-cbar-h]');
        if (bh) { bh.style.left = pctM + '%'; bh.style.width = pctH + '%'; }
        var det = el('[data-cdet]');
        if (det) {
          det.hidden = false;
          var m = el('[data-cdet-mnt]');
          if (m) m.textContent = fmt(d.eur) + ' € ≈ ' + fmt(helloFCFA) + ' FCFA';
        }
        var reste = el('[data-creste]');
        if (reste) {
          var manque = Math.max(0, objectif - total);
          reste.textContent = manque >= 1e6
            ? (manque / 1e6).toFixed(1).replace('.', ',') + ' millions FCFA'
            : fmt(manque) + ' FCFA';
        }
        var live = el('[data-clive]');
        if (live) live.hidden = false;
        var maj = el('[data-cmaj]');
        if (maj && d.ts) {
          var minutes = Math.max(1, Math.round((Date.now() - d.ts) / 60000));
          maj.hidden = false;
          maj.textContent = 'Montant HelloAsso actualisé il y a ' + minutes + ' min';
        }
      });
    })
    .catch(function () { /* la jauge reste sur les saisies manuelles */ });
})();
