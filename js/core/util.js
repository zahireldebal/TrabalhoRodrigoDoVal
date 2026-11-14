/* Shared helpers: escaping, dates, formatting, focus management */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) { return ESC[c]; });
  }

  var DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  var DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
    'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  var DAY_MS = 86400000;

  function pad(n) { return String(n).padStart(2, '0'); }

  function parseDate(iso) {
    if (iso instanceof Date) return new Date(iso.getFullYear(), iso.getMonth(), iso.getDate());
    var p = String(iso).split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }

  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function addDays(d, n) { var r = parseDate(d); r.setDate(r.getDate() + n); return r; }
  function diffDays(a, b) { return Math.round((parseDate(b) - parseDate(a)) / DAY_MS); }

  /** Monday of the week that contains `d`. */
  function startOfWeek(d) {
    var r = parseDate(d);
    var day = r.getDay();
    return addDays(r, day === 0 ? -6 : 1 - day);
  }

  function fmtDate(d) { d = parseDate(d); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function fmtDayMonth(d) { d = parseDate(d); return pad(d.getDate()) + '/' + pad(d.getMonth() + 1); }
  function fmtLong(d) { d = parseDate(d); return d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear(); }
  function fmtWeekday(d) { d = parseDate(d); return DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]; }

  function fmtRange(a, b) {
    a = parseDate(a); b = parseDate(b);
    if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
      return a.getDate() + ' a ' + b.getDate() + ' de ' + MESES_CURTOS[a.getMonth()] + '. de ' + a.getFullYear();
    }
    return a.getDate() + ' de ' + MESES_CURTOS[a.getMonth()] + '. a ' + b.getDate() + ' de ' + MESES_CURTOS[b.getMonth()] + '. de ' + b.getFullYear();
  }

  function toMin(hhmm) { var p = String(hhmm).split(':').map(Number); return p[0] * 60 + (p[1] || 0); }
  function fmtMin(min) { return pad(Math.floor(min / 60)) + ':' + pad(min % 60); }
  function fmtDuration(min) {
    var h = Math.floor(min / 60), m = min % 60;
    if (!h) return m + ' min';
    return m ? h + ' h ' + m + ' min' : h + ' h';
  }

  function plural(n, singular, pluralForm) { return n + ' ' + (n === 1 ? singular : pluralForm); }

  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  var SKIP = { 'prof.': 1, 'profa.': 1, de: 1, da: 1, do: 1, dos: 1, das: 1, e: 1 };
  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(function (p) { return !SKIP[p.toLowerCase()]; });
    if (!parts.length) return '?';
    var first = parts[0][0];
    var last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  function firstName(name) {
    var parts = String(name || '').trim().split(/\s+/).filter(function (p) { return !SKIP[p.toLowerCase()]; });
    return parts[0] || '';
  }

  function normalize(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  function hashString(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
  }

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function focusables(root) {
    return Array.prototype.filter.call(root.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  /** Keeps Tab / Shift+Tab inside `container`. */
  function trapTab(container, event) {
    if (event.key !== 'Tab') return;
    var items = focusables(container);
    if (!items.length) { event.preventDefault(); return; }
    var first = items[0], last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function now() { return new Date(); }

  function greeting(d) {
    var h = (d || now()).getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  TC.util = {
    esc: esc, pad: pad, parseDate: parseDate, toISO: toISO, addDays: addDays, diffDays: diffDays,
    startOfWeek: startOfWeek, fmtDate: fmtDate, fmtDayMonth: fmtDayMonth, fmtLong: fmtLong,
    fmtWeekday: fmtWeekday, fmtRange: fmtRange, toMin: toMin, fmtMin: fmtMin, fmtDuration: fmtDuration,
    plural: plural, uid: uid, initials: initials, firstName: firstName, normalize: normalize,
    debounce: debounce, hashString: hashString, focusables: focusables, trapTab: trapTab,
    reducedMotion: reducedMotion, now: now, greeting: greeting,
    DIAS: DIAS, DIAS_CURTOS: DIAS_CURTOS, MESES: MESES
  };
})(window.TC);
