/* Plano de Aula (HU01): course → subject → class, summary and weekly timeline.
   Printable via css/print.css. */
window.TC = window.TC || {};
TC.pages = TC.pages || {};

(function (TC) {
  'use strict';

  var U = TC.util;
  var esc = U.esc;
  var I = TC.icon;
  var sel = { cursoId: null, materiaId: null, alocId: null };

  function myAlocs(profId) {
    var D = TC.domain;
    return D.alocacoesDoProfessor(profId).filter(function (a) { return D.materia(a.materiaId) && D.turma(a.turmaId); });
  }

  /** Keeps the selection consistent with the professor's allocations. */
  function resolve(alocs, query) {
    var D = TC.domain;
    if (query.aloc) {
      var a = alocs.filter(function (x) { return x.id === query.aloc; })[0];
      if (a) { sel.alocId = a.id; sel.materiaId = a.materiaId; sel.cursoId = D.materia(a.materiaId).cursoId; }
    }
    var cursos = [];
    alocs.forEach(function (a) { var c = D.materia(a.materiaId).cursoId; if (cursos.indexOf(c) < 0) cursos.push(c); });
    if (cursos.indexOf(sel.cursoId) < 0) sel.cursoId = cursos[0] || null;
    var inCurso = alocs.filter(function (a) { return D.materia(a.materiaId).cursoId === sel.cursoId; });
    var materias = [];
    inCurso.forEach(function (a) { if (materias.indexOf(a.materiaId) < 0) materias.push(a.materiaId); });
    if (materias.indexOf(sel.materiaId) < 0) sel.materiaId = materias[0] || null;
    var turmas = inCurso.filter(function (a) { return a.materiaId === sel.materiaId; });
    if (!turmas.some(function (a) { return a.id === sel.alocId; })) sel.alocId = turmas[0] ? turmas[0].id : null;
    return { cursos: cursos, materias: materias, turmas: turmas };
  }

  function selectors(opts) {
    var D = TC.domain;
    function select(id, label, list, current, labelFn) {
      return '<div class="field"><label for="' + id + '">' + label + '</label><select class="select" id="' + id + '"' + (list.length < 2 ? ' aria-describedby="' + id + '-only"' : '') + '>' +
        list.map(function (v) { return '<option value="' + esc(v.id || v) + '"' + ((v.id || v) === current ? ' selected' : '') + '>' + esc(labelFn(v)) + '</option>'; }).join('') +
        '</select>' + (list.length < 2 ? '<span class="sr-only" id="' + id + '-only">Única opção disponível</span>' : '') + '</div>';
    }
    return '<section class="card plan-picker" aria-label="Escolher curso, matéria e turma">' +
      '<span class="step-dot" aria-hidden="true">1</span>' + select('pl-curso', 'Curso', opts.cursos, sel.cursoId, function (id) { var c = D.curso(id); return c.codigo + ' — ' + c.nome; }) +
      '<span class="step-dot" aria-hidden="true">2</span>' + select('pl-materia', 'Matéria', opts.materias, sel.materiaId, function (id) { return D.materia(id).nome; }) +
      '<span class="step-dot" aria-hidden="true">3</span>' + select('pl-turma', 'Turma', opts.turmas, sel.alocId, function (a) { var t = D.turma(a.turmaId); return t.nome + ' · ' + t.turno; }) +
      '</section>';
  }

  function status(entry, current) {
    if (!current) return 'prevista';
    if (entry.semanaFim < current) return 'concluida';
    if (entry.semanaInicio <= current) return 'andamento';
    return 'prevista';
  }
  var STATUS = {
    concluida: { label: 'Concluída', icon: 'checkCircle', cls: 'badge-outline' },
    andamento: { label: 'Em andamento', icon: 'circleDot', cls: 'badge-success' },
    prevista: { label: 'Prevista', icon: 'circle', cls: 'badge-info' }
  };

  function summary(a, prof) {
    var D = TC.domain;
    var m = D.materia(a.materiaId), t = D.turma(a.turmaId), c = D.curso(m.cursoId), p = D.periodo(t.periodoId);
    var alunos = D.alunosCount(t.id);
    var mins = D.minutosPorSemana(a);
    var semanas = p ? D.semanasDoPeriodo(p) : 0;
    var previstas = D.aulasPorSemana(a) * semanas;
    return '<section class="card plan-summary" aria-labelledby="plan-materia">' +
      '<div class="print-only print-head">' + TC.ui.logoMark() + '<div><strong>Teacher Class</strong><span>Plano de Aula · ' + esc(prof.nome) + ' · impresso em ' + U.fmtDate(U.now()) + '</span></div></div>' +
      '<div class="ps-main">' +
      '<div class="ps-tags">' + TC.ui.courseChip(c, { full: true }) + TC.ui.turnoBadge(t.turno) + '</div>' +
      '<h2 id="plan-materia" class="ps-title">' + esc(m.nome) + '</h2>' +
      '<p class="ps-meta">' + I('users') + esc(t.nome) + (p ? ' · Período ' + esc(p.nome) + ' (' + U.fmtDate(p.inicio) + ' a ' + U.fmtDate(p.fim) + ')' : '') + '</p>' +
      '<h3 class="ps-h">Ementa</h3><p class="ps-ementa">' + esc(m.ementa) + '</p>' +
      '<h3 class="ps-h">Horários semanais</h3><ul class="ps-hours">' + (a.horarios || []).map(function (h) {
        return '<li>' + I('clock') + '<span><strong>' + U.DIAS[h.dia] + '</strong> ' + h.inicio + '–' + h.fim + '</span></li>';
      }).join('') + '<li>' + I('mapPin') + '<span>' + esc(a.sala) + '</span></li></ul>' +
      '</div>' +
      '<dl class="ps-stats">' +
      stat('clock', 'Carga horária', m.cargaHoraria + ' h', 'total da matéria') +
      stat('calendar', 'Aulas por semana', D.aulasPorSemana(a), U.fmtDuration(mins) + ' por semana') +
      stat('user', 'Alunos', alunos, 'na turma ' + t.nome) +
      stat('flag', 'Aulas previstas', previstas, 'em ' + U.plural(semanas, 'semana', 'semanas')) +
      '</dl></section>';
  }

  function stat(icon, label, value, sub) {
    return '<div class="ps-stat"><dt>' + I(icon) + label + '</dt><dd><strong>' + esc(value) + '</strong><span>' + esc(sub) + '</span></dd></div>';
  }

  function timeline(a) {
    var D = TC.domain;
    var t = D.turma(a.turmaId), p = D.periodo(t.periodoId);
    var current = p ? D.semanaNoPeriodo(p, U.now()) : null;
    var total = p ? D.semanasDoPeriodo(p) : 0;
    var plano = (a.plano || []).slice().sort(function (x, y) { return x.semanaInicio - y.semanaInicio; });
    var covered = {};
    plano.forEach(function (e) { for (var w = e.semanaInicio; w <= e.semanaFim; w++) covered[w] = 1; });
    var nCovered = Object.keys(covered).length;

    var head = '<div class="card-head tl-head"><h2 id="tl-title"><span class="h-icon">' + I('list') + '</span>Linha do tempo semanal</h2>' +
      '<button type="button" class="btn btn-sm no-print" data-add-step>' + I('plus') + 'Adicionar etapa</button></div>' +
      '<div class="tl-overview">' +
      (current ? '<p><strong>Semana ' + current + ' de ' + total + '</strong> do período</p>' : '<p><strong>' + U.plural(total, 'semana', 'semanas') + '</strong> no período</p>') +
      '<p class="muted">' + nCovered + ' de ' + total + ' semanas planejadas</p>' +
      '<ul class="tl-legend" aria-label="Legenda">' + ['concluida', 'andamento', 'prevista'].map(function (k) {
        return '<li class="badge ' + STATUS[k].cls + '">' + I(STATUS[k].icon) + STATUS[k].label + '</li>';
      }).join('') + '</ul>' +
      '<div class="week-strip" aria-hidden="true">' + Array.apply(null, { length: total }).map(function (_, i) {
        var w = i + 1;
        return '<span class="ws' + (covered[w] ? ' is-planned' : '') + (w === current ? ' is-current' : '') + (current && w < current ? ' is-past' : '') + '">' + w + '</span>';
      }).join('') + '</div></div>';

    if (!plano.length) {
      return '<section class="card" aria-labelledby="tl-title">' + head + TC.ui.emptyState({
        illus: 'book', title: 'Nenhuma etapa planejada', text: 'Adicione a primeira etapa do plano: semanas, tema, objetivos, conteúdo e recursos.',
        action: '<button type="button" class="btn btn-primary" data-add-step>' + I('plus') + 'Adicionar etapa</button>'
      }) + '</section>';
    }

    var items = plano.map(function (e) {
      var st = status(e, current);
      var s = STATUS[st];
      var range = p ? D.datasDaSemana(p, e.semanaInicio).inicio : null;
      var rangeEnd = p ? D.datasDaSemana(p, e.semanaFim).fim : null;
      var weeks = e.semanaInicio === e.semanaFim ? 'Semana ' + e.semanaInicio : 'Semanas ' + e.semanaInicio + '–' + e.semanaFim;
      var recursos = String(e.recursos || '').split(';').map(function (r) { return r.trim(); }).filter(Boolean);
      return '<li class="tl-item is-' + st + '">' +
        '<span class="tl-marker" aria-hidden="true">' + I(s.icon) + '</span>' +
        '<article class="tl-card" aria-labelledby="step-' + esc(e.id) + '">' +
        '<header class="tl-card-head"><p class="tl-weeks"><strong>' + weeks + '</strong>' + (range ? ' · ' + U.fmtDayMonth(range) + ' a ' + U.fmtDayMonth(rangeEnd) : '') + '</p>' +
        '<span class="badge ' + s.cls + '">' + I(s.icon) + s.label + '</span>' +
        '<span class="tl-actions no-print">' +
        '<button type="button" class="icon-btn icon-btn-sm" data-edit-step="' + esc(e.id) + '" aria-label="Editar etapa: ' + esc(e.tema) + '">' + I('edit') + '</button>' +
        '<button type="button" class="icon-btn icon-btn-sm danger" data-del-step="' + esc(e.id) + '" aria-label="Excluir etapa: ' + esc(e.tema) + '">' + I('trash') + '</button></span></header>' +
        '<h3 id="step-' + esc(e.id) + '">' + esc(e.tema) + '</h3>' +
        '<dl class="tl-details">' +
        '<div><dt>' + I('target') + 'Objetivos</dt><dd>' + esc(e.objetivos) + '</dd></div>' +
        '<div><dt>' + I('book') + 'Conteúdo</dt><dd>' + esc(e.conteudo) + '</dd></div>' +
        (recursos.length ? '<div><dt>' + I('briefcase') + 'Recursos</dt><dd><ul class="chips">' + recursos.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></dd></div>' : '') +
        '</dl></article></li>';
    }).join('');

    return '<section class="card" aria-labelledby="tl-title">' + head + '<ol class="timeline">' + items + '</ol></section>';
  }

  function stepFields(total) {
    return [
      { name: 'semanaInicio', label: 'Semana inicial', type: 'number', required: true, half: true, min: 1, max: total, reqMsg: 'Informe a semana inicial.' },
      { name: 'semanaFim', label: 'Semana final', type: 'number', required: true, half: true, min: 1, max: total, reqMsg: 'Informe a semana final.',
        validate: function (v, values) { return values.semanaInicio && v < values.semanaInicio ? 'A semana final não pode ser antes da inicial.' : null; } },
      { name: 'tema', label: 'Tema', required: true, reqMsg: 'Informe o tema da etapa.', maxlength: 90, placeholder: 'Ex.: Formulários e validação' },
      { name: 'objetivos', label: 'Objetivos', type: 'textarea', rows: 2, required: true, reqMsg: 'Descreva os objetivos.', maxlength: 300 },
      { name: 'conteudo', label: 'Conteúdo', type: 'textarea', rows: 2, required: true, reqMsg: 'Descreva o conteúdo.', maxlength: 300 },
      { name: 'recursos', label: 'Recursos', maxlength: 200, hint: 'Separe os recursos com ponto e vírgula. Ex.: Slides; laboratório', placeholder: 'Slides; laboratório' }
    ];
  }

  TC.pages.plano = function (root, query) {
    var D = TC.domain;
    var prof = TC.app.currentProf();
    var alocs = myAlocs(prof.id);
    var head = TC.ui.pageHead({
      eyebrow: 'Planejamento', eyebrowIcon: 'bookOpen', title: 'Plano de Aula',
      lead: 'Consulte seu plano organizado por curso e matéria, semana a semana.',
      actions: alocs.length ? '<button type="button" class="btn" data-print>' + I('printer') + 'Imprimir ou salvar PDF</button>' : ''
    });

    if (!alocs.length) {
      root.innerHTML = head + '<section class="card">' + TC.ui.emptyState({
        illus: 'book', title: 'Você ainda não tem matérias alocadas',
        text: 'Crie uma alocação (matéria + turma + horários) para montar seu plano de aula.',
        action: '<a class="btn btn-primary" href="#/alocacoes?new=1">' + I('plus') + 'Nova alocação</a>'
      }) + '</section>';
      return;
    }

    if (query.aloc) TC.router.clean('/plano');

    function paint(focusId) {
      var opts = resolve(alocs, query);
      query = {};
      var a = D.alocacao(sel.alocId);
      root.innerHTML = head + selectors(opts) + '<div class="plan-body">' + summary(a, prof) + timeline(a) + '</div>';
      if (focusId) { var el = root.querySelector('#' + focusId); if (el) el.focus(); }
    }

    function openStep(a, entry) {
      var t = D.turma(a.turmaId), p = D.periodo(t.periodoId);
      var total = p ? D.semanasDoPeriodo(p) : 52;
      var fields = stepFields(total);
      var dlg = TC.ui.open({
        variant: 'side', wrapForm: true,
        title: entry ? 'Editar etapa do plano' : 'Nova etapa do plano',
        subtitle: D.materia(a.materiaId).nome + ' · ' + t.nome,
        headIcon: entry ? 'edit' : 'bookOpen',
        body: TC.form.render('stp', fields, entry || {}),
        footer: '<button type="button" class="btn" data-close>Cancelar</button><button type="submit" class="btn btn-primary">' + I('check') + 'Salvar etapa</button>',
        initialFocus: 'input'
      });
      TC.form.bind(dlg.dialog, 'stp', fields, function (v) {
        var plano = (a.plano || []).slice();
        if (entry) plano = plano.map(function (e) { return e.id === entry.id ? Object.assign({}, e, v) : e; });
        else plano.push(Object.assign({ id: U.uid('stp') }, v));
        TC.store.update('alocacoes', a.id, { plano: plano });
        TC.toast.success(entry ? 'Etapa atualizada' : 'Etapa adicionada', '“' + v.tema + '” está no plano de aula.');
        dlg.close();
        paint();
        return [];
      });
    }

    root.addEventListener('change', function (e) {
      if (e.target.id === 'pl-curso') { sel.cursoId = e.target.value; sel.materiaId = null; sel.alocId = null; paint('pl-curso'); }
      if (e.target.id === 'pl-materia') { sel.materiaId = e.target.value; sel.alocId = null; paint('pl-materia'); }
      if (e.target.id === 'pl-turma') { sel.alocId = e.target.value; paint('pl-turma'); }
    });

    root.addEventListener('click', function (e) {
      var t = e.target.closest('[data-print], [data-add-step], [data-edit-step], [data-del-step]');
      if (!t) return;
      var a = D.alocacao(sel.alocId);
      if (t.hasAttribute('data-print')) { window.print(); return; }
      if (t.hasAttribute('data-add-step')) { openStep(a, null); return; }
      var id = t.getAttribute('data-edit-step') || t.getAttribute('data-del-step');
      var entry = (a.plano || []).filter(function (x) { return x.id === id; })[0];
      if (t.hasAttribute('data-edit-step')) { openStep(a, entry); return; }
      TC.ui.confirm({
        title: 'Excluir etapa?',
        message: 'A etapa <strong>' + esc(entry.tema) + '</strong> será removida do plano de aula. Esta ação não pode ser desfeita.',
        okText: 'Excluir etapa', okIcon: 'trash'
      }).then(function (ok) {
        if (!ok) return;
        TC.store.update('alocacoes', a.id, { plano: a.plano.filter(function (x) { return x.id !== id; }) });
        TC.toast.success('Etapa excluída', '“' + entry.tema + '” foi removida do plano.');
        paint();
        root.querySelector('[data-page-title]').focus();
      });
    });

    paint();
  };
})(window.TC);
