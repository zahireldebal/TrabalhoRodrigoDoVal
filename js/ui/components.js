/* Small presentational components that return HTML strings. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var esc = TC.util.esc;
  var I = TC.icon;

  /* ---------- Brand ---------- */
  var MARK_BODY =
    '<path d="M32 3.5 55 10.5V30c0 14.5-9.5 24.5-23 30.5C18.5 54.5 9 44.5 9 30V10.5Z" fill="#1B2A55"/>' +
    '<path d="M32 8.2 50.6 13.8V30c0 11.8-7.4 20.1-18.6 25.4C20.8 50.1 13.4 41.8 13.4 30V13.8Z" fill="none" stroke="#F28C28" stroke-width="1.8"/>' +
    '<path d="M18.5 25.5c3-7 9.5-9.4 9-4.6-.4 3.6-4.6 6.2-2.4 6.6 2 .4 5.2-3.2 7.4-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M17 38.6c4.5-2.3 9.5-2.3 14 .3v10.3c-4.5-2.5-9.5-2.5-14-.3Z" fill="#fff"/>' +
    '<path d="M47 38.6c-4.5-2.3-9.5-2.3-14 .3v10.3c4.5-2.5 9.5-2.5 14-.3Z" fill="#fff"/>' +
    '<path d="M20 41.6c2.6-.9 5.4-.9 8 .4M20 44.6c2.6-.9 5.4-.9 8 .4M36 42c2.6-1.3 5.4-1.3 8-.4M36 45c2.6-1.3 5.4-1.3 8-.4" stroke="#F28C28" stroke-width="1.1" stroke-linecap="round" fill="none"/>' +
    '<path d="M15.6 50.2c5.2-2.3 11-2.1 16.4.6 5.4-2.7 11.2-2.9 16.4-.6" fill="none" stroke="#F28C28" stroke-width="1.9" stroke-linecap="round"/>' +
    '<g transform="rotate(40 36 28)">' +
    '<rect x="33" y="7" width="6.4" height="31" rx="3.2" fill="#2A3D75" stroke="#fff" stroke-width="1.5"/>' +
    '<rect x="33" y="10" width="6.4" height="4.2" fill="#F28C28"/>' +
    '<rect x="33" y="30.5" width="6.4" height="2.6" fill="#F28C28"/>' +
    '<path d="M33.4 38h5.6l-2.8 7.2Z" fill="#fff" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>' +
    '<path d="M35.2 13.5v15" stroke="#fff" stroke-opacity=".55" stroke-width="1.1" stroke-linecap="round"/>' +
    '</g>';

  function logoMark(label) {
    var a11y = label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true" focusable="false"';
    return '<svg viewBox="0 0 64 64" ' + a11y + '>' + MARK_BODY + '</svg>';
  }

  /** Full circular logo. `textColor` lets it sit on dark or light backgrounds. */
  function logoFull(textColor) {
    var c = textColor || '#1B2A55';
    return '<svg class="logo-full" viewBox="0 0 240 240" role="img" aria-label="Teacher Class — Aprender, Ensinar, Organizar">' +
      '<defs><path id="tc-arc-top" d="M28 120a92 92 0 0 1 184 0"/><path id="tc-arc-bottom" d="M20 120a100 100 0 0 0 200 0"/></defs>' +
      '<text font-family="Plus Jakarta Sans, Inter, sans-serif" font-weight="800" font-size="25" letter-spacing="2.5" fill="' + c + '">' +
      '<textPath href="#tc-arc-top" startOffset="50%" text-anchor="middle">TEACHER CLASS</textPath></text>' +
      '<text font-family="Plus Jakarta Sans, Inter, sans-serif" font-weight="700" font-size="13.5" letter-spacing=".4" fill="' + c + '">' +
      '<textPath href="#tc-arc-bottom" startOffset="50%" text-anchor="middle">Aprender <tspan fill="#F28C28">•</tspan> Ensinar <tspan fill="#F28C28">•</tspan> Organizar</textPath></text>' +
      '<g transform="translate(56 54) scale(2)">' + MARK_BODY + '</g></svg>';
  }

  /* ---------- Illustrations for empty states (theme-aware via CSS vars) ---------- */
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

  TC.ui = TC.ui || {};
  Object.assign(TC.ui, {
    logoMark: logoMark, logoFull: logoFull, emptyState: emptyState, courseChip: courseChip,
    avatar: avatar, turnoBadge: turnoBadge, periodoBadge: periodoBadge, pageHead: pageHead
  });
})(window.TC);
