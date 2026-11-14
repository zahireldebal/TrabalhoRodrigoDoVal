/* Domain queries: relationships and derived numbers (no DOM here). */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var S = TC.store;
  var U = TC.util;

  var TURNOS = ['Matutino', 'Vespertino', 'Noturno'];
  var TITULACOES = ['Graduação', 'Especialização', 'Mestrado', 'Doutorado'];

  function byName(a, b) { return String(a.nome).localeCompare(String(b.nome), 'pt-BR'); }

  var D = {
    TURNOS: TURNOS,
    TITULACOES: TITULACOES,

    professor: function (id) { return S.get('professores', id); },
    curso: function (id) { return S.get('cursos', id); },
    materia: function (id) { return S.get('materias', id); },
    turma: function (id) { return S.get('turmas', id); },
    periodo: function (id) { return S.get('periodos', id); },
    alocacao: function (id) { return S.get('alocacoes', id); },

    cursosSorted: function () { return S.all('cursos').sort(byName); },
    materiasSorted: function () { return S.all('materias').sort(byName); },
    turmasSorted: function () { return S.all('turmas').sort(byName); },
    professoresSorted: function () { return S.all('professores').sort(byName); },
    periodosSorted: function () {
      return S.all('periodos').sort(function (a, b) { return b.inicio.localeCompare(a.inicio); });
    },

    materiasDoCurso: function (cursoId) { return S.where('materias', 'cursoId', cursoId); },
    turmasDoCurso: function (cursoId) { return S.where('turmas', 'cursoId', cursoId); },
    turmasDoPeriodo: function (periodoId) { return S.where('turmas', 'periodoId', periodoId); },
    alunosDaTurma: function (turmaId) { return S.where('alunos', 'turmaId', turmaId); },
    alocacoesDoProfessor: function (profId) { return S.where('alocacoes', 'professorId', profId); },
    alocacoesDaMateria: function (materiaId) { return S.where('alocacoes', 'materiaId', materiaId); },
    alocacoesDaTurma: function (turmaId) { return S.where('alocacoes', 'turmaId', turmaId); },

    alunosCount: function (turmaId) { return S.count('alunos', 'turmaId', turmaId); },

    /** Visual identity of a course: index → color + pattern class. */
    cursoStyle: function (cursoId) {
      var list = S.all('cursos');
      var idx = list.findIndex(function (c) { return c.id === cursoId; });
      return 'cs-' + ((idx < 0 ? 0 : idx) % 5);
    },

    /* ---------- Academic periods ---------- */
    periodoStatus: function (p, today) {
      var t = U.toISO(today || U.now());
      if (t < p.inicio) return 'planejado';
      if (t > p.fim) return 'encerrado';
      return 'andamento';
    },

    /** Period containing today; otherwise the most recent that has started; otherwise the first. */
    periodoAtivo: function () {
      var t = U.toISO(U.now());
      var list = S.all('periodos').sort(function (a, b) { return a.inicio.localeCompare(b.inicio); });
      var current = list.filter(function (p) { return p.inicio <= t && t <= p.fim; })[0];
      if (current) return current;
      var started = list.filter(function (p) { return p.inicio <= t; });
      return started[started.length - 1] || list[0] || null;
    },

    semanasDoPeriodo: function (p) {
      var start = U.startOfWeek(p.inicio);
      return Math.max(1, Math.ceil((U.diffDays(start, p.fim) + 1) / 7));
    },

    /** 1-based week number of `date` inside the period, or null if outside. */
    semanaNoPeriodo: function (p, date) {
      var d = U.parseDate(date || U.now());
      if (U.toISO(d) < p.inicio || U.toISO(d) > p.fim) return null;
      return Math.floor(U.diffDays(U.startOfWeek(p.inicio), d) / 7) + 1;
    },

    /** Monday and Saturday of week `n` of the period. */
    datasDaSemana: function (p, n) {
      var monday = U.addDays(U.startOfWeek(p.inicio), (n - 1) * 7);
      return { inicio: monday, fim: U.addDays(monday, 5) };
    },

    progressoPeriodo: function (p) {
      var total = U.diffDays(p.inicio, p.fim) || 1;
      var done = U.diffDays(p.inicio, U.now());
      return Math.max(0, Math.min(1, done / total));
    },

    /* ---------- Classes (aulas) ---------- */
    duracaoHorario: function (h) { return U.toMin(h.fim) - U.toMin(h.inicio); },

    aulasPorSemana: function (aloc) { return (aloc.horarios || []).length; },

    minutosPorSemana: function (aloc) {
      return (aloc.horarios || []).reduce(function (s, h) { return s + D.duracaoHorario(h); }, 0);
    },

    /** Expanded list of classes for a professor in the week starting on `monday`. */
    aulasNaSemana: function (profId, monday) {
      var start = U.startOfWeek(monday);
      var out = [];
      D.alocacoesDoProfessor(profId).forEach(function (a) {
        var turma = D.turma(a.turmaId);
        var materia = D.materia(a.materiaId);
        if (!turma || !materia) return;
        var periodo = D.periodo(turma.periodoId);
        (a.horarios || []).forEach(function (h) {
          var date = U.addDays(start, h.dia - 1);
          var iso = U.toISO(date);
          if (periodo && (iso < periodo.inicio || iso > periodo.fim)) return;
          out.push({
            aloc: a, materia: materia, turma: turma, curso: D.curso(materia.cursoId), periodo: periodo,
            date: date, iso: iso, dia: h.dia, inicio: h.inicio, fim: h.fim, sala: a.sala,
            minutos: D.duracaoHorario(h)
          });
        });
      });
      return out.sort(function (x, y) {
        return x.dia - y.dia || x.inicio.localeCompare(y.inicio);
      });
    },

    /** Students per subject for a professor (sum of students in each allocated class). */
    alunosPorMateria: function (profId) {
      var map = {};
      D.alocacoesDoProfessor(profId).forEach(function (a) {
        var m = D.materia(a.materiaId);
        if (!m) return;
        if (!map[m.id]) map[m.id] = { materia: m, curso: D.curso(m.cursoId), alunos: 0, turmas: [] };
        map[m.id].alunos += D.alunosCount(a.turmaId);
        var t = D.turma(a.turmaId);
        if (t) map[m.id].turmas.push(t.nome);
      });
      return Object.keys(map).map(function (k) { return map[k]; })
        .sort(function (a, b) { return b.alunos - a.alunos || byName(a.materia, b.materia); });
    },

    /** Unique ids touched by a professor's allocations. */
    resumoProfessor: function (profId) {
      var alocs = D.alocacoesDoProfessor(profId);
      var cursos = {}, materias = {}, turmas = {};
      alocs.forEach(function (a) {
        var m = D.materia(a.materiaId);
        if (m) { materias[m.id] = 1; cursos[m.cursoId] = 1; }
        turmas[a.turmaId] = 1;
      });
      var alunos = Object.keys(turmas).reduce(function (s, t) { return s + D.alunosCount(t); }, 0);
      return {
        cursos: Object.keys(cursos).length,
        materias: Object.keys(materias).length,
        turmas: Object.keys(turmas).length,
        alunos: alunos
      };
    },

    horarioLabel: function (h) { return U.DIAS_CURTOS[h.dia] + ' ' + h.inicio + '–' + h.fim; }
  };

  TC.domain = D;
})(window.TC);
