/* Inline SVG icon set (24×24, stroke based). Decorative by default: aria-hidden. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var P = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    bookOpen: '<path d="M2 4.5h6a4 4 0 0 1 4 4V21a3 3 0 0 0-3-3H2z"/><path d="M22 4.5h-6a4 4 0 0 0-4 4V21a3 3 0 0 1 3-3h7z"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    calendarRange: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M16 2.5v4M8 2.5v4M3 10h18M7 15h4M13 15h4"/>',
    graduation: '<path d="M22 9 12 4 2 9l10 5 10-5Z"/><path d="M6 11.2V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.8"/><path d="M22 9v6"/>',
    layers: '<path d="m12 2.5 9.5 5-9.5 5-9.5-5z"/><path d="m2.5 12 9.5 5 9.5-5"/><path d="m2.5 16.5 9.5 5 9.5-5"/>',
    book: '<path d="M4 19.5V5a2.5 2.5 0 0 1 2.5-2.5H20v17H6.5A2.5 2.5 0 0 0 4 22"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M9 7h7M9 10.5h5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    user: '<circle cx="12" cy="8" r="4.5"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    userPlus: '<circle cx="9" cy="8" r="4.5"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/>',
    idCard: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><circle cx="8.5" cy="11" r="2.5"/><path d="M5 16.5a3.8 3.8 0 0 1 7 0M15 9.5h4M15 13h3"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.6-4.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    trash: '<path d="M3 6h18M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M18.5 6l-.8 13.2A2 2 0 0 1 15.7 21H8.3a2 2 0 0 1-2-1.8L5.5 6"/><path d="M10 11v6M14 11v6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9.5"/><path d="m8 12.5 2.7 2.7L16.5 9.5"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    alertCircle: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5.5M12 16.5h.01"/>',
    info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5M12 8h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    moon: '<path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a6.6 6.6 0 0 0 11 11Z"/>',
    sunset: '<path d="M12 10V2M5.2 11.2l1.4 1.4M2 18h2M20 18h2M17.4 12.6l1.4-1.4M22 22H2M8 6l4-4 4 4M16 18a4 4 0 0 0-8 0"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    chevronLeft: '<path d="m15 18-6-6 6-6"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    sort: '<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>',
    sortAsc: '<path d="m7 14 5-5 5 5"/>',
    sortDesc: '<path d="m7 10 5 5 5-5"/>',
    printer: '<path d="M6 9V2.5h12V9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7.5" rx="1"/>',
    clock: '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.2 2"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M8 16H3v5"/>',
    target: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="5.5"/><circle cx="12" cy="12" r="1.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    grid: '<rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/>',
    sparkle: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="M12 8.5 13.3 11 15.5 12l-2.2 1L12 15.5 10.7 13 8.5 12l2.2-1z"/>',
    flag: '<path d="M4 22V4M4 4h12l-2 4 2 4H4"/>',
    command: '<path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>',
    enter: '<path d="M9 10 4 15l5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>',
    circle: '<circle cx="12" cy="12" r="8.5"/>',
    circleDot: '<circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>',
    hourglass: '<path d="M6 2h12M6 22h12M7 2v4a5 5 0 0 0 10 0V2M7 22v-4a5 5 0 0 1 10 0v4"/>',
    briefcase: '<rect x="2.5" y="7" width="19" height="13.5" rx="2.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2.5 13h19"/>',
    shield: '<path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/>'
  };

  /**
   * @param {string} name icon key
   * @param {object} [opts] { size, label, cls }
   */
  TC.icon = function (name, opts) {
    opts = opts || {};
    var body = P[name] || P.circle;
    var size = opts.size || 24;
    var a11y = opts.label
      ? 'role="img" aria-label="' + TC.util.esc(opts.label) + '"'
      : 'aria-hidden="true" focusable="false"';
    return '<svg class="' + (opts.cls || 'i') + '" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (opts.stroke || 2) +
      '" stroke-linecap="round" stroke-linejoin="round" ' + a11y + '>' + body + '</svg>';
  };
})(window.TC);
