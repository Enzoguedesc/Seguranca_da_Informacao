// ═══════════════════════════════════════════════
// cookies.js — Gerenciamento seguro de cookies
// ═══════════════════════════════════════════════

const COOKIE_PREFIX = 'logi_';

/**
 * Define um cookie com flags de segurança
 * @param {string} name   - Nome do cookie
 * @param {string} value  - Valor
 * @param {number} days   - Expiração em dias (0 = sessão)
 */
export function setCookie(name, value, days = 7) {
  let expires = '';
  if (days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${d.toUTCString()}`;
  }
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_PREFIX}${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Strict${secure}`;
}

/**
 * Lê o valor de um cookie
 * @param {string} name
 * @returns {string|null}
 */
export function getCookie(name) {
  const key = `${COOKIE_PREFIX}${name}=`;
  const cookies = document.cookie.split(';');
  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(key)) {
      try {
        return decodeURIComponent(c.substring(key.length));
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Remove um cookie
 * @param {string} name
 */
export function deleteCookie(name) {
  document.cookie = `${COOKIE_PREFIX}${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
}

/**
 * Remove todos os cookies da aplicação
 */
export function clearAllCookies() {
  ['session_token', 'user_role', 'user_cpf', 'user_name', 'user_id'].forEach(deleteCookie);
}

/**
 * Salva a sessão do usuário em cookies
 */
export function saveSession({ token, role, cpf, name, userId }) {
  setCookie('session_token', token, 7);
  setCookie('user_role', role, 7);
  setCookie('user_cpf', cpf, 7);
  setCookie('user_name', name, 7);
  setCookie('user_id', userId, 7);
}

/**
 * Retorna os dados da sessão atual dos cookies
 */
export function getSession() {
  const token = getCookie('session_token');
  if (!token) return null;
  return {
    token,
    role: getCookie('user_role'),
    cpf: getCookie('user_cpf'),
    name: getCookie('user_name'),
    userId: getCookie('user_id'),
  };
}

/**
 * Verifica se há sessão ativa
 */
export function hasSession() {
  return !!getCookie('session_token');
}
