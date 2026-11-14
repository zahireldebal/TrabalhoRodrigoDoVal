/* Small presentational components that return HTML strings. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var esc = TC.util.esc;
  var I = TC.icon;

  /* ---------- Brand (logo extracted from the team's original artwork) ---------- */
  function logoMark(label) {
    return '<img class="logo-img" src="assets/logo-escudo.webp" width="256" height="256" decoding="async" alt="' + esc(label || '') + '">';
  }

  function logoFull() {
    return '<img class="logo-img logo-full" src="assets/logo-teacher-class.webp" width="600" height="600" decoding="async" ' +
      'alt="Teacher Class — Aprender, Ensinar, Organizar">';
  }

  /* ---------- Illustrations for empty states ---------- */
  var ILLUS = {
    folder:
      '<ellipse cx="90" cy="118" rx="70" ry="8" fill="var(--surface-3)"/>' +
      '<rect x="36" y="30" width="96" height="76" rx="10" fill="var(--surface-2)" stroke="var(--border-strong)" stroke-width="2"/>' +
      '<rect x="48" y="20" width="96" height="76" rx="10" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="2"/>' +
      '<rect x="60" y="36" width="52" height="7" rx="3.5" fill="var(--border-strong)"/>' +
      '<rect x="60" y="51" width="70" height="6" rx="3" fill="var(--surface-3)"/>' +
      '<rect x="60" y="64" width="60" height="6" rx="3" fill="var(--surface-3)"/>' +
      '<circle cx="138" cy="90" r="18" fill="#F28C28"/><path d="M138 82v16M130 90h16" stroke="#14213F" stroke-width="3" stroke-linecap="round"/>',
    search:
      '<ellipse cx="90" cy="118" rx="70" ry="8" fill="var(--surface-3)"/>' +
      '<rect x="34" y="22" width="92" height="80" rx="10" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="2"/>' +
      '<rect x="48" y="38" width="44" height="7" rx="3.5" fill="var(--border-strong)"/>' +
      '<rect x="48" y="53" width="62" height="6" rx="3" fill="var(--surface-3)"/>' +
      '<rect x="48" y="66" width="52" height="6" rx="3" fill="var(--surface-3)"/>' +
      '<circle cx="124" cy="76" r="20" fill="var(--surface)" stroke="#2F8FD1" stroke-width="5"/>' +
      '<path d="m139 91 14 14" stroke="#2F8FD1" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M117 76h14" stroke="#F28C28" stroke-width="3.5" stroke-linecap="round"/>',
    calendar:
      '<ellipse cx="90" cy="118" rx="70" ry="8" fill="var(--surface-3)"/>' +
      '<rect x="40" y="22" width="100" height="84" rx="12" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="2"/>' +
      '<path d="M40 44h100" stroke="var(--border-strong)" stroke-width="2"/>' +
      '<rect x="40" y="22" width="100" height="22" rx="12" fill="#1B2A55"/><rect x="40" y="34" width="100" height="10" fill="#1B2A55"/>' +
      '<path d="M64 16v14M116 16v14" stroke="#F28C28" stroke-width="5" stroke-linecap="round"/>' +
      '<g fill="var(--surface-3)"><rect x="54" y="56" width="16" height="12" rx="3"/><rect x="82" y="56" width="16" height="12" rx="3"/><rect x="110" y="56" width="16" height="12" rx="3"/><rect x="54" y="78" width="16" height="12" rx="3"/><rect x="110" y="78" width="16" height="12" rx="3"/></g>' +
      '<rect x="82" y="78" width="16" height="12" rx="3" fill="#3BAA6E"/><path d="m85.5 84 3 3 6-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    book:
      '<ellipse cx="90" cy="118" rx="70" ry="8" fill="var(--surface-3)"/>' +
      '<path d="M30 34c18-8 40-8 58 2v72c-18-10-40-10-58-2Z" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="2"/>' +
      '<path d="M150 34c-18-8-40-8-58 2v72c18-10 40-10 58-2Z" fill="var(--surface)" stroke="var(--border-strong)" stroke-width="2"/>' +
      '<path d="M42 50c10-3 22-3 34 1M42 62c10-3 22-3 34 1M42 74c10-3 22-3 34 1M104 51c12-4 24-4 34-1M104 63c12-4 24-4 34-1" stroke="var(--surface-3)" stroke-width="5" stroke-linecap="round"/>' +
      '<g transform="rotate(38 120 50)"><rect x="114" y="10" width="12" height="62" rx="6" fill="#1B2A55"/><rect x="114" y="16" width="12" height="8" fill="#F28C28"/><path d="M115 72h10l-5 12Z" fill="#F28C28"/></g>'
  };

  function emptyState(o) {
    return '<div class="empty' + (o.small ? ' empty-sm' : '') + '">' +
      '<svg class="empty-illus" viewBox="0 0 180 130" aria-hidden="true" focusable="false">' + (ILLUS[o.illus] || ILLUS.folder) + '</svg>' +
      '<' + (o.level || 'h2') + '>' + esc(o.title) + '</' + (o.level || 'h2') + '>' +
      (o.text ? '<p>' + esc(o.text) + '</p>' : '') +
      (o.action || '') +
      '</div>';
  }

  /* ---------- Data chips ---------- */
  function courseChip(curso, opts) {
    if (!curso) return '<span class="badge badge-outline">Sem curso</span>';
    opts = opts || {};
    var label = opts.full ? curso.codigo + ' · ' + curso.nome : curso.codigo;
    return '<span class="course-chip cs ' + TC.domain.cursoStyle(curso.id) + '" title="' + esc(curso.nome) + '">' +
      '<span class="swatch" aria-hidden="true"></span>' + esc(label) +
      (opts.full ? '' : '<span class="sr-only"> — ' + esc(curso.nome) + '</span>') + '</span>';
  }

  function avatar(name, size) {
    var alt = TC.util.hashString(name || '') % 4;
    return '<span class="avatar' + (size ? ' avatar-' + size : '') + (alt ? ' alt-' + alt : '') + '" aria-hidden="true">' +
      esc(TC.util.initials(name)) + '</span>';
  }

  function turnoBadge(turno) {
    var icon = turno === 'Matutino' ? 'sun' : turno === 'Vespertino' ? 'sunset' : 'moon';
    var cls = turno === 'Matutino' ? 'badge-warning' : turno === 'Vespertino' ? 'badge-accent' : 'badge-info';
    return '<span class="badge ' + cls + '">' + I(icon) + esc(turno) + '</span>';
  }

  function periodoBadge(status) {
    if (status === 'andamento') return '<span class="badge badge-success">' + I('circleDot') + 'Em andamento</span>';
    if (status === 'encerrado') return '<span class="badge badge-outline">' + I('checkCircle') + 'Encerrado</span>';
    return '<span class="badge badge-info">' + I('hourglass') + 'Planejado</span>';
  }

  function pageHead(o) {
    return '<header class="page-head">' +
      '<div>' +
      (o.eyebrow ? '<span class="eyebrow">' + (o.eyebrowIcon ? I(o.eyebrowIcon) : '') + esc(o.eyebrow) + '</span>' : '') +
      '<h1 tabindex="-1" data-page-title>' + esc(o.title) + '</h1>' +
      (o.lead ? '<p class="lead">' + o.lead + '</p>' : '') +
      '</div>' +
      (o.actions ? '<div class="page-actions">' + o.actions + '</div>' : '') +
      '</header>';
  }

  /** Number that counts up on first paint (screen readers get the final value). */
  function counter(value) {
    return '<span aria-hidden="true" data-count-to="' + Number(value) + '">' + Number(value) + '</span><span class="sr-only">' + Number(value) + '</span>';
  }

  function countUp(root) {
    if (TC.util.reducedMotion()) return;
    Array.prototype.forEach.call(root.querySelectorAll('[data-count-to]'), function (el, i) {
      var target = Number(el.getAttribute('data-count-to'));
      if (!target) return;
      var start = null, dur = 700 + Math.min(target, 40) * 8, delay = i * 60;
      el.textContent = '0';
      function step(ts) {
        if (start === null) start = ts + delay;
        var t = Math.max(0, Math.min(1, (ts - start) / dur));
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  TC.ui = TC.ui || {};
  Object.assign(TC.ui, {
    counter: counter, countUp: countUp,
    logoMark: logoMark, logoFull: logoFull, emptyState: emptyState, courseChip: courseChip,
    avatar: avatar, turnoBadge: turnoBadge, periodoBadge: periodoBadge, pageHead: pageHead
  });
})(window.TC);
