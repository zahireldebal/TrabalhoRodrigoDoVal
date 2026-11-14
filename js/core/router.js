/* Hash router: #/path?key=value — works on file:// and GitHub Pages. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var handler = null;

  function parse() {
    var raw = (location.hash || '').replace(/^#/, '');
    if (!raw || raw === '/') raw = '/painel';
    var parts = raw.split('?');
    var query = {};
    if (parts[1]) {
      new URLSearchParams(parts[1]).forEach(function (v, k) { query[k] = v; });
    }
    return { path: parts[0], query: query };
  }

  TC.router = {
    parse: parse,

    go: function (hash) {
      if (location.hash === hash) { if (handler) handler(parse()); }
      else location.hash = hash;
    },

    /** Removes query params from the URL without triggering a navigation. */
    clean: function (path) {
      try { history.replaceState(null, '', '#' + path); } catch (e) { /* file:// in some browsers */ }
    },

    start: function (fn) {
      handler = fn;
      window.addEventListener('hashchange', function () { handler(parse()); });
      handler(parse());
    }
  };
})(window.TC);
