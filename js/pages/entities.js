/* Entity configuration for the generic CRUD: fields, validation, columns,
   filters and delete rules. UI text in pt-BR. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var U = TC.util;
  var esc = U.esc;
  var I = TC.icon;
  var S = TC.store;
  var D = TC.domain;
  var ui = function () { return TC.ui; };

  function opt(list, labelFn) {
    return list.map(function (r) { return { value: r.id, label: labelFn ? labelFn(r) : r.nome }; });
  }
  function cursoOptions() { return opt(D.cursosSorted(), function (c) { return c.codigo + ' — ' + c.nome; }); }
  function periodoOptions() { return opt(D.periodosSorted()); }
  function turmaOptions() {
    return D.turmasSorted().map(function (t) {
      var c = D.curso(t.cursoId);
      return { value: t.id, label: t.nome + ' · ' + t.turno, group: c ? c.codigo + ' — ' + c.nome : 'Sem curso' };
    });
  }
  function materiaOptions() {
    return D.materiasSorted().map(function (m) {
      var c = D.curso(m.cursoId);
      return { value: m.id, label: m.nome, group: c ? c.codigo + ' — ' + c.nome : 'Sem curso' };
    });
  }
  function list(values) { return values.map(function (v) { return { value: v, label: v }; }); }

  function unique(collection, field, message) {
    return function (value, values, editingId) {
      var n = U.normalize(value);
      var clash = S.all(collection).some(function (r) { return r.id !== editingId && U.normalize(r[field]) === n; });
      return clash ? message : null;
    };
  }

  function cell(title, sub, lead) {
    return '<div class="cell-main">' + (lead || '') + '<div><span class="cell-title">' + esc(title) + '</span>' +
      (sub ? '<span class="cell-sub">' + sub + '</span>' : '') + '</div></div>';
  }
  function countPill(icon, n, sing, plur) {
    return '<span class="count-pill">' + I(icon) + U.plural(n, sing, plur) + '</span>';
  }

  var E = {};

  /* ---------- Cursos ---------- */
  E.cursos = {
    collection: 'cursos', title: 'Cursos', singular: 'curso', gender: 'm', icon: 'layers',
    lead: 'Cadastre os cursos da instituição. Cada matéria e turma pertence a um curso.',
    fields: [
      { name: 'nome', label: 'Nome do curso', required: true, reqMsg: 'Informe o nome do curso.', minLength: 3, maxlength: 80, placeholder: 'Ex.: Análise e Desenvolvimento de Sistemas' },
      { name: 'codigo', label: 'Código', required: true, half: true, reqMsg: 'Informe o código do curso.', maxlength: 6, placeholder: 'Ex.: ADS',
        hint: 'De 2 a 6 letras ou números.', transform: function (v) { return String(v).toUpperCase(); },
        validate: function (v) { return /^[A-Z0-9]{2,6}$/.test(v) ? null : 'Use de 2 a 6 letras ou números, sem espaços.'; } },
      { name: 'duracao', label: 'Duração (períodos)', type: 'number', required: true, half: true, min: 1, max: 12, reqMsg: 'Informe quantos períodos o curso tem.', placeholder: 'Ex.: 5', hint: 'Entre 1 e 12 períodos.' }
    ],
    uniques: [{ field: 'codigo', check: unique('cursos', 'codigo', 'Já existe um curso com este código.') }],
    search: function (r) { return r.nome + ' ' + r.codigo; },
    columns: [
      { key: 'nome', label: 'Curso', primary: true, sort: function (r) { return r.nome; },
        render: function (r) { return cell(r.nome, '', ui().courseChip(r)); } },
      { key: 'duracao', label: 'Duração', sort: function (r) { return r.duracao; },
        render: function (r) { return U.plural(r.duracao, 'período', 'períodos'); } },
      { key: 'materias', label: 'Matérias', sort: function (r) { return D.materiasDoCurso(r.id).length; },
        render: function (r) { return countPill('book', D.materiasDoCurso(r.id).length, 'matéria', 'matérias'); } },
      { key: 'turmas', label: 'Turmas', sort: function (r) { return D.turmasDoCurso(r.id).length; },
        render: function (r) { return countPill('users', D.turmasDoCurso(r.id).length, 'turma', 'turmas'); } }
    ],
    defaultSort: 'nome',
    deleteGuard: function (r) {
      var m = D.materiasDoCurso(r.id).length;
      if (m) return { message: 'Este curso possui ' + U.plural(m, 'matéria vinculada', 'matérias vinculadas') + '. Exclua ou mova essas matérias para outro curso antes de excluir o curso.', linkText: 'Ver matérias do curso', linkHref: '#/materias?curso=' + r.id, linkIcon: 'book' };
      var t = D.turmasDoCurso(r.id).length;
      if (t) return { message: 'Este curso possui ' + U.plural(t, 'turma vinculada', 'turmas vinculadas') + '. Exclua ou mova essas turmas antes de excluir o curso.', linkText: 'Ver turmas do curso', linkHref: '#/turmas?curso=' + r.id, linkIcon: 'users' };
      return null;
    }
  };

  /* ---------- Matérias ---------- */
  E.materias = {
    collection: 'materias', title: 'Matérias', singular: 'matéria', gender: 'f', icon: 'book',
    lead: 'Cadastre as matérias e vincule cada uma a um curso.',
    fields: [
      { name: 'nome', label: 'Nome da matéria', required: true, reqMsg: 'Informe o nome da matéria.', minLength: 3, maxlength: 80, placeholder: 'Ex.: Programação Web' },
      { name: 'cursoId', label: 'Curso', type: 'select', required: true, half: true, reqMsg: 'Selecione o curso da matéria.', placeholder: 'Selecione o curso…', options: cursoOptions },
      { name: 'cargaHoraria', label: 'Carga horária (horas)', type: 'number', required: true, half: true, min: 10, max: 400, reqMsg: 'Informe a carga horária em horas.', placeholder: 'Ex.: 80' },
      { name: 'ementa', label: 'Ementa', type: 'textarea', required: true, reqMsg: 'Escreva a ementa da matéria.', minLength: 10, maxlength: 600, rows: 4,
        hint: 'Resumo dos conteúdos que a matéria aborda.', placeholder: 'Ex.: HTML semântico, CSS responsivo e JavaScript…' }
    ],
    uniques: [{ field: 'nome', check: function (v, values, id) {
      var n = U.normalize(v);
      return S.all('materias').some(function (m) { return m.id !== id && m.cursoId === values.cursoId && U.normalize(m.nome) === n; })
        ? 'Este curso já tem uma matéria com este nome.' : null;
    } }],
    search: function (r) { var c = D.curso(r.cursoId); return r.nome + ' ' + (c ? c.nome + ' ' + c.codigo : ''); },
    filters: [{ name: 'curso', label: 'Curso', options: cursoOptions, match: function (r, v) { return r.cursoId === v; } }],
    columns: [
      { key: 'nome', label: 'Matéria', primary: true, sort: function (r) { return r.nome; },
        render: function (r) { return cell(r.nome, esc(r.ementa.length > 70 ? r.ementa.slice(0, 70) + '…' : r.ementa)); } },
      { key: 'curso', label: 'Curso', sort: function (r) { var c = D.curso(r.cursoId); return c ? c.codigo : ''; },
        render: function (r) { return ui().courseChip(D.curso(r.cursoId)); } },
      { key: 'cargaHoraria', label: 'Carga horária', sort: function (r) { return r.cargaHoraria; },
        render: function (r) { return '<span class="count-pill">' + I('clock') + r.cargaHoraria + ' h</span>'; } },
      { key: 'professores', label: 'Professores', sort: function (r) { return D.alocacoesDaMateria(r.id).length; },
        render: function (r) {
          var names = D.alocacoesDaMateria(r.id).map(function (a) { var p = D.professor(a.professorId); return p ? U.firstName(p.nome) : null; })
            .filter(function (n, i, arr) { return n && arr.indexOf(n) === i; });
          return names.length ? esc(names.join(', ')) : '<span class="muted">Sem professor</span>';
        } }
    ],
    defaultSort: 'nome',
    deleteGuard: function (r) {
      var a = D.alocacoesDaMateria(r.id).length;
      if (a) return { message: 'Esta matéria possui ' + U.plural(a, 'alocação vinculada', 'alocações vinculadas') + ' (professor e turma com plano de aula). Exclua as alocações antes de excluir a matéria.', linkText: 'Ver alocações', linkHref: '#/alocacoes?materia=' + r.id, linkIcon: 'link' };
      return null;
    }
  };

  /* ---------- Turmas ---------- */
  E.turmas = {
    collection: 'turmas', title: 'Turmas', singular: 'turma', gender: 'f', icon: 'users',
    lead: 'Cadastre as turmas, associando cada uma a um curso e a um período letivo.',
    fields: [
      { name: 'nome', label: 'Nome da turma', required: true, reqMsg: 'Informe o nome da turma.', maxlength: 40, placeholder: 'Ex.: ADS 2º A' },
      { name: 'cursoId', label: 'Curso', type: 'select', required: true, reqMsg: 'Selecione o curso da turma.', placeholder: 'Selecione o curso…', options: cursoOptions },
      { name: 'periodoId', label: 'Período letivo', type: 'select', required: true, half: true, reqMsg: 'Selecione o período letivo.', placeholder: 'Selecione…', options: periodoOptions },
      { name: 'turno', label: 'Turno', type: 'select', required: true, half: true, reqMsg: 'Selecione o turno.', placeholder: 'Selecione…', options: function () { return list(D.TURNOS); } }
    ],
    uniques: [{ field: 'nome', check: function (v, values, id) {
      var n = U.normalize(v);
      return S.all('turmas').some(function (t) { return t.id !== id && t.periodoId === values.periodoId && U.normalize(t.nome) === n; })
        ? 'Já existe uma turma com este nome neste período.' : null;
    } }],
    search: function (r) { var c = D.curso(r.cursoId); return r.nome + ' ' + r.turno + ' ' + (c ? c.nome + ' ' + c.codigo : ''); },
    filters: [
      { name: 'curso', label: 'Curso', options: cursoOptions, match: function (r, v) { return r.cursoId === v; } },
      { name: 'periodo', label: 'Período', options: periodoOptions, match: function (r, v) { return r.periodoId === v; } },
      { name: 'turno', label: 'Turno', options: function () { return list(D.TURNOS); }, match: function (r, v) { return r.turno === v; } }
    ],
    columns: [
      { key: 'nome', label: 'Turma', primary: true, sort: function (r) { return r.nome; },
        render: function (r) { var c = D.curso(r.cursoId); return cell(r.nome, c ? esc(c.nome) : ''); } },
      { key: 'curso', label: 'Curso', sort: function (r) { var c = D.curso(r.cursoId); return c ? c.codigo : ''; },
        render: function (r) { return ui().courseChip(D.curso(r.cursoId)); } },
      { key: 'periodo', label: 'Período', sort: function (r) { var p = D.periodo(r.periodoId); return p ? p.nome : ''; },
        render: function (r) { var p = D.periodo(r.periodoId); return p ? esc(p.nome) : '—'; } },
      { key: 'turno', label: 'Turno', sort: function (r) { return D.TURNOS.indexOf(r.turno); },
        render: function (r) { return ui().turnoBadge(r.turno); } },
      { key: 'alunos', label: 'Alunos', sort: function (r) { return D.alunosCount(r.id); },
        render: function (r) { return countPill('user', D.alunosCount(r.id), 'aluno', 'alunos'); } }
    ],
    defaultSort: 'nome',
    deleteGuard: function (r) {
      var a = D.alunosCount(r.id);
      if (a) return { message: 'Esta turma possui ' + U.plural(a, 'aluno matriculado', 'alunos matriculados') + '. Mova ou exclua os alunos antes de excluir a turma.', linkText: 'Ver alunos da turma', linkHref: '#/alunos?turma=' + r.id, linkIcon: 'user' };
      var al = D.alocacoesDaTurma(r.id).length;
      if (al) return { message: 'Esta turma possui ' + U.plural(al, 'alocação vinculada', 'alocações vinculadas') + '. Exclua as alocações antes de excluir a turma.', linkText: 'Ver alocações', linkHref: '#/alocacoes', linkIcon: 'link' };
      return null;
    }
  };

  /* ---------- Períodos ---------- */
  E.periodos = {
    collection: 'periodos', title: 'Períodos', singular: 'período', gender: 'm', icon: 'calendarRange',
    lead: 'Cadastre os períodos letivos com as datas de início e fim.',
    fields: [
      { name: 'nome', label: 'Período letivo', required: true, reqMsg: 'Informe o período letivo.', maxlength: 6, placeholder: 'Ex.: 2027/2', hint: 'Use o formato ano/semestre, por exemplo 2027/2.',
        validate: function (v) { return /^\d{4}\/[12]$/.test(v) ? null : 'Use o formato ano/semestre, por exemplo 2027/2.'; } },
      { name: 'inicio', label: 'Data de início', type: 'date', required: true, half: true, reqMsg: 'Informe a data de início.' },
      { name: 'fim', label: 'Data de fim', type: 'date', required: true, half: true, reqMsg: 'Informe a data de fim.',
        validate: function (v, values) { return values.inicio && v <= values.inicio ? 'A data de fim precisa ser depois da data de início.' : null; } }
    ],
    uniques: [{ field: 'nome', check: unique('periodos', 'nome', 'Este período letivo já está cadastrado.') }],
    search: function (r) { return r.nome; },
    filters: [{ name: 'status', label: 'Situação', options: function () {
      return [{ value: 'andamento', label: 'Em andamento' }, { value: 'planejado', label: 'Planejado' }, { value: 'encerrado', label: 'Encerrado' }];
    }, match: function (r, v) { return D.periodoStatus(r) === v; } }],
    columns: [
      { key: 'nome', label: 'Período', primary: true, sort: function (r) { return r.inicio; },
        render: function (r) { return cell(r.nome, U.plural(D.semanasDoPeriodo(r), 'semana', 'semanas')); } },
      { key: 'inicio', label: 'Início', sort: function (r) { return r.inicio; }, render: function (r) { return U.fmtDate(r.inicio); } },
      { key: 'fim', label: 'Fim', sort: function (r) { return r.fim; }, render: function (r) { return U.fmtDate(r.fim); } },
      { key: 'turmas', label: 'Turmas', sort: function (r) { return D.turmasDoPeriodo(r.id).length; },
        render: function (r) { return countPill('users', D.turmasDoPeriodo(r.id).length, 'turma', 'turmas'); } },
      { key: 'status', label: 'Situação', sort: function (r) { return D.periodoStatus(r); },
        render: function (r) { return ui().periodoBadge(D.periodoStatus(r)); } }
    ],
    defaultSort: 'nome', defaultDir: 'desc',
    deleteGuard: function (r) {
      var t = D.turmasDoPeriodo(r.id).length;
      if (t) return { message: 'Este período possui ' + U.plural(t, 'turma vinculada', 'turmas vinculadas') + '. Exclua ou mova as turmas antes de excluir o período.', linkText: 'Ver turmas do período', linkHref: '#/turmas?periodo=' + r.id, linkIcon: 'users' };
      return null;
    }
  };

  /* ---------- Alunos ---------- */
  E.alunos = {
    collection: 'alunos', title: 'Alunos', singular: 'aluno', gender: 'm', icon: 'user',
    lead: 'Cadastre os alunos e indique a turma de cada um.',
    fields: [
      { name: 'nome', label: 'Nome completo', required: true, reqMsg: 'Informe o nome do aluno.', minLength: 3, maxlength: 80, placeholder: 'Ex.: Maria Souza Lima', autocomplete: 'off' },
      { name: 'matricula', label: 'Matrícula', required: true, half: true, reqMsg: 'Informe a matrícula.', maxlength: 12, placeholder: 'Ex.: 202601009', hint: 'De 6 a 12 números.',
        validate: function (v) { return /^\d{6,12}$/.test(v) ? null : 'A matrícula deve ter de 6 a 12 números.'; } },
      { name: 'turmaId', label: 'Turma', type: 'select', required: true, half: true, reqMsg: 'Selecione a turma do aluno.', placeholder: 'Selecione…', options: turmaOptions }
    ],
    uniques: [{ field: 'matricula', check: unique('alunos', 'matricula', 'Esta matrícula já pertence a outro aluno.') }],
    search: function (r) { var t = D.turma(r.turmaId); return r.nome + ' ' + r.matricula + ' ' + (t ? t.nome : ''); },
    filters: [
      { name: 'curso', label: 'Curso', options: cursoOptions, match: function (r, v) { var t = D.turma(r.turmaId); return t && t.cursoId === v; } },
      { name: 'turma', label: 'Turma', options: turmaOptions, match: function (r, v) { return r.turmaId === v; } }
    ],
    columns: [
      { key: 'nome', label: 'Aluno', primary: true, sort: function (r) { return r.nome; },
        render: function (r) { return cell(r.nome, 'Matrícula ' + esc(r.matricula), ui().avatar(r.nome, 'sm')); } },
      { key: 'turma', label: 'Turma', sort: function (r) { var t = D.turma(r.turmaId); return t ? t.nome : ''; },
        render: function (r) { var t = D.turma(r.turmaId); return t ? esc(t.nome) : '—'; } },
      { key: 'curso', label: 'Curso', sort: function (r) { var t = D.turma(r.turmaId); var c = t && D.curso(t.cursoId); return c ? c.codigo : ''; },
        render: function (r) { var t = D.turma(r.turmaId); return ui().courseChip(t ? D.curso(t.cursoId) : null); } },
      { key: 'turno', label: 'Turno', sort: function (r) { var t = D.turma(r.turmaId); return t ? t.turno : ''; },
        render: function (r) { var t = D.turma(r.turmaId); return t ? ui().turnoBadge(t.turno) : '—'; } }
    ],
    defaultSort: 'nome',
    deleteGuard: function () { return null; }
  };

  /* ---------- Professores ---------- */
  E.professores = {
    collection: 'professores', title: 'Professores', singular: 'professor', gender: 'm', icon: 'idCard',
    lead: 'Cadastre os professores que usam o sistema.',
    fields: [
      { name: 'nome', label: 'Nome completo', required: true, reqMsg: 'Informe o nome do professor.', minLength: 3, maxlength: 80, placeholder: 'Ex.: Marina Lopes Andrade', autocomplete: 'name' },
      { name: 'email', label: 'E-mail', type: 'email', required: true, reqMsg: 'Informe o e-mail.', maxlength: 80, placeholder: 'nome@escola.com', autocomplete: 'email' },
      { name: 'area', label: 'Área de atuação', required: true, half: true, reqMsg: 'Informe a área de atuação.', maxlength: 60, placeholder: 'Ex.: Banco de Dados' },
      { name: 'titulacao', label: 'Titulação', type: 'select', required: true, half: true, reqMsg: 'Selecione a titulação.', placeholder: 'Selecione…', options: function () { return list(D.TITULACOES); } }
    ],
    uniques: [{ field: 'email', check: unique('professores', 'email', 'Este e-mail já está cadastrado.') }],
    search: function (r) { return r.nome + ' ' + r.email + ' ' + r.area; },
    filters: [{ name: 'titulacao', label: 'Titulação', options: function () { return list(D.TITULACOES); }, match: function (r, v) { return r.titulacao === v; } }],
    columns: [
      { key: 'nome', label: 'Professor', primary: true, sort: function (r) { return r.nome; },
        render: function (r) {
          var me = TC.app.currentProf();
          return cell(r.nome, esc(r.email), ui().avatar(r.nome, 'sm')) + (me && me.id === r.id ? ' <span class="badge badge-accent">' + I('user') + 'Você</span>' : '');
        } },
      { key: 'area', label: 'Área', sort: function (r) { return r.area; }, render: function (r) { return esc(r.area); } },
      { key: 'titulacao', label: 'Titulação', sort: function (r) { return D.TITULACOES.indexOf(r.titulacao); }, render: function (r) { return esc(r.titulacao); } },
      { key: 'aulas', label: 'Alocações', sort: function (r) { return D.alocacoesDoProfessor(r.id).length; },
        render: function (r) { return countPill('link', D.alocacoesDoProfessor(r.id).length, 'alocação', 'alocações'); } }
    ],
    defaultSort: 'nome',
    deleteGuard: function (r) {
      var me = TC.app.currentProf();
      if (me && me.id === r.id) return { message: 'Você está conectado com este perfil. Troque de professor antes de excluí-lo.' };
      var a = D.alocacoesDoProfessor(r.id).length;
      if (a) return { message: 'Este professor possui ' + U.plural(a, 'alocação vinculada', 'alocações vinculadas') + ' (matérias e turmas). Exclua as alocações antes de excluir o professor.', linkText: 'Ver alocações', linkHref: '#/alocacoes?professor=' + r.id, linkIcon: 'link' };
      return null;
    }
  };

  /* ---------- Alocações (professor × matéria × turma) ---------- */
  E.alocacoes = {
    collection: 'alocacoes', title: 'Alocações', singular: 'alocação', gender: 'f', icon: 'link',
    lead: 'Defina qual professor leciona cada matéria em cada turma, com os horários semanais e a sala.',
    fields: [
      { name: 'professorId', label: 'Professor', type: 'select', required: true, reqMsg: 'Selecione o professor.', placeholder: 'Selecione o professor…', options: function () { return opt(D.professoresSorted()); } },
      { name: 'materiaId', label: 'Matéria', type: 'select', required: true, reqMsg: 'Selecione a matéria.', placeholder: 'Selecione a matéria…', options: materiaOptions },
      { name: 'turmaId', label: 'Turma', type: 'select', required: true, half: true, reqMsg: 'Selecione a turma.', placeholder: 'Selecione…', options: turmaOptions,
        hint: 'Precisa ser do mesmo curso da matéria.',
        validate: function (v, values) {
          var m = D.materia(values.materiaId), t = D.turma(v);
          return m && t && m.cursoId !== t.cursoId ? 'Esta turma é de outro curso. Escolha uma turma do mesmo curso da matéria.' : null;
        } },
      { name: 'sala', label: 'Sala', required: true, half: true, reqMsg: 'Informe a sala.', maxlength: 40, placeholder: 'Ex.: Laboratório 2', hint: 'Sala ou laboratório.' },
      { name: 'horarios', label: 'Horários semanais', type: 'schedule', required: true, reqMsg: 'Adicione pelo menos um horário semanal.' }
    ],
    uniques: [{ field: 'materiaId', check: function (v, values, id) {
      return S.all('alocacoes').some(function (a) { return a.id !== id && a.materiaId === v && a.turmaId === values.turmaId; })
        ? 'Esta matéria já está alocada para esta turma.' : null;
    } }],
    search: function (r) {
      var p = D.professor(r.professorId), m = D.materia(r.materiaId), t = D.turma(r.turmaId);
      return [p && p.nome, m && m.nome, t && t.nome, r.sala].join(' ');
    },
    filters: [
      { name: 'professor', label: 'Professor', options: function () { return opt(D.professoresSorted()); }, match: function (r, v) { return r.professorId === v; } },
      { name: 'materia', label: 'Matéria', options: materiaOptions, match: function (r, v) { return r.materiaId === v; } }
    ],
    columns: [
      { key: 'materia', label: 'Matéria', primary: true, sort: function (r) { var m = D.materia(r.materiaId); return m ? m.nome : ''; },
        render: function (r) {
          var m = D.materia(r.materiaId), t = D.turma(r.turmaId);
          return cell(m ? m.nome : '—', (t ? esc(t.nome) : '') + ' · ' + U.plural((r.plano || []).length, 'etapa no plano', 'etapas no plano'));
        } },
      { key: 'professor', label: 'Professor', sort: function (r) { var p = D.professor(r.professorId); return p ? p.nome : ''; },
        render: function (r) { var p = D.professor(r.professorId); return p ? esc(p.nome) : '—'; } },
      { key: 'horarios', label: 'Horários', sort: function (r) { return (r.horarios || []).length; },
        render: function (r) { return (r.horarios || []).map(function (h) { return '<span class="nowrap">' + esc(D.horarioLabel(h)) + '</span>'; }).join('<br>'); } },
      { key: 'sala', label: 'Sala', sort: function (r) { return r.sala; }, render: function (r) { return esc(r.sala); } }
    ],
    defaultSort: 'materia',
    deleteMessage: 'O plano de aula desta alocação também será excluído.',
    beforeSave: function (values, existing) {
      if (!existing) values.plano = [];
      values.horarios = values.horarios.map(function (h) { return { dia: Number(h.dia), inicio: h.inicio, fim: h.fim }; });
      return values;
    },
    deleteGuard: function () { return null; }
  };

  /** Human readable name of a record (used in dialogs and palette). */
  E.alocacoes.nameOf = function (r) {
    var m = D.materia(r.materiaId), t = D.turma(r.turmaId);
    return (m ? m.nome : 'Alocação') + (t ? ' — ' + t.nome : '');
  };

  TC.entities = E;
})(window.TC);
