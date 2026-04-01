// ═══════════════════════════════════════════════
// auth.js — Autenticação: login e logout
// ═══════════════════════════════════════════════

import { supabase } from './supabase.js';
import { saveSession, clearAllCookies } from './cookies.js';
import { isCPF, cleanCPF, validateEmail } from './utils.js';
import { toast, setButtonLoading } from './ui.js';

/**
 * Login por CPF ou email + senha
 * Retorna: { success, role, error }
 */
export async function login({ identifier, password }) {
  let email = identifier.trim();

  // Se for CPF → buscar email correspondente
  if (isCPF(identifier)) {
    const cpfClean = cleanCPF(identifier);
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('cpf', cpfClean)
      .maybeSingle();

    // Se CPF não existir → "Senha incorreta" (não revelar que CPF não existe)
    if (error || !data) {
      return { success: false, error: 'Senha incorreta.' };
    }
    email = data.email;
  }

  // Autenticar com Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { success: false, error: 'Senha incorreta.' };
  }

  // Buscar perfil do usuário
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', authData.user.id)
    .maybeSingle();

  console.log('Login profile data:', profile, 'Error:', profileError);

  if (profileError || !profile) {
    return { success: false, error: 'Perfil não encontrado. Contate o suporte.' };
  }

  // Salvar sessão em cookies
  saveSession({
    token:  authData.session.access_token,
    role:   profile.role,
    cpf:    profile.cpf,
    name:   profile.nome,
    userId: authData.user.id,
  });

  return { success: true, role: profile.role };
}

/**
 * Logout — limpa cookies e sessão Supabase
 */
export async function logout() {
  clearAllCookies();
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}

/**
 * Registrar novo usuário
 */
export async function register({ nome, email, cpf, password, nascimento }) {
  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, cpf }
    }
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return { success: false, error: 'Erro ao criar usuário. Tente novamente.' };
  }

  // 2. Inserir perfil
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id:    authData.user.id,
    cpf:        cleanCPF(cpf),
    nome:       nome.trim(),
    email:      email.trim().toLowerCase(),
    nascimento,
    role:       'user',
  });

  if (profileError) {
    // Desfazer criação do auth user (best-effort)
    await supabase.auth.admin?.deleteUser(authData.user.id).catch(() => {});
    if (profileError.code === '23505') {
      return { success: false, error: 'CPF ou e-mail já cadastrado.' };
    }
    return { success: false, error: 'Erro ao salvar perfil. Tente novamente.' };
  }

  return { success: true };
}
