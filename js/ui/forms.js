/* Declarative forms: render, read, validate and show accessible errors
   (inline message + summary at the top + focus on the first invalid field). */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var esc = TC.util.esc;
  var I = TC.icon;
  var DIAS = [1, 2, 3, 4, 5, 6];

  function fid(prefix, name) { return prefix + '-' + name; }

  function optionsHtml(field, value) {
    var opts = typeof field.options === 'function' ? field.options() : (field.options || []);
    var html = '<option value="">' + esc(field.placeholder || 'Selecione…') + '</option>';
    var groups = {};
    var order = [];
    opts.forEach(function (o) {
      var g = o.group || '';
      if (!groups[g]) { groups[g] = []; order.push(g); }
      groups[g].push(o);
    });
    order.forEach(function (g) {
      var inner = groups[g].map(function (o) {
        return '<option value="' + esc(o.value) + '"' + (String(o.value) === String(value) ? ' selected' : '') + '>' + esc(o.label) + '</option>';
      }).join('');
      html += g ? '<optgroup label="' + esc(g) + '">' + inner + '</optgroup>' : inner;
    });
    return html;
  }

  function scheduleRow(prefix, i, h) {
    h = h || { dia: '', inicio: '', fim: '' };
    var base = prefix + '-h' + i;
    return '<div class="sched-row" data-row>' +
      '<div class="field"><label for="' + base + '-dia">Dia</label>' +
      '<select class="select" id="' + base + '-dia" data-k="dia">' +
      '<option value="">Dia…</option>' +
      DIAS.map(function (d) { return '<option value="' + d + '"' + (String(h.dia) === String(d) ? ' selected' : '') + '>' + TC.util.DIAS[d] + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="field"><label for="' + base + '-ini">Início</label><input class="input" type="time" id="' + base + '-ini" data-k="inicio" value="' + esc(h.inicio) + '"></div>' +
      '<div class="field"><label for="' + base + '-fim">Fim</label><input class="input" type="time" id="' + base + '-fim" data-k="fim" value="' + esc(h.fim) + '"></div>' +
      '<button type="button" class="icon-btn danger" data-remove-row aria-label="Remover horário ' + (i + 1) + '">' + I('trash') + '</button>' +
      '</div>';
  }

  function fieldHtml(prefix, f, value) {
    var id = fid(prefix, f.name);
    var described = [];
    if (f.hint) described.push(id + '-hint');
    described.push(id + '-err');
    var common = 'id="' + id + '" name="' + esc(f.name) + '" aria-describedby="' + described.join(' ') + '"' +
      (f.required ? ' aria-required="true"' : '') +
      (f.autocomplete ? ' autocomplete="' + f.autocomplete + '"' : '');
    var control;
    var v = value == null ? '' : value;

    if (f.type === 'select') {
      control = '<select class="select" ' + common + '>' + optionsHtml(f, v) + '</select>';
    } else if (f.type === 'textarea') {
      control = '<textarea class="textarea" rows="' + (f.rows || 4) + '" ' + common +
        (f.maxlength ? ' maxlength="' + f.maxlength + '"' : '') +
        (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') + '>' + esc(v) + '</textarea>';
    } else if (f.type === 'schedule') {
      var rows = (v && v.length ? v : [null]);
      control = '<div class="sched-list" id="' + id + '" data-schedule role="group" aria-labelledby="' + id + '-label" aria-describedby="' + described.join(' ') + '">' +
        rows.map(function (h, i) { return scheduleRow(prefix, i, h); }).join('') + '</div>' +
        '<div><button type="button" class="btn btn-sm" data-add-row>' + I('plus') + 'Adicionar horário</button></div>';
    } else {
      var type = f.type || 'text';
      control = '<input class="input" type="' + type + '" ' + common + ' value="' + esc(v) + '"' +
        (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
        (f.min != null ? ' min="' + f.min + '"' : '') +
        (f.max != null ? ' max="' + f.max + '"' : '') +
        (f.maxlength ? ' maxlength="' + f.maxlength + '"' : '') +
        (type === 'number' ? ' inputmode="numeric"' : '') + '>';
    }

    var label = f.type === 'schedule'
      ? '<span class="field-label" id="' + id + '-label">' + esc(f.label) + (f.required ? '<span class="req" aria-hidden="true">*</span>' : '') + '</span>'
      : '<label for="' + id + '">' + esc(f.label) + (f.required ? '<span class="req" aria-hidden="true">*</span><span class="sr-only"> (obrigatório)</span>' : '') + '</label>';

    return '<div class="field" data-field="' + esc(f.name) + '">' + label +
      (f.hint ? '<span class="field-hint" id="' + id + '-hint">' + esc(f.hint) + '</span>' : '') +
      control +
      '<p class="field-error" id="' + id + '-err" hidden></p>' +
      '</div>';
  }

  /** Renders fields; consecutive `half` fields are paired in a 2-column row. */
  function render(prefix, fields, values) {
    values = values || {};
    var out = '<div class="form-summary" id="' + prefix + '-summary" tabindex="-1" hidden></div>' +
      '<p class="form-note">Campos marcados com <span class="req" aria-hidden="true">*</span> são obrigatórios.</p>';
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      if (f.half && fields[i + 1] && fields[i + 1].half) {
        out += '<div class="form-row-2">' + fieldHtml(prefix, f, values[f.name]) + fieldHtml(prefix, fields[i + 1], values[fields[i + 1].name]) + '</div>';
        i++;
      } else {
        out += fieldHtml(prefix, f, values[f.name]);
      }
    }
    return '<div class="form-grid">' + out + '</div>';
  }

  function readSchedule(container) {
    return Array.prototype.map.call(container.querySelectorAll('[data-row]'), function (row) {
      return {
        dia: Number(row.querySelector('[data-k="dia"]').value) || '',
        inicio: row.querySelector('[data-k="inicio"]').value,
        fim: row.querySelector('[data-k="fim"]').value
      };
    });
  }

  function read(form, prefix, fields) {
    var values = {};
    fields.forEach(function (f) {
      var el = form.querySelector('#' + fid(prefix, f.name));
      if (!el) return;
      if (f.type === 'schedule') { values[f.name] = readSchedule(el); return; }
      var v = el.value;
      if (f.type === 'number') values[f.name] = v === '' ? '' : Number(v);
      else if (f.type === 'textarea') values[f.name] = v.trim();
      else values[f.name] = typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : v;
      if (f.transform) values[f.name] = f.transform(values[f.name]);
    });
    return values;
  }

  function isEmpty(f, v) {
    if (f.type === 'schedule') return !v || !v.some(function (h) { return h.dia || h.inicio || h.fim; });
    return v === '' || v == null;
  }

  function validateField(f, v, values) {
    if (f.required && isEmpty(f, v)) return f.reqMsg || 'Preencha este campo.';
    if (isEmpty(f, v)) return null;
    if (f.type === 'number') {
      if (isNaN(v)) return 'Digite apenas números.';
      if (f.min != null && v < f.min) return 'O valor mínimo é ' + f.min + '.';
      if (f.max != null && v > f.max) return 'O valor máximo é ' + f.max + '.';
    }
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Digite um e-mail válido, por exemplo: nome@escola.com.';
    if (f.minLength && String(v).length < f.minLength) return 'Use pelo menos ' + f.minLength + ' caracteres.';
    if (f.type === 'schedule') {
      for (var i = 0; i < v.length; i++) {
        var h = v[i];
        if (!h.dia || !h.inicio || !h.fim) return 'Complete o dia, o início e o fim do horário ' + (i + 1) + '.';
        if (TC.util.toMin(h.fim) <= TC.util.toMin(h.inicio)) return 'No horário ' + (i + 1) + ', o fim precisa ser depois do início.';
      }
    }
    if (f.validate) return f.validate(v, values) || null;
    return null;
  }

  function validate(fields, values) {
    var errors = [];
    fields.forEach(function (f) {
      var msg = validateField(f, values[f.name], values);
      if (msg) errors.push({ name: f.name, label: f.label, message: msg });
    });
    return errors;
  }

  function focusTarget(form, prefix, name) {
    var el = form.querySelector('#' + fid(prefix, name));
    if (el && el.hasAttribute('data-schedule')) {
      var bad = Array.prototype.filter.call(el.querySelectorAll('select, input'), function (x) { return !x.value; })[0];
      return bad || el.querySelector('select, input');
    }
    return el;
  }

  function setFieldError(form, prefix, f, msg) {
    var id = fid(prefix, f.name);
    var err = form.querySelector('#' + id + '-err');
    var ctl = form.querySelector('#' + id);
    if (!err || !ctl) return;
    var controls = ctl.hasAttribute('data-schedule') ? ctl.querySelectorAll('select, input') : [ctl];
    if (msg) {
      err.innerHTML = I('alertCircle') + '<span>' + esc(msg) + '</span>';
      err.hidden = false;
      Array.prototype.forEach.call(controls, function (c) { c.setAttribute('aria-invalid', 'true'); });
    } else {
      err.hidden = true;
      err.innerHTML = '';
      Array.prototype.forEach.call(controls, function (c) { c.removeAttribute('aria-invalid'); });
    }
  }

  function renderSummary(form, prefix, errors) {
    var box = form.querySelector('#' + prefix + '-summary');
    if (!box) return;
    if (!errors.length) { box.hidden = true; box.removeAttribute('role'); box.innerHTML = ''; return; }
    box.setAttribute('role', 'alert');
    box.innerHTML = '<p class="fs-title">' + I('alertCircle') + 'Não foi possível salvar. ' +
      (errors.length === 1 ? 'Corrija 1 campo:' : 'Corrija ' + errors.length + ' campos:') + '</p>' +
      '<ul>' + errors.map(function (e) {
        return '<li><button type="button" data-goto="' + esc(e.name) + '">' + esc(e.label) + ': ' + esc(e.message) + '</button></li>';
      }).join('') + '</ul>';
    box.hidden = false;
  }

  /**
   * Wires a <form>: submit validation, live re-validation after the first attempt,
   * schedule rows and summary links. `onValid(values)` may return an array of
   * extra errors (e.g. uniqueness) to block the save.
   */
  function bind(form, prefix, fields, onValid) {
    var attempted = false;

    function check(focus) {
      var values = read(form, prefix, fields);
      var errors = validate(fields, values);
      return { values: values, errors: errors, focus: focus };
    }

    function show(errors, focus) {
      fields.forEach(function (f) {
        var e = errors.filter(function (x) { return x.name === f.name; })[0];
        setFieldError(form, prefix, f, e ? e.message : null);
      });
      renderSummary(form, prefix, errors);
      if (focus && errors.length) {
        var t = focusTarget(form, prefix, errors[0].name);
        if (t) t.focus();
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      attempted = true;
      var r = check();
      if (!r.errors.length) {
        var extra = onValid(r.values) || [];
        if (extra.length) { show(extra, true); TC.toast.error('Revise o formulário', extra[0].message); }
        return;
      }
      show(r.errors, true);
    });

    function live() {
      if (!attempted) return;
      show(check().errors, false);
    }
    form.addEventListener('input', TC.util.debounce(live, 150));
    form.addEventListener('change', live);

    form.addEventListener('click', function (e) {
      var go = e.target.closest('[data-goto]');
      if (go) {
        var t = focusTarget(form, prefix, go.getAttribute('data-goto'));
        if (t) { t.focus(); t.scrollIntoView({ block: 'center', behavior: TC.util.reducedMotion() ? 'auto' : 'smooth' }); }
        return;
      }
      var add = e.target.closest('[data-add-row]');
      if (add) {
        var list = add.parentElement.previousElementSibling;
        var n = list.querySelectorAll('[data-row]').length;
        if (n >= 4) { TC.toast.info('Limite de horários', 'Cada alocação pode ter até 4 horários por semana.'); return; }
        list.insertAdjacentHTML('beforeend', scheduleRow(prefix, n));
        list.lastElementChild.querySelector('select').focus();
        return;
      }
      var rm = e.target.closest('[data-remove-row]');
      if (rm) {
        var listEl = rm.closest('[data-schedule]');
        var rows = listEl.querySelectorAll('[data-row]');
        if (rows.length === 1) {
          Array.prototype.forEach.call(rows[0].querySelectorAll('select, input'), function (c) { c.value = ''; });
          rows[0].querySelector('select').focus();
        } else {
          var next = rm.closest('[data-row]').nextElementSibling || rm.closest('[data-row]').previousElementSibling;
          rm.closest('[data-row]').remove();
          next.querySelector('select').focus();
        }
        live();
      }
    });
  }

  TC.form = { render: render, read: read, validate: validate, bind: bind };
})(window.TC);
