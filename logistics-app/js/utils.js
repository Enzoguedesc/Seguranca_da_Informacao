// ═══════════════════════════════════════════════
// utils.js — Funções utilitárias
// ═══════════════════════════════════════════════

// ── CPF ──────────────────────────────────────
/**
 * Valida CPF pelo algoritmo oficial da Receita Federal
 * @param {string} cpf
 * @returns {boolean}
 */
export function validateCPF(cpf) {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  // Rejeitar CPFs com todos dígitos iguais
  if (/^(\d)\1{10}$/.test(clean)) return false;

  const calc = (len) => {
    let sum = 0;
    for (let i = 0; i < len; i++) {
      sum += parseInt(clean[i]) * (len + 1 - i);
    }
    const rem = (sum * 10) % 11;
    return rem === 10 || rem === 11 ? 0 : rem;
  };

  return calc(9) === parseInt(clean[9]) && calc(10) === parseInt(clean[10]);
}

/**
 * Formata CPF para exibição: 000.000.000-00
 */
export function formatCPF(cpf) {
  const c = cpf.replace(/\D/g, '').slice(0, 11);
  return c
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Remove formatação do CPF
 */
export function cleanCPF(cpf) {
  return cpf.replace(/\D/g, '');
}

/**
 * Determina se a string é CPF ou email
 */
export function isCPF(value) {
  return /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(value.trim());
}

// ── EMAIL ────────────────────────────────────
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ── SENHA ────────────────────────────────────
/**
 * Valida senha: mínimo 8 chars, ao menos 1 letra e 1 número
 */
export function validatePassword(pwd) {
  return pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd);
}

/**
 * Calcula força da senha: 0-4
 */
export function passwordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[!@#$%^&*]/.test(pwd)) score++;
  return Math.min(score, 4);
}

// ── NOME ─────────────────────────────────────
export function validateName(name) {
  return name.trim().length >= 3 && /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name.trim());
}

// ── DATA ─────────────────────────────────────
/**
 * Verifica se o usuário tem ao menos 18 anos
 */
export function validateAge(dateString, minAge = 18) {
  const birth = new Date(dateString);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear()
    - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return age >= minAge;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ── SANITIZAÇÃO ──────────────────────────────
/**
 * Previne XSS — nunca inserir user input diretamente no DOM sem sanitizar
 */
export function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── INICIAIS ─────────────────────────────────
export function getInitials(name) {
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

// ── MÁSCARAS ─────────────────────────────────
export function applyMask(input, formatter) {
  input.addEventListener('input', (e) => {
    const val = formatter(e.target.value);
    e.target.value = val;
  });
}

// ── DEBOUNCE ─────────────────────────────────
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── CAPTCHA ──────────────────────────────────
/**
 * Gera um desafio matemático simples
 * @returns {{ question: string, answer: number }}
 */
export function generateCaptcha() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;

  if (op === '+') {
    a = Math.floor(Math.random() * 9) + 1;
    b = Math.floor(Math.random() * 9) + 1;
    answer = a + b;
  } else if (op === '-') {
    b = Math.floor(Math.random() * 8) + 1;
    a = b + Math.floor(Math.random() * 8) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 6) + 2;
    b = Math.floor(Math.random() * 4) + 2;
    answer = a * b;
  }

  return { question: `${a} ${op} ${b}`, answer };
}
