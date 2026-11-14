/* Painel (dashboard): greeting, next class, KPIs, today's classes, week chart,
   students per subject and shortcuts. */
window.TC = window.TC || {};
TC.pages = TC.pages || {};

(function (TC) {
  'use strict';

  var U = TC.util;
  var esc = U.esc;
  var I = TC.icon;

  function nextClass(profId) {
    var D = TC.domain;
    var now = U.now();
    var nowIso = U.toISO(now);
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var monday = U.startOfWeek(now);
    var list = D.aulasNaSemana(profId, monday).concat(D.aulasNaSemana(profId, U.addDays(monday, 7)));
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.iso > nowIso) return { aula: a, live: false };
      if (a.iso === nowIso && U.toMin(a.fim) > nowMin) return { aula: a, live: U.toMin(a.inicio) <= nowMin };
    }
    return null;
  }

  function whenLabel(a) {
    var today = U.toISO(U.now());
    var tomorrow = U.toISO(U.addDays(U.now(), 1));
    var day = a.iso === today ? 'Hoje' : a.iso === tomorrow ? 'Amanhã' : U.DIAS[a.dia] + ', ' + U.fmtDayMonth(a.date);
    return day + ' · ' + a.inicio + '–' + a.fim;
  }

  function hero(prof, D) {
    var p = D.periodoAtivo();
    var week = p ? D.semanaNoPeriodo(p, U.now()) : null;
    var aulas = D.aulasNaSemana(prof.id, U.startOfWeek(U.now()));
    var mins = aulas.reduce(function (s, a) { return s + a.minutos; }, 0);
    var nx = nextClass(prof.id);

    var periodTxt = p ? 'Período ' + esc(p.nome) + (week ? ' · semana ' + week + ' de ' + D.semanasDoPeriodo(p) : '') : '';
    var next = nx
      ? '<a class="hero-next hoverable" href="#/plano?aloc=' + esc(nx.aula.aloc.id) + '">' +
        '<span class="hn-label">' + (nx.live ? '<span class="live-dot" aria-hidden="true"></span>Acontecendo agora' : I('clock') + 'Próxima aula') + '</span>' +
        '<span class="hn-title">' + esc(nx.aula.materia.nome) + '</span>' +
        '<span class="hn-meta">' + TC.ui.courseChip(nx.aula.curso) + '<span>' + esc(nx.aula.turma.nome) + '</span></span>' +
        '<span class="hn-row">' + I('calendar') + esc(whenLabel(nx.aula)) + '</span>' +
        '<span class="hn-row">' + I('mapPin') + esc(nx.aula.sala) + '</span>' +
        '<span class="hn-cta">Abrir plano de aula ' + I('arrowRight') + '</span></a>'
      : '<div class="hero-next"><span class="hn-label">' + I('clock') + 'Próxima aula</span><span class="hn-title">Nenhuma aula prevista</span>' +
        '<span class="hn-row">Quando houver matérias atribuídas a você, a próxima aula aparecerá aqui.</span></div>';

    return '<section class="hero" aria-labelledby="hero-title">' +
      '<div class="hero-text">' +
      '<span class="hero-date">' + esc(U.fmtWeekday(U.now())) + '</span>' +
      '<h1 id="hero-title" tabindex="-1" data-page-title>' + U.greeting() + ', ' + esc(U.firstName(prof.nome)) + '</h1>' +
      '<p class="hero-sub">' + periodTxt + '</p>' +
      '<p class="hero-stat"><strong>' + U.plural(aulas.length, 'aula prevista', 'aulas previstas') + '</strong> nesta semana' +
      (mins ? ' · ' + U.fmtDuration(mins) + ' em sala' : '') + '</p>' +
      '<div class="hero-actions"><a class="btn btn-primary" href="#/agenda">' + I('calendar') + 'Ver agenda da semana</a>' +
      '<a class="btn btn-on-dark" href="#/plano">' + I('bookOpen') + 'Plano de aula</a></div>' +
      '</div>' + next + '</section>';
  }

  function kpis(prof, D, S) {
    var r = D.resumoProfessor(prof.id);
    var items = [
      { href: '#/cursos', icon: 'layers', label: 'Cursos', value: r.cursos, sub: 'de ' + S.count('cursos') + ' cadastrados', tone: 'k-blue' },
      { href: '#/materias', icon: 'book', label: 'Matérias', value: r.materias, sub: 'de ' + S.count('materias') + ' cadastradas', tone: 'k-orange' },
      { href: '#/turmas', icon: 'users', label: 'Turmas', value: r.turmas, sub: 'de ' + S.count('turmas') + ' cadastradas', tone: 'k-green' },
      { href: '#/alunos', icon: 'user', label: 'Alunos', value: r.alunos, sub: 'de ' + S.count('alunos') + ' cadastrados', tone: 'k-navy' }
    ];
    return '<section class="kpis" aria-label="Resumo das suas aulas">' + items.map(function (k) {
      return '<a class="kpi card hoverable ' + k.tone + '" href="' + k.href + '">' +
        '<span class="kpi-icon">' + I(k.icon) + '</span>' +
        '<span class="kpi-label">' + k.label + ' <span class="sr-only">em que você leciona</span></span>' +
        '<span class="kpi-value">' + TC.ui.counter(k.value) + '</span>' +
        '<span class="kpi-sub">' + esc(k.sub) + '</span></a>';
    }).join('') + '</section>';
  }

  function todayCard(prof, D) {
    var now = U.now();
    var iso = U.toISO(now);
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var list = D.aulasNaSemana(prof.id, U.startOfWeek(now)).filter(function (a) { return a.iso === iso; });
    var body = list.length
      ? '<ol class="today-list">' + list.map(function (a) {
          var state = U.toMin(a.fim) <= nowMin ? 'done' : U.toMin(a.inicio) <= nowMin ? 'live' : 'next';
          var badge = state === 'done' ? '<span class="badge badge-outline">' + I('check') + 'Concluída</span>'
            : state === 'live' ? '<span class="badge badge-success">' + I('circleDot') + 'Agora</span>'
            : '<span class="badge badge-info">' + I('clock') + 'A seguir</span>';
          return '<li class="today-item is-' + state + '">' +
            '<span class="ti-time"><strong>' + a.inicio + '</strong><span>' + a.fim + '</span></span>' +
            '<span class="ti-bar cs ' + TC.domain.cursoStyle(a.curso.id) + '"><span class="pattern-fill"></span></span>' +
            '<a class="ti-body" href="#/plano?aloc=' + esc(a.aloc.id) + '"><span class="ti-title">' + esc(a.materia.nome) + '</span>' +
            '<span class="ti-meta">' + esc(a.turma.nome) + ' · ' + esc(a.sala) + '</span></a>' + badge + '</li>';
        }).join('') + '</ol>'
      : TC.ui.emptyState({ illus: 'calendar', small: true, level: 'h3', title: 'Nenhuma aula hoje', text: 'Aproveite para revisar seu plano de aula ou organizar seus cadastros.' });
    return '<section class="card dash-today" aria-labelledby="today-title">' +
      '<div class="card-head"><h2 id="today-title"><span class="h-icon">' + I('clock') + '</span>Aulas de hoje</h2>' +
      '<span class="card-sub">' + esc(U.DIAS[now.getDay()]) + ', ' + U.fmtDayMonth(now) + '</span></div>' +
      '<div class="card-body">' + body + '</div></section>';
  }

  function weekCard(prof, D) {
    var monday = U.startOfWeek(U.now());
    var aulas = D.aulasNaSemana(prof.id, monday);
    var todayIso = U.toISO(U.now());
    var days = [1, 2, 3, 4, 5, 6].map(function (d) {
      var list = aulas.filter(function (a) { return a.dia === d; });
      return { dia: d, n: list.length, mins: list.reduce(function (s, a) { return s + a.minutos; }, 0), today: U.toISO(U.addDays(monday, d - 1)) === todayIso };
    });
    var max = Math.max.apply(null, days.map(function (x) { return x.n; }).concat([1]));
    var mins = aulas.reduce(function (s, a) { return s + a.minutos; }, 0);
    return '<section class="card dash-week" aria-labelledby="week-title">' +
      '<div class="card-head"><h2 id="week-title"><span class="h-icon">' + I('calendar') + '</span>Aulas desta semana</h2>' +
      '<a class="card-link" href="#/agenda">Agenda ' + I('arrowRight') + '</a></div>' +
      '<div class="card-body">' +
      '<p class="week-total"><strong class="tabular">' + TC.ui.counter(aulas.length) + '</strong> <span>' + (aulas.length === 1 ? 'aula prevista' : 'aulas previstas') + '<br><span class="muted">' + U.fmtDuration(mins) + ' · ' + esc(U.fmtRange(monday, U.addDays(monday, 5))) + '</span></span></p>' +
      '<ol class="week-bars" aria-label="Aulas por dia da semana">' + days.map(function (x) {
        return '<li class="' + (x.today ? 'is-today' : '') + (x.n ? '' : ' is-zero') + '">' +
          '<span class="wb-value">' + x.n + '</span>' +
          '<span class="wb-track" aria-hidden="true"><span class="wb-bar" style="--h:' + Math.round((x.n / max) * 100) + '%"></span></span>' +
          '<span class="wb-day">' + U.DIAS_CURTOS[x.dia] + (x.today ? '<span class="wb-today">hoje</span>' : '') + '</span>' +
          '<span class="sr-only">: ' + U.plural(x.n, 'aula', 'aulas') + (x.today ? ' (hoje)' : '') + '</span></li>';
      }).join('') + '</ol></div></section>';
  }

  function studentsCard(prof, D) {
    var rows = D.alunosPorMateria(prof.id);
    var max = Math.max.apply(null, rows.map(function (r) { return r.alunos; }).concat([1]));
    var cursos = [];
    rows.forEach(function (r) { if (r.curso && cursos.indexOf(r.curso) < 0) cursos.push(r.curso); });
    var body = rows.length
      ? '<ul class="hbars">' + rows.map(function (r) {
          return '<li><span class="hb-label"><span class="hb-name">' + esc(r.materia.nome) + '</span>' +
            '<span class="hb-sub">' + TC.ui.courseChip(r.curso) + '<span>' + esc(r.turmas.join(', ')) + '</span></span></span>' +
            '<span class="hb-track" aria-hidden="true"><span class="hb-fill pattern-fill cs ' + TC.domain.cursoStyle(r.curso.id) + '" style="--w:' + Math.max(4, Math.round(r.alunos / max * 100)) + '%"></span></span>' +
            '<span class="hb-value"><strong>' + r.alunos + '</strong> ' + (r.alunos === 1 ? 'aluno' : 'alunos') + '</span></li>';
        }).join('') + '</ul>' +
        '<div class="legend" aria-label="Legenda dos cursos">' + cursos.map(function (c) {
          return '<span class="legend-item cs ' + TC.domain.cursoStyle(c.id) + '"><span class="swatch" aria-hidden="true"></span>' + esc(c.codigo) + ' — ' + esc(c.nome) + '</span>';
        }).join('') + '</div>'
      : TC.ui.emptyState({ illus: 'folder', small: true, level: 'h3', title: 'Nenhuma matéria atribuída ainda',
        text: 'Quando a coordenação atribuir matérias e turmas a você, a quantidade de alunos de cada matéria aparecerá aqui.' });
    return '<section class="card dash-students" aria-labelledby="stu-title">' +
      '<div class="card-head"><h2 id="stu-title"><span class="h-icon">' + I('users') + '</span>Alunos por matéria</h2>' +
      '<span class="card-sub">Soma dos alunos das turmas</span></div>' +
      '<div class="card-body">' + body + '</div></section>';
  }

  function shortcuts() {
    var items = [
      ['/cursos', 'layers', 'Novo curso'], ['/materias', 'book', 'Nova matéria'], ['/turmas', 'users', 'Nova turma'],
      ['/alunos', 'user', 'Novo aluno'], ['/professores', 'idCard', 'Novo professor'], ['/periodos', 'calendarRange', 'Novo período']
    ];
    return '<section class="card dash-shortcuts" aria-labelledby="sc-title">' +
      '<div class="card-head"><h2 id="sc-title"><span class="h-icon">' + I('plus') + '</span>Atalhos</h2>' +
      '<span class="card-sub"><span class="kbd">Ctrl K</span> para buscar</span></div>' +
      '<div class="card-body"><ul class="shortcut-grid">' + items.map(function (s) {
        return '<li><a class="shortcut hoverable" href="#' + s[0] + '?new=1"><span class="sc-icon">' + I(s[1]) + '</span>' +
          '<span>' + s[2] + '</span>' + I('plus', { cls: 'sc-plus' }) + '</a></li>';
      }).join('') + '</ul></div></section>';
  }

  TC.pages.painel = function (root) {
    var D = TC.domain, S = TC.store;
    var prof = TC.app.currentProf();
    root.innerHTML = hero(prof, D) + kpis(prof, D, S) +
      '<div class="dash-grid">' + todayCard(prof, D) + weekCard(prof, D) + studentsCard(prof, D) + shortcuts() + '</div>';
  };
})(window.TC);
