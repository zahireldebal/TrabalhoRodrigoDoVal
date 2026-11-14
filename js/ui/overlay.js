/* Dialogs, side panels (drawers), bottom sheets and toasts.
   Modal content is rendered outside #app; #app is made inert while open. */
window.TC = window.TC || {};

(function (TC) {
  'use strict';

  var esc = TC.util.esc;
  var I = TC.icon;
  var stack = [];
  var counter = 0;

  function setInert() {
    var app = document.getElementById('app');
    if (app) app.inert = stack.length > 0;
    document.body.classList.toggle('has-overlay', stack.length > 0);
    stack.forEach(function (o, i) { o.el.inert = i !== stack.length - 1; });
  }

  /**
   * Generic overlay.
   * opts: { variant: 'center'|'side'|'sheet'|'palette', role, title, subtitle, headIcon, iconCls,
   *         body, footer, labelledBy, className, onClose, initialFocus, wrapForm }
   */
  function open(opts) {
    var id = 'dlg-' + (++counter);
    var opener = document.activeElement;
    var overlay = document.createElement('div');
    overlay.className = 'overlay overlay-' + (opts.variant || 'center') + (opts.overlayClass ? ' ' + opts.overlayClass : '');

    var head = '';
    if (opts.title) {
      head = '<div class="dialog-head">' +
        (opts.headIcon ? '<span class="' + (opts.iconCls || 'dialog-head-icon') + '">' + I(opts.headIcon) + '</span>' : '') +
        '<div><h2 id="' + id + '-title">' + esc(opts.title) + '</h2>' +
        (opts.subtitle ? '<p id="' + id + '-desc">' + esc(opts.subtitle) + '</p>' : '') + '</div>' +
        (opts.noClose ? '' : '<button type="button" class="icon-btn" data-close aria-label="Fechar">' + I('x') + '</button>') +
        '</div>';
    }

    var inner = head +
      (opts.body != null ? '<div class="dialog-body">' + opts.body + '</div>' : '') +
      (opts.footer ? '<div class="dialog-foot">' + opts.footer + '</div>' : '');

    var tag = opts.wrapForm ? 'form' : 'div';
    overlay.innerHTML = '<' + tag + ' class="dialog ' + (opts.className || '') + '" role="' + (opts.role || 'dialog') +
      '" aria-modal="true" ' + (opts.title ? 'aria-labelledby="' + id + '-title"' : 'aria-label="' + esc(opts.ariaLabel || '') + '"') +
      (opts.subtitle ? ' aria-describedby="' + id + '-desc"' : '') + (opts.wrapForm ? ' novalidate' : '') + '>' +
      (opts.raw || inner) + '</' + tag + '>';

    document.body.appendChild(overlay);
    var dialog = overlay.firstElementChild;
    var closed = false;

    var api = {
      el: overlay,
      dialog: dialog,
      close: function (result) {
        if (closed) return;
        closed = true;
        stack = stack.filter(function (o) { return o !== api; });
        setInert();
        document.removeEventListener('keydown', onKey, true);
        var finish = function () {
          overlay.remove();
          if (opts.onClose) opts.onClose(result);
          if (opener && document.contains(opener) && opener.focus) opener.focus();
        };
        if (TC.util.reducedMotion()) finish();
        else { overlay.classList.add('is-closing'); setTimeout(finish, 180); }
      }
    };

    function onKey(e) {
      if (stack[stack.length - 1] !== api) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); api.close(); }
      else TC.util.trapTab(dialog, e);
    }

    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) api.close(); });
    overlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) api.close();
    });
    document.addEventListener('keydown', onKey, true);

    stack.push(api);
    setInert();

    var target = opts.initialFocus ? dialog.querySelector(opts.initialFocus) : null;
    if (!target) target = TC.util.focusables(dialog)[0] || dialog;
    if (target === dialog) dialog.setAttribute('tabindex', '-1');
    requestAnimationFrame(function () { target.focus(); });

    if (opts.onOpen) opts.onOpen(api);
    return api;
  }

  /** Confirmation dialog → Promise<boolean>. */
  function confirm(o) {
    return new Promise(function (resolve) {
      var result = false;
      var dlg = open({
        role: 'alertdialog',
        title: o.title,
        headIcon: o.icon || 'trash',
        iconCls: 'dialog-icon' + (o.tone ? ' ' + o.tone : ''),
        body: '<p>' + o.message + '</p>',
        footer: '<button type="button" class="btn" data-close>' + esc(o.cancelText || 'Cancelar') + '</button>' +
          '<button type="button" class="btn ' + (o.danger === false ? 'btn-primary' : 'btn-danger') + '" data-ok>' +
          (o.okIcon ? I(o.okIcon) : '') + esc(o.okText || 'Confirmar') + '</button>',
        initialFocus: '[data-close].btn',
        onClose: function () { resolve(result); }
      });
      dlg.el.querySelector('[data-ok]').addEventListener('click', function () { result = true; dlg.close(); });
    });
  }

  /** Informational / blocking dialog with optional action link. */
  function alertDialog(o) {
    var dlg = open({
      role: 'alertdialog',
      title: o.title,
      headIcon: o.icon || 'alert',
      iconCls: 'dialog-icon ' + (o.tone || 'warn'),
      body: o.message,
      footer: (o.linkHref ? '<a class="btn" href="' + esc(o.linkHref) + '" data-close>' + (o.linkIcon ? I(o.linkIcon) : '') + esc(o.linkText) + '</a>' : '') +
        '<button type="button" class="btn btn-brand" data-close>Entendi</button>',
      initialFocus: '.btn-brand'
    });
    return dlg;
  }

  /* ---------- Toasts ---------- */
  function toast(type, title, message) {
    var host = document.getElementById('toasts');
    if (!host) return;
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    if (type === 'error') el.setAttribute('role', 'alert');
    var icon = type === 'error' ? 'alertCircle' : type === 'info' ? 'info' : 'checkCircle';
    var prefix = type === 'error' ? 'Erro: ' : type === 'info' ? 'Aviso: ' : 'Sucesso: ';
    el.innerHTML = '<span class="t-icon">' + I(icon) + '</span>' +
      '<div><span class="t-title"><span class="sr-only">' + prefix + '</span>' + esc(title) + '</span>' +
      (message ? '<span class="t-msg">' + esc(message) + '</span>' : '') + '</div>' +
      '<button type="button" class="icon-btn" aria-label="Fechar notificação">' + I('x') + '</button>';
    host.appendChild(el);
    var timer;
    function dismiss() {
      clearTimeout(timer);
      if (TC.util.reducedMotion()) { el.remove(); return; }
      el.classList.add('is-leaving');
      setTimeout(function () { el.remove(); }, 200);
    }
    el.querySelector('button').addEventListener('click', dismiss);
    el.addEventListener('mouseenter', function () { clearTimeout(timer); });
    el.addEventListener('mouseleave', function () { timer = setTimeout(dismiss, 2500); });
    timer = setTimeout(dismiss, type === 'error' ? 7000 : 4500);
    while (host.children.length > 3) host.firstElementChild.remove();
  }

  TC.ui = TC.ui || {};
  Object.assign(TC.ui, { open: open, confirm: confirm, alert: alertDialog });
  TC.toast = {
    success: function (t, m) { toast('success', t, m); },
    error: function (t, m) { toast('error', t, m); },
    info: function (t, m) { toast('info', t, m); }
  };
})(window.TC);
