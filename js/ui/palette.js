/* Global search / command palette (Ctrl+K). ARIA combobox + listbox pattern. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var U = TC.util;
  var esc = U.esc;
  var I = TC.icon;
  var isOpen = false;

  function baseItems() {
    var items = [
      { group: 'Páginas', icon: 'dashboard', title: 'Painel', sub: 'Resumo da sua semana', href: '#/painel' },
      { group: 'Páginas', icon: 'bookOpen', title: 'Plano de Aula', sub: 'Plano por curso e matéria', href: '#/plano' },
      { group: 'Páginas', icon: 'calendar', title: 'Agenda Semanal', sub: 'Aulas previstas na semana', href: '#/agenda' }
    ];
    TC.app.CADASTROS.forEach(function (k) {
      var c = TC.entities[k];
      items.push({ group: 'Páginas', icon: c.icon, title: c.title, sub: 'Lista de ' + c.title.toLowerCase(), href: '#/' + k });
    });
    TC.app.CADASTROS.forEach(function (k) {
      var c = TC.entities[k];
      var novo = c.gender === 'f' ? 'Nova ' : 'Novo ';
      items.push({ group: 'Ações', icon: 'plus', title: novo + c.singular, sub: 'Abrir formulário de cadastro', href: '#/' + k + '?new=1', keywords: 'cadastrar criar adicionar' });
    });
    items.push({ group: 'Ações', icon: 'moon', title: 'Alternar tema claro/escuro', sub: 'Mudar a aparência', run: function () { TC.app.toggleTheme(); }, keywords: 'dark escuro claro' });
    items.push({ group: 'Ações', icon: 'refresh', title: 'Restaurar dados de demonstração', sub: 'Voltar ao estado inicial', run: function () { TC.app.restoreDemo(); }, keywords: 'reset' });
    return items;
  }

  function recordItems() {
    var D = TC.domain, S = TC.store, out = [];
    S.all('cursos').forEach(function (c) { out.push({ group: 'Cursos', icon: 'layers', title: c.nome, sub: c.codigo + ' · ' + U.plural(c.duracao, 'período', 'períodos'), href: '#/cursos?edit=' + c.id, keywords: c.codigo }); });
    S.all('materias').forEach(function (m) { var c = D.curso(m.cursoId); out.push({ group: 'Matérias', icon: 'book', title: m.nome, sub: (c ? c.codigo + ' · ' : '') + m.cargaHoraria + ' h', href: '#/materias?edit=' + m.id }); });
    S.all('turmas').forEach(function (t) { out.push({ group: 'Turmas', icon: 'users', title: t.nome, sub: t.turno + ' · ' + U.plural(D.alunosCount(t.id), 'aluno', 'alunos'), href: '#/turmas?edit=' + t.id }); });
    S.all('alunos').forEach(function (a) { var t = D.turma(a.turmaId); out.push({ group: 'Alunos', icon: 'user', title: a.nome, sub: 'Matrícula ' + a.matricula + (t ? ' · ' + t.nome : ''), href: '#/alunos?edit=' + a.id, keywords: a.matricula }); });
    S.all('professores').forEach(function (p) { out.push({ group: 'Professores', icon: 'idCard', title: p.nome, sub: p.area, href: '#/professores?edit=' + p.id, keywords: p.email }); });
    return out;
  }

  function search(q) {
    var nq = U.normalize(q);
    if (!nq) return baseItems().filter(function (i) { return i.group === 'Páginas' || i.title.indexOf('Novo curso') === 0 || i.title.indexOf('Nova matéria') === 0; }).slice(0, 9);
    var terms = nq.split(/\s+/);
    function score(i) {
      var hay = U.normalize(i.title + ' ' + (i.sub || '') + ' ' + (i.keywords || ''));
      if (!terms.every(function (t) { return hay.indexOf(t) >= 0; })) return -1;
      var t = U.normalize(i.title);
      return t.indexOf(nq) === 0 ? 3 : t.indexOf(nq) >= 0 ? 2 : 1;
    }
    var all = baseItems().concat(recordItems());
    return all.map(function (i) { return { i: i, s: score(i) }; })
      .filter(function (x) { return x.s >= 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 12)
      .map(function (x) { return x.i; });
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    var items = [];
    var active = 0;
    var dlg = TC.ui.open({
      variant: 'center',
      overlayClass: 'palette-overlay',
      className: 'palette',
      ariaLabel: 'Busca global',
      raw:
        '<div class="palette-search">' + I('search') +
        '<label class="sr-only" for="pal-input">Buscar páginas, ações e cadastros</label>' +
        '<input id="pal-input" type="text" role="combobox" aria-expanded="true" aria-controls="pal-list" aria-autocomplete="list" autocomplete="off" spellcheck="false" placeholder="Buscar cursos, matérias, alunos, ações…">' +
        '<button type="button" class="kbd" data-close aria-label="Fechar busca">Esc</button></div>' +
        '<div class="palette-list" id="pal-list" role="listbox" aria-label="Resultados"></div>' +
        '<p class="sr-only" id="pal-status" aria-live="polite"></p>' +
        '<div class="palette-foot" aria-hidden="true"><span><span class="kbd">↑</span> <span class="kbd">↓</span> navegar</span><span><span class="kbd">Enter</span> abrir</span><span><span class="kbd">Esc</span> fechar</span></div>',
      initialFocus: '#pal-input',
      onClose: function () { isOpen = false; }
    });

    var input = dlg.el.querySelector('#pal-input');
    var listEl = dlg.el.querySelector('#pal-list');
    var status = dlg.el.querySelector('#pal-status');

    function paint() {
      if (!items.length) {
        listEl.innerHTML = '<div class="palette-empty">Nenhum resultado para “' + esc(input.value) + '”.</div>';
        input.removeAttribute('aria-activedescendant');
        status.textContent = 'Nenhum resultado.';
        return;
      }
      var html = '', last = null;
      items.forEach(function (it, idx) {
        if (it.group !== last) {
          if (last !== null) html += '</div>';
          html += '<div role="group" aria-label="' + esc(it.group) + '"><div class="palette-group" aria-hidden="true">' + esc(it.group) + '</div>';
          last = it.group;
        }
        html += '<div class="palette-item" role="option" id="pal-opt-' + idx + '" data-idx="' + idx + '" aria-selected="' + (idx === active) + '">' +
          '<span class="pi-icon">' + I(it.icon) + '</span><span class="pi-text"><span class="pi-title">' + esc(it.title) + '</span>' +
          (it.sub ? '<span class="pi-sub">' + esc(it.sub) + '</span>' : '') + '</span>' +
          '<span class="pi-enter kbd" aria-hidden="true">Enter</span></div>';
      });
      listEl.innerHTML = html + '</div>';
      input.setAttribute('aria-activedescendant', 'pal-opt-' + active);
      status.textContent = U.plural(items.length, 'resultado', 'resultados') + '.';
    }

    function move(delta) {
      if (!items.length) return;
      active = (active + delta + items.length) % items.length;
      Array.prototype.forEach.call(listEl.querySelectorAll('[role="option"]'), function (el) {
        el.setAttribute('aria-selected', String(Number(el.getAttribute('data-idx')) === active));
      });
      input.setAttribute('aria-activedescendant', 'pal-opt-' + active);
      var el = listEl.querySelector('#pal-opt-' + active);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }

    function choose(idx) {
      var it = items[idx];
      if (!it) return;
      dlg.close();
      setTimeout(function () {
        if (it.run) it.run();
        else TC.router.go(it.href);
      }, 60);
    }

    function update() { items = search(input.value); active = 0; paint(); }

    input.addEventListener('input', update);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
    });
    listEl.addEventListener('click', function (e) {
      var opt = e.target.closest('[data-idx]');
      if (opt) choose(Number(opt.getAttribute('data-idx')));
    });
    listEl.addEventListener('mousemove', function (e) {
      var opt = e.target.closest('[data-idx]');
      if (opt && Number(opt.getAttribute('data-idx')) !== active) move(Number(opt.getAttribute('data-idx')) - active);
    });
    update();
  }

  TC.palette = { open: open };
})(window.TC);
