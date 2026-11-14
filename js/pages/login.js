/* Simulated login: choose a demo professor or sign up (RF01). No real authentication. */
window.TC = window.TC || {};
TC.pages = TC.pages || {};

(function (TC) {
  'use strict';

  var U = TC.util;
  var esc = U.esc;
  var I = TC.icon;

  function profileList() {
    return TC.domain.professoresSorted().map(function (p) {
      var r = TC.domain.resumoProfessor(p.id);
      return '<li><button type="button" class="profile-btn" data-login="' + esc(p.id) + '">' +
        TC.ui.avatar(p.nome, 'lg') +
        '<span class="pb-text"><span class="pb-name">' + esc(p.nome) + '</span>' +
        '<span class="pb-sub">' + esc(p.area) + ' · ' + esc(p.titulacao) + '</span>' +
        '<span class="pb-meta">' + U.plural(r.materias, 'matéria', 'matérias') + ' · ' + U.plural(r.turmas, 'turma', 'turmas') + '</span></span>' +
        '<span class="pb-go">' + I('arrowRight') + '<span class="sr-only">Entrar como ' + esc(p.nome) + '</span></span></button></li>';
    }).join('');
  }

  function chooseView() {
    return '<div class="login-card-inner">' +
      '<span class="eyebrow-pill">' + I('sparkle') + 'Protótipo navegável</span>' +
      '<h1 tabindex="-1" data-page-title>Entrar no Teacher Class</h1>' +
      '<p class="login-lead">Escolha um perfil de professor para explorar o sistema.</p>' +
      '<ul class="profile-list" aria-label="Perfis de demonstração">' + profileList() + '</ul>' +
      '<div class="or-sep"><span>ou</span></div>' +
      '<button type="button" class="btn btn-lg btn-block" data-signup>' + I('userPlus') + 'Cadastrar-se como professor</button>' +
      '<p class="login-note">' + I('shield') + 'Acesso simulado, sem senha. Os dados ficam apenas neste navegador.</p>' +
      '</div>';
  }

  function signupView() {
    var fields = TC.entities.professores.fields;
    return '<div class="login-card-inner">' +
      '<button type="button" class="btn btn-ghost btn-sm back-btn" data-back>' + I('chevronLeft') + 'Voltar aos perfis</button>' +
      '<h1 tabindex="-1" data-page-title>Criar seu cadastro</h1>' +
      '<p class="login-lead">Preencha seus dados para começar. Você aparecerá na lista de professores.</p>' +
      '<form id="signup-form" novalidate>' + TC.form.render('su', fields, {}) +
      '<button type="submit" class="btn btn-primary btn-lg btn-block signup-submit">' + I('check') + 'Cadastrar e entrar</button>' +
      '</form></div>';
  }

  TC.pages.login = function (app) {
    app.innerHTML =
      '<div class="login">' +
      '<section class="login-brand" aria-label="Sobre o Teacher Class">' +
      '<div class="lb-inner">' +
      '<div class="logo-badge">' + TC.ui.logoFull() + '</div>' +
      '<p class="lb-title">Seu planejamento acadêmico, organizado em um só lugar.</p>' +
      '<ul class="lb-features">' +
      '<li>' + I('layers') + '<span><strong>Cursos, matérias e turmas</strong> com vínculos claros</span></li>' +
      '<li>' + I('bookOpen') + '<span><strong>Plano de aula</strong> semana a semana</span></li>' +
      '<li>' + I('calendar') + '<span><strong>Agenda semanal</strong> com o total de aulas previstas</span></li>' +
      '</ul>' +
      '<p class="lb-foot">Equipe 6I · Análise e Desenvolvimento de Sistemas</p>' +
      '</div></section>' +
      '<main class="login-main" id="main" tabindex="-1">' +
      '<button type="button" class="icon-btn bordered theme-toggle login-theme" data-theme-toggle aria-label="Tema escuro" aria-pressed="' +
      (document.documentElement.getAttribute('data-theme') === 'dark') + '">' + I('sun', { cls: 'icon-sun' }) + I('moon', { cls: 'icon-moon' }) + '</button>' +
      '<div class="login-card" id="login-card">' + chooseView() + '</div>' +
      '</main></div>';

    var card = app.querySelector('#login-card');

    function swap(html) {
      card.innerHTML = html;
      card.classList.remove('swap-in');
      void card.offsetWidth;
      card.classList.add('swap-in');
      card.querySelector('[data-page-title]').focus();
    }

    function bindSignup() {
      var form = card.querySelector('#signup-form');
      var cfg = TC.entities.professores;
      TC.form.bind(form, 'su', cfg.fields, function (values) {
        var dup = cfg.uniques[0].check(values.email, values, null);
        if (dup) return [{ name: 'email', label: 'E-mail', message: dup }];
        var rec = TC.store.insert('professores', values);
        TC.toast.success('Cadastro realizado!', 'Bem-vindo(a), ' + U.firstName(rec.nome) + '. Seu perfil já aparece na lista de professores.');
        TC.app.login(rec.id);
        return [];
      });
    }

    app.querySelector('.login').addEventListener('click', function (e) {
      var t = e.target.closest('[data-login], [data-signup], [data-back], [data-theme-toggle]');
      if (!t) return;
      if (t.hasAttribute('data-theme-toggle')) { TC.app.toggleTheme(); return; }
      if (t.hasAttribute('data-login')) {
        var p = TC.domain.professor(t.getAttribute('data-login'));
        TC.toast.success('Olá, ' + U.firstName(p.nome) + '!', 'Você entrou como ' + p.nome + '.');
        TC.app.login(p.id);
      } else if (t.hasAttribute('data-signup')) {
        swap(signupView());
        bindSignup();
      } else if (t.hasAttribute('data-back')) {
        swap(chooseView());
      }
    });
  };
})(window.TC);
