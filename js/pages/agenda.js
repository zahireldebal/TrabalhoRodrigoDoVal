/* Agenda Semanal (HU02): Monday–Saturday grid (desktop) or list by day (mobile),
   with "X aulas previstas esta semana / Y horas". */
window.TC = window.TC || {};
TC.pages = TC.pages || {};

(function (TC) {
  'use strict';

  var U = TC.util;
  var esc = U.esc;
  var I = TC.icon;
  var HOUR_PX = 66;
  var weekOffset = 0;

  /** Default week: the current week, clamped into the active academic period. */
  function baseMonday() {
    var D = TC.domain;
    var monday = U.startOfWeek(U.now());
    var p = D.periodoAtivo();
    if (!p) return monday;
    var first = U.startOfWeek(p.inicio), last = U.startOfWeek(p.fim);
    if (monday < first) return first;
    if (monday > last) return last;
    return monday;
  }

  function hourRange(profId) {
    var D = TC.domain;
    var min = 24 * 60, max = 0;
    D.alocacoesDoProfessor(profId).forEach(function (a) {
      (a.horarios || []).forEach(function (h) {
        min = Math.min(min, U.toMin(h.inicio));
        max = Math.max(max, U.toMin(h.fim));
      });
    });
    if (max === 0) return { start: 8, end: 18 };
    return { start: Math.max(0, Math.floor(min / 60)), end: Math.min(24, Math.ceil(max / 60)) };
  }

  function eventHtml(a, compact) {
    return '<a class="ev cs ' + TC.domain.cursoStyle(a.curso.id) + '" href="#/plano?aloc=' + esc(a.aloc.id) + '"' +
      (compact ? '' : ' style="top:' + a.top + 'px;height:' + a.height + 'px"') + '>' +
      '<span class="ev-stripe pattern-fill" aria-hidden="true"></span>' +
      '<span class="ev-body">' +
      '<span class="ev-time">' + I('clock') + a.inicio + '–' + a.fim + '<span class="ev-code">' + esc(a.curso.codigo) + '</span></span>' +
      '<span class="ev-title">' + esc(a.materia.nome) + '</span>' +
      '<span class="ev-meta">' + esc(a.turma.nome) + ' · ' + esc(a.sala) + '</span>' +
      '</span><span class="sr-only">. Abrir plano de aula</span></a>';
  }

  TC.pages.agenda = function (root, query) {
    var D = TC.domain;
    var prof = TC.app.currentProf();
    if (query.reset) weekOffset = 0;
    var view = TC.store.pref.get('agenda-view', 'grade');

    function paint(focusSel) {
      var monday = U.addDays(baseMonday(), weekOffset * 7);
      var saturday = U.addDays(monday, 5);
      var aulas = D.aulasNaSemana(prof.id, monday);
      var mins = aulas.reduce(function (s, a) { return s + a.minutos; }, 0);
      var turmas = {};
      aulas.forEach(function (a) { turmas[a.turma.id] = 1; });
      var todayIso = U.toISO(U.now());
      var isThisWeek = U.toISO(U.startOfWeek(U.now())) === U.toISO(monday);
      var p = D.periodoAtivo();
      var weekN = p ? D.semanaNoPeriodo(p, monday) || D.semanaNoPeriodo(p, saturday) : null;
      var anyAloc = D.alocacoesDoProfessor(prof.id).length > 0;

      var head = TC.ui.pageHead({
        eyebrow: 'Planejamento', eyebrowIcon: 'calendar', title: 'Agenda Semanal',
        lead: 'Suas aulas de segunda a sábado, com matéria, turma, horário e sala.'
      });

      var nav = '<div class="week-nav" role="group" aria-label="Navegar entre semanas">' +
        '<button type="button" class="icon-btn bordered" data-week="-1" aria-label="Semana anterior">' + I('chevronLeft') + '</button>' +
        '<div class="wn-label"><strong>' + esc(U.fmtRange(monday, saturday)) + '</strong>' +
        '<span>' + (isThisWeek ? 'Esta semana' : weekN ? 'Semana ' + weekN + ' do período ' + esc(p.nome) : 'Fora do período letivo') + '</span></div>' +
        '<button type="button" class="icon-btn bordered" data-week="1" aria-label="Próxima semana">' + I('chevronRight') + '</button>' +
        (weekOffset !== 0 ? '<button type="button" class="btn btn-sm" data-week="0">' + I('target') + 'Voltar para hoje</button>' : '') +
        '</div>';

      var toggle = '<div class="segmented view-toggle" role="group" aria-label="Modo de visualização">' +
        '<button type="button" data-view="grade" aria-pressed="' + (view === 'grade') + '">' + I('grid') + 'Grade</button>' +
        '<button type="button" data-view="lista" aria-pressed="' + (view === 'lista') + '">' + I('list') + 'Lista</button></div>';

      var summary = '<section class="agenda-summary card" aria-label="Resumo da semana">' +
        '<div class="as-main"><span class="as-icon">' + I('calendar') + '</span><p><strong class="as-big tabular">' + aulas.length + '</strong> ' +
        (aulas.length === 1 ? 'aula prevista' : 'aulas previstas') + ' ' + (isThisWeek ? 'esta semana' : 'nesta semana') + '</p></div>' +
        '<div class="as-stat">' + I('clock') + '<p><strong>' + U.fmtDuration(mins) + '</strong> de aula</p></div>' +
        '<div class="as-stat">' + I('users') + '<p><strong>' + U.plural(Object.keys(turmas).length, 'turma', 'turmas') + '</strong> atendidas</p></div>' +
        '<div class="as-stat">' + I('bookOpen') + '<p><strong>' + U.plural(D.alocacoesDoProfessor(prof.id).length, 'matéria/turma', 'matérias/turmas') + '</strong> alocadas</p></div>' +
        '</section>';

      var body;
      if (!anyAloc) {
        body = '<section class="card">' + TC.ui.emptyState({
          illus: 'calendar', title: 'Sua agenda está vazia',
          text: 'Crie uma alocação com os horários semanais para ver suas aulas aqui.',
          action: '<a class="btn btn-primary" href="#/alocacoes?new=1">' + I('plus') + 'Nova alocação</a>'
        }) + '</section>';
      } else if (!aulas.length) {
        body = '<section class="card">' + TC.ui.emptyState({
          illus: 'calendar', title: 'Nenhuma aula nesta semana',
          text: 'Esta semana está fora do período letivo das suas turmas. Use as setas para ver outra semana.',
          action: '<button type="button" class="btn" data-week="0">' + I('target') + 'Voltar para hoje</button>'
        }) + '</section>';
      } else {
        var range = hourRange(prof.id);
        var days = [1, 2, 3, 4, 5, 6].map(function (d) {
          var date = U.addDays(monday, d - 1);
          var list = aulas.filter(function (a) { return a.dia === d; }).map(function (a) {
            return Object.assign({}, a, {
              top: (U.toMin(a.inicio) - range.start * 60) / 60 * HOUR_PX,
              height: Math.max(44, (U.toMin(a.fim) - U.toMin(a.inicio)) / 60 * HOUR_PX - 4)
            });
          });
          return { d: d, date: date, today: U.toISO(date) === todayIso, list: list };
        });

        var hours = [];
        for (var h = range.start; h <= range.end; h++) hours.push(h);
        var gridH = (range.end - range.start) * HOUR_PX;
        var now = U.now();
        var nowMin = now.getHours() * 60 + now.getMinutes();
        var nowTop = (nowMin - range.start * 60) / 60 * HOUR_PX;
        var showNow = isThisWeek && nowTop >= 0 && nowTop <= gridH;

        var grid = '<section class="card agenda-grid-card" aria-label="Grade semanal">' +
          '<div class="agenda-grid" style="--rows:' + (range.end - range.start) + ';--hour:' + HOUR_PX + 'px">' +
          '<div class="ag-corner" aria-hidden="true"></div>' +
          days.map(function (x) {
            return '<div class="ag-dayhead' + (x.today ? ' is-today' : '') + '"><span class="ag-dname">' + U.DIAS_CURTOS[x.d] + '</span>' +
              '<span class="ag-ddate">' + x.date.getDate() + '</span>' +
              (x.today ? '<span class="ag-today">Hoje</span>' : '<span class="ag-count">' + U.plural(x.list.length, 'aula', 'aulas') + '</span>') + '</div>';
          }).join('') +
          '<div class="ag-hours" aria-hidden="true" style="height:' + gridH + 'px">' + hours.map(function (hr, i) {
            return '<span style="top:' + (i * HOUR_PX) + 'px">' + U.pad(hr) + ':00</span>';
          }).join('') + '</div>' +
          days.map(function (x) {
            return '<div class="ag-col' + (x.today ? ' is-today' : '') + '" style="height:' + gridH + 'px">' +
              '<h2 class="sr-only">' + esc(U.fmtWeekday(x.date)) + ' — ' + U.plural(x.list.length, 'aula', 'aulas') + '</h2>' +
              (x.today && showNow ? '<span class="ag-now" style="top:' + nowTop + 'px" aria-hidden="true"><span>Agora</span></span>' : '') +
              (x.list.length ? '<ul>' + x.list.map(function (a) { return '<li>' + eventHtml(a) + '</li>'; }).join('') + '</ul>' : '') +
              '</div>';
          }).join('') +
          '</div></section>';

        var list = '<section class="agenda-list" aria-label="Aulas por dia">' + days.map(function (x) {
          return '<section class="card al-day' + (x.today ? ' is-today' : '') + '" aria-labelledby="al-' + x.d + '">' +
            '<header class="al-head"><h2 id="al-' + x.d + '">' + esc(U.DIAS[x.d]) + ' <span class="muted">' + U.fmtDayMonth(x.date) + '</span></h2>' +
            (x.today ? '<span class="badge badge-accent">' + I('circleDot') + 'Hoje</span>' : '') +
            '<span class="al-count">' + U.plural(x.list.length, 'aula', 'aulas') + '</span></header>' +
            (x.list.length ? '<ul class="al-items">' + x.list.map(function (a) { return '<li>' + eventHtml(a, true) + '</li>'; }).join('') + '</ul>'
              : '<p class="al-empty">' + I('sparkle') + 'Sem aulas neste dia</p>') +
            '</section>';
        }).join('') + '</section>';

        body = '<div class="agenda-views view-' + view + '">' + grid + list + '</div>';
      }

      root.innerHTML = head + '<div class="agenda-bar">' + nav + (anyAloc ? toggle : '') + '</div>' + summary + body;
      if (focusSel) { var f = root.querySelector(focusSel); if (f) f.focus(); }
    }

    root.addEventListener('click', function (e) {
      var w = e.target.closest('[data-week]');
      if (w) {
        var v = Number(w.getAttribute('data-week'));
        weekOffset = v === 0 ? 0 : weekOffset + v;
        paint(v === 0 ? '[data-week="1"]' : '[data-week="' + v + '"]');
        return;
      }
      var t = e.target.closest('[data-view]');
      if (t) {
        view = t.getAttribute('data-view');
        TC.store.pref.set('agenda-view', view);
        paint('[data-view="' + view + '"]');
      }
    });

    paint();
  };
})(window.TC);
