// ═══════════════════════════════════════════════
// ui.js — Componentes de UI: Toast, Spinner, Modal
// ═══════════════════════════════════════════════

// ── TOAST ────────────────────────────────────
let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
}

const TOAST_ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

/**
 * Exibe uma notificação toast
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration - ms
 */
export function toast(message, type = 'info', duration = 4000) {
  ensureContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type]}</span>
    <span class="toast-msg">${message}</span>
  `;
  toastContainer.appendChild(el);

  const remove = () => {
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  };

  const timer = setTimeout(remove, duration);
  el.addEventListener('click', () => { clearTimeout(timer); remove(); });
}

// ── BUTTON LOADING ───────────────────────────
/**
 * Coloca o botão em estado de loading e retorna função para restaurar
 */
export function setButtonLoading(btn, loadingText = 'Aguarde...') {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<div class="spinner"></div><span>${loadingText}</span>`;
  return () => {
    btn.disabled = false;
    btn.innerHTML = original;
  };
}

// ── MODAL ────────────────────────────────────
export function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Fechar modal ao clicar no backdrop
export function initModalClose() {
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-backdrop');
      if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

// ── FORM VALIDATION UI ───────────────────────
export function setFieldState(input, isValid, errorMsg = '') {
  const errorEl = input.closest('.form-group')?.querySelector('.form-error');
  if (isValid) {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    if (errorEl) errorEl.classList.remove('visible');
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    if (errorEl && errorMsg) {
      errorEl.textContent = errorMsg;
      errorEl.classList.add('visible');
    }
  }
}

export function resetFieldState(input) {
  input.classList.remove('is-valid', 'is-invalid');
  const errorEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errorEl) errorEl.classList.remove('visible');
}

// ── PAGE GUARD ───────────────────────────────
/**
 * Verifica sessão e redireciona se não autenticado ou sem permissão
 */
import { getSession, hasSession } from './cookies.js';
import { supabase } from './supabase.js';

export async function requireAuth(redirectTo = '/login.html') {
  if (!hasSession()) {
    window.location.href = redirectTo;
    return null;
  }
  return getSession();
}

export async function requireAdmin(redirectTo = '/dashboard.html') {
  const session = await requireAuth('/login.html');
  if (!session) return null;

  if (session.role !== 'admin') {
    window.location.href = redirectTo;
    return null;
  }

  // Double-check no banco (nunca confiar só no cookie)
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.userId)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    window.location.href = redirectTo;
    return null;
  }

  return session;
}

export async function redirectIfLoggedIn(to = '/dashboard.html') {
  if (!hasSession()) return;
  const session = getSession();
  window.location.href = session?.role === 'admin' ? '/admin.html' : to;
}
