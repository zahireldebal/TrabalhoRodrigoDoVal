/* Persistence layer: in-memory data mirrored to localStorage (guarded with try/catch). */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var DATA_KEY = 'tc-data';
  var SESSION_KEY = 'tc-session';
  var data = null;
  var memorySession = null;
  var storageOk = true;
  var listeners = [];

  var safe = {
    get: function (key) {
      try { return window.localStorage.getItem(key); } catch (e) { storageOk = false; return null; }
    },
    set: function (key, value) {
      try { window.localStorage.setItem(key, value); return true; } catch (e) { storageOk = false; return false; }
    },
    remove: function (key) {
      try { window.localStorage.removeItem(key); } catch (e) { storageOk = false; }
    }
  };

  function load() {
    var raw = safe.get(DATA_KEY);
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.version === TC.seed.VERSION && Array.isArray(parsed.cursos)) return parsed;
      } catch (e) { /* corrupted data: fall back to the demo dataset */ }
    }
    return TC.seed();
  }

  function persist() {
    safe.set(DATA_KEY, JSON.stringify(data));
    listeners.forEach(function (fn) { fn(); });
  }

  function table(type) {
    if (!data[type]) throw new Error('Unknown collection: ' + type);
    return data[type];
  }

  TC.store = {
    init: function () { data = load(); persist(); },

    all: function (type) { return table(type).slice(); },

    get: function (type, id) {
      var list = table(type);
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    },

    where: function (type, field, value) {
      return table(type).filter(function (r) { return r[field] === value; });
    },

    count: function (type, field, value) {
      if (field === undefined) return table(type).length;
      return this.where(type, field, value).length;
    },

    insert: function (type, record) {
      var rec = Object.assign({}, record);
      rec.id = rec.id || TC.util.uid(type.slice(0, 3));
      table(type).push(rec);
      persist();
      return rec;
    },

    update: function (type, id, patch) {
      var rec = this.get(type, id);
      if (!rec) return null;
      Object.assign(rec, patch);
      persist();
      return rec;
    },

    remove: function (type, id) {
      data[type] = table(type).filter(function (r) { return r.id !== id; });
      persist();
    },

    reset: function () { data = TC.seed(); persist(); },

    onChange: function (fn) { listeners.push(fn); },

    isPersistent: function () { return storageOk; },

    session: {
      get: function () { return safe.get(SESSION_KEY) || memorySession; },
      set: function (id) { memorySession = id; safe.set(SESSION_KEY, id); },
      clear: function () { memorySession = null; safe.remove(SESSION_KEY); }
    },

    pref: {
      get: function (key, fallback) { var v = safe.get('tc-' + key); return v == null ? fallback : v; },
      set: function (key, value) { safe.set('tc-' + key, value); }
    }
  };
})(window.TC);
