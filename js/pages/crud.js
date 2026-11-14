/* Generic CRUD page: searchable/filterable/sortable list, side-panel form with
   validation, edit and delete with confirmation and relationship guards. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var U = TC.util;
  var esc = U.esc;
  var I = TC.icon;
  var state = {};

  function words(cfg) {
    var f = cfg.gender === 'f';
    return {
      novo: (f ? 'Nova ' : 'Novo ') + cfg.singular,
      cadastrado: f ? 'cadastrada' : 'cadastrado',
      atualizado: f ? 'atualizada' : 'atualizado',
      excluido: f ? 'excluída' : 'excluído',
      art: f ? 'a' : 'o',
      nenhum: f ? 'Nenhuma ' + cfg.singular : 'Nenhum ' + cfg.singular
    };
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function nameOf(cfg, rec) { return cfg.nameOf ? cfg.nameOf(rec) : rec.nome; }

  function getState(key, cfg) {
    if (!state[key]) state[key] = { q: '', filters: {}, sort: cfg.defaultSort, dir: cfg.defaultDir || 'asc' };
    return state[key];
  }

  function rows(cfg, st) {
    var q = U.normalize(st.q);
    var terms = q ? q.split(/\s+/) : [];
    var list = TC.store.all(cfg.collection).filter(function (r) {
      if (terms.length) {
        var hay = U.normalize(cfg.search(r));
        if (!terms.every(function (t) { return hay.indexOf(t) >= 0; })) return false;
      }
      return (cfg.filters || []).every(function (f) {
        var v = st.filters[f.name];
        return !v || f.match(r, v);
      });
    });
    var col = cfg.columns.filter(function (c) { return c.key === st.sort; })[0] || cfg.columns[0];
    list.sort(function (a, b) {
      var x = col.sort(a), y = col.sort(b);
      var r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'pt-BR', { numeric: true });
      return st.dir === 'desc' ? -r : r;
    });
    return list;
  }

  function toolbar(key, cfg, st) {
    var filters = (cfg.filters || []).map(function (f) {
      var opts = f.options();
      return '<div class="field"><label for="flt-' + f.name + '">' + esc(f.label) + '</label>' +
        '<select class="select" id="flt-' + f.name + '" data-filter="' + f.name + '"><option value="">Todos</option>' +
        opts.map(function (o) { return '<option value="' + esc(o.value) + '"' + (st.filters[f.name] === String(o.value) ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('') +
        '</select></div>';
    }).join('');
    var sortOpts = cfg.columns.map(function (c) {
      return '<option value="' + c.key + ':asc"' + (st.sort === c.key && st.dir === 'asc' ? ' selected' : '') + '>' + esc(c.label) + ' (crescente)</option>' +
        '<option value="' + c.key + ':desc"' + (st.sort === c.key && st.dir === 'desc' ? ' selected' : '') + '>' + esc(c.label) + ' (decrescente)</option>';
    }).join('');
    return '<div class="toolbar" role="search" aria-label="Filtrar ' + esc(cfg.title.toLowerCase()) + '">' +
      '<div class="search-input">' + I('search') +
      '<label class="sr-only" for="crud-q">Buscar ' + esc(cfg.title.toLowerCase()) + '</label>' +
      '<input class="input" type="search" id="crud-q" placeholder="Buscar ' + esc(cfg.title.toLowerCase()) + '…" value="' + esc(st.q) + '" autocomplete="off"></div>' +
      filters +
      '<div class="field"><label for="crud-sort">Ordenar por</label><select class="select" id="crud-sort">' + sortOpts + '</select></div>' +
      '</div>';
  }

  function tableHtml(cfg, st, list, highlightId) {
    var head = cfg.columns.map(function (c) {
      var active = st.sort === c.key;
      var ariaSort = active ? ' aria-sort="' + (st.dir === 'asc' ? 'ascending' : 'descending') + '"' : '';
      var icon = active ? (st.dir === 'asc' ? 'sortAsc' : 'sortDesc') : 'sort';
      return '<th scope="col"' + ariaSort + '><button type="button" class="th-sort" data-sort="' + c.key + '">' + esc(c.label) + I(icon) +
        '<span class="sr-only">' + (active ? (st.dir === 'asc' ? ', ordem crescente' : ', ordem decrescente') : ', ordenar') + '</span></button></th>';
    }).join('') + '<th scope="col"><span class="sr-only">Ações</span></th>';

    var body = list.map(function (r) {
      var name = nameOf(cfg, r);
      return '<tr data-id="' + esc(r.id) + '"' + (r.id === highlightId ? ' class="row-new"' : '') + '>' +
        cfg.columns.map(function (c) {
          return '<td' + (c.primary ? ' class="cell-primary"' : ' data-label="' + esc(c.label) + '"') + '>' + c.render(r) + '</td>';
        }).join('') +
        '<td class="row-actions">' +
        '<button type="button" class="icon-btn" data-edit="' + esc(r.id) + '" aria-label="Editar ' + esc(cfg.singular + ' ' + name) + '" title="Editar">' + I('edit') + '</button>' +
        '<button type="button" class="icon-btn danger" data-delete="' + esc(r.id) + '" aria-label="Excluir ' + esc(cfg.singular + ' ' + name) + '" title="Excluir">' + I('trash') + '</button>' +
        '</td></tr>';
    }).join('');

    return '<div class="table-wrap"><table class="data-table"><caption class="sr-only">Lista de ' + esc(cfg.title.toLowerCase()) +
      ' — ' + U.plural(list.length, 'registro', 'registros') + '</caption><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  }

  TC.crud = {
    render: function (root, key, query) {
      var cfg = TC.entities[key];
      var w = words(cfg);
      var st = getState(key, cfg);
      var highlightId = null;

      // Deep-link support: ?q=, filters (?curso=…), ?new=1, ?edit=id
      if (query.q != null) st.q = query.q;
      var hasFilterQuery = (cfg.filters || []).some(function (f) { return query[f.name]; });
      if (hasFilterQuery) {
        st.filters = {};
        st.q = query.q || '';
        (cfg.filters || []).forEach(function (f) { if (query[f.name]) st.filters[f.name] = query[f.name]; });
      }

      root.innerHTML = TC.ui.pageHead({
        eyebrow: 'Cadastros', eyebrowIcon: cfg.icon, title: cfg.title, lead: esc(cfg.lead),
        actions: '<button type="button" class="btn btn-primary" data-new>' + I('plus') + esc(w.novo) + '</button>'
      }) +
        '<section class="card list-card" aria-labelledby="list-title">' +
        '<h2 class="sr-only" id="list-title">Lista de ' + esc(cfg.title.toLowerCase()) + '</h2>' +
        toolbar(key, cfg, st) +
        '<div class="list-meta"><p id="crud-count" aria-live="polite"></p><span id="crud-clear"></span></div>' +
        '<div id="crud-list"></div></section>';

      var listEl = root.querySelector('#crud-list');
      var countEl = root.querySelector('#crud-count');
      var clearEl = root.querySelector('#crud-clear');

      function paint() {
        var list = rows(cfg, st);
        var total = TC.store.count(cfg.collection);
        var filtered = st.q || Object.keys(st.filters).some(function (k) { return st.filters[k]; });
        countEl.textContent = filtered
          ? U.plural(list.length, 'resultado', 'resultados') + ' de ' + total
          : U.plural(total, cfg.singular + ' ' + w.cadastrado, (cfg.singular === 'matéria' ? 'matérias' : cfg.title.toLowerCase()) + ' ' + w.cadastrado + 's');
        clearEl.innerHTML = filtered ? '<button type="button" class="linkish" data-clear>Limpar filtros</button>' : '';

        if (!total) {
          listEl.innerHTML = TC.ui.emptyState({
            illus: 'folder', title: w.nenhum + ' ' + w.cadastrado + ' ainda',
            text: 'Comece cadastrando ' + (cfg.gender === 'f' ? 'a primeira ' : 'o primeiro ') + cfg.singular + '. Leva menos de um minuto.',
            action: '<button type="button" class="btn btn-primary" data-new>' + I('plus') + esc(w.novo) + '</button>'
          });
        } else if (!list.length) {
          listEl.innerHTML = TC.ui.emptyState({
            illus: 'search', title: 'Nenhum resultado encontrado',
            text: st.q ? 'Não encontramos ' + cfg.title.toLowerCase() + ' para “' + st.q + '”. Tente outro termo ou limpe os filtros.' : 'Nenhum registro corresponde aos filtros escolhidos.',
            action: '<button type="button" class="btn" data-clear>' + I('x') + 'Limpar filtros</button>'
          });
        } else {
          listEl.innerHTML = tableHtml(cfg, st, list, highlightId);
          if (highlightId) {
            var row = listEl.querySelector('tr[data-id="' + highlightId + '"]');
            if (row) row.scrollIntoView({ block: 'center', behavior: U.reducedMotion() ? 'auto' : 'smooth' });
          }
        }
        highlightId = null;
      }

      function openForm(rec) {
        var editing = !!rec;
        var prefix = 'frm';
        var dlg = TC.ui.open({
          variant: 'side',
          wrapForm: true,
          title: editing ? 'Editar ' + cfg.singular : w.novo,
          subtitle: editing ? nameOf(cfg, rec) : 'Preencha os dados e clique em “Salvar”.',
          headIcon: editing ? 'edit' : cfg.icon,
          body: TC.form.render(prefix, cfg.fields, rec || {}),
          footer: '<button type="button" class="btn" data-close>Cancelar</button>' +
            '<button type="submit" class="btn btn-primary">' + I('check') + (editing ? 'Salvar alterações' : 'Salvar ' + cfg.singular) + '</button>',
          initialFocus: 'input, select, textarea'
        });
        var form = dlg.dialog;
        TC.form.bind(form, prefix, cfg.fields, function (values) {
          var extra = [];
          (cfg.uniques || []).forEach(function (u) {
            var msg = u.check(values[u.field], values, editing ? rec.id : null);
            if (msg) {
              var f = cfg.fields.filter(function (x) { return x.name === u.field; })[0];
              extra.push({ name: u.field, label: f.label, message: msg });
            }
          });
          if (extra.length) return extra;
          if (cfg.beforeSave) values = cfg.beforeSave(values, rec);
          var saved;
          if (editing) {
            saved = TC.store.update(cfg.collection, rec.id, values);
            TC.toast.success(cap(cfg.singular) + ' ' + w.atualizado, '“' + nameOf(cfg, saved) + '” foi ' + w.atualizado + ' com sucesso.');
          } else {
            saved = TC.store.insert(cfg.collection, values);
            TC.toast.success(cap(cfg.singular) + ' ' + w.cadastrado, '“' + nameOf(cfg, saved) + '” já aparece na lista.');
            // Make sure the new record is visible in the list
            st.q = ''; st.filters = {};
            root.querySelector('#crud-q').value = '';
            Array.prototype.forEach.call(root.querySelectorAll('[data-filter]'), function (s) { s.value = ''; });
          }
          highlightId = saved.id;
          dlg.close();
          paint();
          // Return keyboard focus to the saved row (the opener may no longer exist)
          setTimeout(function () {
            var btn = listEl.querySelector('[data-edit="' + saved.id + '"]');
            if (btn) btn.focus({ preventScroll: true });
          }, 240);
          return [];
        });
      }

      function remove(rec) {
        var guard = cfg.deleteGuard(rec);
        var name = nameOf(cfg, rec);
        if (guard) {
          TC.ui.alert({
            title: 'Não é possível excluir ' + w.art + ' ' + cfg.singular,
            message: '<p><strong>' + esc(name) + '</strong></p><p style="margin-top:8px">' + esc(guard.message) + '</p>',
            linkText: guard.linkText, linkHref: guard.linkHref, linkIcon: guard.linkIcon
          });
          return;
        }
        TC.ui.confirm({
          title: 'Excluir ' + cfg.singular + '?',
          message: '<strong>' + esc(name) + '</strong> será ' + w.excluido + ' permanentemente.' +
            (cfg.deleteMessage ? ' ' + esc(cfg.deleteMessage) : '') + ' Esta ação não pode ser desfeita.',
          okText: 'Excluir', okIcon: 'trash'
        }).then(function (ok) {
          if (!ok) return;
          TC.store.remove(cfg.collection, rec.id);
          TC.toast.success(cap(cfg.singular) + ' ' + w.excluido, '“' + name + '” foi removid' + w.art + ' da lista.');
          paint();
          var h = root.querySelector('[data-page-title]');
          if (h) h.focus();
        });
      }

      root.querySelector('#crud-q').addEventListener('input', U.debounce(function (e) { st.q = e.target.value; paint(); }, 120));
      root.querySelector('#crud-sort').addEventListener('change', function (e) {
        var p = e.target.value.split(':'); st.sort = p[0]; st.dir = p[1]; paint();
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-filter]'), function (sel) {
        sel.addEventListener('change', function () { st.filters[sel.getAttribute('data-filter')] = sel.value; paint(); });
      });

      root.addEventListener('click', function (e) {
        var t = e.target.closest('[data-new], [data-edit], [data-delete], [data-sort], [data-clear]');
        if (!t) {
          // Mouse convenience: clicking anywhere on a row opens it (keyboard users have the Edit button)
          var row = e.target.closest('tbody tr[data-id]');
          if (row && !e.target.closest('a, button') && !String(window.getSelection())) {
            openForm(TC.store.get(cfg.collection, row.getAttribute('data-id')));
          }
          return;
        }
        if (t.hasAttribute('data-new')) openForm(null);
        else if (t.hasAttribute('data-edit')) openForm(TC.store.get(cfg.collection, t.getAttribute('data-edit')));
        else if (t.hasAttribute('data-delete')) remove(TC.store.get(cfg.collection, t.getAttribute('data-delete')));
        else if (t.hasAttribute('data-clear')) {
          st.q = ''; st.filters = {};
          root.querySelector('#crud-q').value = '';
          Array.prototype.forEach.call(root.querySelectorAll('[data-filter]'), function (s) { s.value = ''; });
          paint();
          root.querySelector('#crud-q').focus();
        } else if (t.hasAttribute('data-sort')) {
          var k = t.getAttribute('data-sort');
          if (st.sort === k) st.dir = st.dir === 'asc' ? 'desc' : 'asc'; else { st.sort = k; st.dir = 'asc'; }
          root.querySelector('#crud-sort').value = st.sort + ':' + st.dir;
          paint();
          var again = root.querySelector('[data-sort="' + k + '"]');
          if (again) again.focus();
        }
      });

      paint();

      if (query.new || query.edit) {
        TC.router.clean('/' + key);
        var rec = query.edit ? TC.store.get(cfg.collection, query.edit) : null;
        setTimeout(function () { openForm(rec); }, 60);
      }
    }
  };
})(window.TC);
