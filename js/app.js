/* App bootstrap: shell (sidebar, topbar, bottom nav), session and routing. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var U = TC.util;
  var I = TC.icon;
  var esc = U.esc;
  var D, S;

  var MAIN_NAV = [
    { path: '/painel', label: 'Painel', icon: 'dashboard' },
    { path: '/plano', label: 'Plano de Aula', icon: 'bookOpen' },
    { path: '/agenda', label: 'Agenda Semanal', icon: 'calendar' }
  ];
  var CADASTROS = ['cursos', 'materias', 'turmas', 'periodos', 'alunos', 'professores'];

  var firstRender = true;
  var shellProfId = null;

  function currentProf() {
    var id = S.session.get();
    return id ? D.professor(id) : null;
  }

  /* ---------- Actions shared by sidebar, sheet and palette ---------- */
  function restoreDemo() {
    TC.ui.confirm({
      title: 'Restaurar dados de demonstração?',
      message: 'Todos os cadastros voltarão ao estado original do protótipo. As alterações feitas até agora serão perdidas.',
      okText: 'Restaurar dados', okIcon: 'refresh', icon: 'refresh', tone: 'warn', danger: false
    }).then(function (ok) {
      if (!ok) return;
      S.reset();
      if (!currentProf()) S.session.clear();
      shellProfId = null;
      TC.toast.success('Dados restaurados', 'Os dados de demonstração foram recarregados.');
      render(TC.router.parse());
    });
  }

  function logout() {
    var p = currentProf();
    S.session.clear();
    shellProfId = null;
    if (p) TC.toast.info('Você saiu', 'Até logo, ' + U.firstName(p.nome) + '!');
    TC.router.go('#/login');
  }

  function openMore() {
    var path = TC.router.parse().path;
    var link = function (href, icon, label) {
      return '<li><a class="sheet-link" href="#' + href + '" data-close' + (path === href ? ' aria-current="page"' : '') + '>' +
        '<span class="sl-icon">' + I(icon) + '</span>' + esc(label) + '</a></li>';
    };
    var btn = function (act, icon, label) {
      return '<li><button type="button" class="sheet-link" data-act="' + act + '"><span class="sl-icon">' + I(icon) + '</span>' + esc(label) + '</button></li>';
    };
    var body = '<p class="sheet-title">Cadastros</p><ul class="sheet-list sheet-grid">' +
      CADASTROS.map(function (k) { var c = TC.entities[k]; return link('/' + k, c.icon, c.title); }).join('') + '</ul>' +
      '<div class="sheet-sep" role="separator"></div><ul class="sheet-list">' +
      btn('search', 'search', 'Buscar') +
      btn('restore', 'refresh', 'Restaurar dados de demonstração') +
      btn('logout', 'logout', 'Sair') + '</ul>';
    var sheet = TC.ui.open({ variant: 'sheet', title: 'Mais opções', body: body });
    sheet.el.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      sheet.close();
      setTimeout(function () {
        if (act === 'restore') restoreDemo();
        if (act === 'logout') logout();
        if (act === 'search') TC.palette.open();
      }, 200);
    });
  }

  /* ---------- Shell ---------- */
  function navLink(href, icon, label, count) {
    return '<li><a class="nav-link" href="#' + href + '" data-nav="' + href + '" title="' + esc(label) + '">' + I(icon) +
      '<span class="nav-label">' + esc(label) + '</span>' +
      (count != null ? '<span class="nav-count" data-count="' + href.slice(1) + '" aria-hidden="true">' + count + '</span>' : '') + '</a></li>';
  }

  function periodCard() {
    var p = D.periodoAtivo();
    if (!p) return '';
    var n = D.semanaNoPeriodo(p, U.now());
    var total = D.semanasDoPeriodo(p);
    var pct = Math.round(D.progressoPeriodo(p) * 100);
    return '<div class="sidebar-card"><strong>Período ' + esc(p.nome) + '</strong>' +
      (n ? 'Semana ' + n + ' de ' + total : D.periodoStatus(p) === 'encerrado' ? 'Período encerrado' : 'Ainda não iniciado') +
      '<div class="progress" role="progressbar" aria-label="Andamento do período ' + esc(p.nome) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-valuetext="' + pct + '% concluído"><span style="width:' + pct + '%"></span></div></div>';
  }

  function buildShell(prof) {
    var app = document.getElementById('app');
    var p = D.periodoAtivo();
    app.innerHTML =
      '<div class="shell">' +
      '<aside class="sidebar" aria-label="Menu lateral">' +
      '<a class="brand" href="#/painel" aria-label="Teacher Class — ir para o painel"><span class="brand-mark">' + TC.ui.logoMark() + '</span>' +
      '<span class="brand-text"><span class="brand-name">Teacher Class</span><span class="brand-tag">Aprender <b aria-hidden="true">·</b> Ensinar <b aria-hidden="true">·</b> Organizar</span></span></a>' +
      '<nav aria-label="Navegação principal">' +
      '<ul class="nav-list">' + MAIN_NAV.map(function (n) { return navLink(n.path, n.icon, n.label); }).join('') + '</ul>' +
      '<p class="nav-group-label" id="nav-cad-label">Cadastros</p>' +
      '<ul class="nav-list" aria-labelledby="nav-cad-label">' + CADASTROS.map(function (k) {
        var c = TC.entities[k]; return navLink('/' + k, c.icon, c.title, S.count(c.collection));
      }).join('') + '</ul></nav>' +
      '<div class="sidebar-foot">' + periodCard() +
      '<button type="button" class="sidebar-btn" data-act="restore" title="Restaurar dados de demonstração">' + I('refresh') + '<span class="nav-label">Restaurar dados de demonstração</span></button>' +
      '<button type="button" class="sidebar-btn sidebar-logout" data-act="logout" title="Sair">' + I('logout') + '<span class="nav-label">Sair</span></button>' +
      '</div></aside>' +
      '<div class="main-col">' +
      '<header class="topbar">' +
      '<a class="topbar-brand" href="#/painel" aria-label="Teacher Class — ir para o painel">' + TC.ui.logoMark() + '<span>Teacher Class</span></a>' +
      '<button type="button" class="search-trigger" data-act="search" aria-label="Buscar (atalho Ctrl + K)" aria-keyshortcuts="Control+K">' + I('search') +
      '<span class="search-label">Buscar cursos, matérias, alunos…</span><span class="kbd" aria-hidden="true">Ctrl K</span></button>' +
      '<span class="topbar-spacer"></span>' +
      (p ? '<span class="period-chip">' + I('calendarRange') + 'Período <strong>' + esc(p.nome) + '</strong></span>' : '') +
      '<div class="user-chip">' + TC.ui.avatar(prof.nome, 'sm') + '<span class="user-meta"><span class="user-name">' + esc(prof.nome) + '</span>' +
      '<span class="user-role">' + esc(prof.area) + '</span></span></div>' +
      '</header>' +
      '<main id="main" tabindex="-1"></main>' +
      '</div>' +
      '<nav class="bottom-nav" aria-label="Navegação inferior"><ul>' +
      bnLink('/painel', 'dashboard', 'Painel') + bnLink('/plano', 'bookOpen', 'Plano') + bnLink('/agenda', 'calendar', 'Agenda') +
      bnLink('/cursos', 'layers', 'Cadastros') +
      '<li><button type="button" class="bn-link" data-act="more" aria-haspopup="dialog"><span class="bn-icon">' + I('more') + '</span>Mais</button></li>' +
      '</ul></nav>' +
      '</div>';

    shellProfId = prof.id;

    app.querySelector('.shell').addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]');
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'restore') restoreDemo();
      else if (act === 'logout') logout();
      else if (act === 'search') TC.palette.open();
      else if (act === 'more') openMore();
    });
  }

  function onScroll() {
    var topbar = document.querySelector('.topbar');
    if (topbar) topbar.classList.toggle('is-scrolled', window.scrollY > 4);
  }

  function bnLink(href, icon, label) {
    return '<li><a class="bn-link" href="#' + href + '" data-nav="' + href + '"><span class="bn-icon">' + I(icon) + '</span>' + esc(label) + '</a></li>';
  }

  function updateNav(path) {
    var isCad = CADASTROS.indexOf(path.slice(1)) >= 0;
    Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (a) {
      var target = a.getAttribute('data-nav');
      var active = target === path || (a.classList.contains('bn-link') && target === '/cursos' && isCad);
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function updateCounts() {
    CADASTROS.forEach(function (k) {
      var el = document.querySelector('[data-count="' + k + '"]');
      if (el) el.textContent = S.count(TC.entities[k].collection);
    });
  }

  /* ---------- Routing ---------- */
  function pageFor(path) {
    if (path === '/painel') return { title: 'Painel', render: TC.pages.painel };
    if (path === '/plano') return { title: 'Plano de Aula', render: TC.pages.plano };
    if (path === '/agenda') return { title: 'Agenda Semanal', render: TC.pages.agenda };
    var key = path.slice(1);
    if (CADASTROS.indexOf(key) >= 0) {
      return { title: TC.entities[key].title, render: function (root, q) { TC.crud.render(root, key, q); } };
    }
    return { title: 'Página não encontrada', render: notFound };
  }

  function notFound(root) {
    root.innerHTML = TC.ui.pageHead({ title: 'Página não encontrada' }) +
      '<section class="card">' + TC.ui.emptyState({
        illus: 'search', title: 'Não encontramos esta página',
        text: 'O endereço pode estar incorreto. Volte ao painel para continuar.',
        action: '<a class="btn btn-primary" href="#/painel">' + I('dashboard') + 'Ir para o painel</a>'
      }) + '</section>';
  }

  function render(route) {
    var prof = currentProf();
    if (route.path === '/login') {
      shellProfId = null;
      document.title = 'Entrar · Teacher Class';
      TC.pages.login(document.getElementById('app'));
      firstRender = false;
      return;
    }
    if (!prof) {
      if (S.session.get()) S.session.clear();
      location.replace('#/login'); // fires hashchange → login
      return;
    }
    if (shellProfId !== prof.id || !document.getElementById('main')) buildShell(prof);

    var page = pageFor(route.path);
    var main = document.getElementById('main');
    var view = document.createElement('div');
    view.className = 'view';
    main.replaceChildren(view);
    page.render(view, route.query || {});
    TC.ui.countUp(view);
    updateNav(route.path);
    document.title = page.title + ' · Teacher Class';
    if (!firstRender) {
      window.scrollTo(0, 0);
      var h1 = view.querySelector('[data-page-title]');
      if (h1) h1.focus({ preventScroll: true });
    }
    firstRender = false;
  }

  /* ---------- Boot ---------- */
  function boot() {
    D = TC.domain; S = TC.store;
    S.init();
    S.onChange(updateCounts);
    window.addEventListener('scroll', onScroll, { passive: true });

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        if (!currentProf() || TC.router.parse().path === '/login') return;
        e.preventDefault();
        TC.palette.open();
      }
    });

    var skip = document.querySelector('.skip-link');
    skip.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.getElementById('main');
      if (target) { target.setAttribute('tabindex', '-1'); target.focus(); }
    });

    TC.router.start(render);
  }

  TC.app = {
    currentProf: currentProf, restoreDemo: restoreDemo, logout: logout,
    refresh: function () { render(TC.router.parse()); },
    login: function (profId) {
      S.session.set(profId);
      shellProfId = null;
      TC.router.go('#/painel');
    },
    CADASTROS: CADASTROS, MAIN_NAV: MAIN_NAV
  };

  TC.pages = TC.pages || {};
  document.addEventListener('DOMContentLoaded', boot);
})(window.TC);
