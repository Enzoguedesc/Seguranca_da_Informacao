-- ═══════════════════════════════════════════════════════════════
-- LogiTrack — Setup completo do banco de dados Supabase
-- Execute este script no SQL Editor do seu projeto Supabase
-- ═══════════════════════════════════════════════════════════════

-- ── 1. TABELA PROFILES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  cpf        TEXT PRIMARY KEY,
  user_id    UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  nascimento DATE NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance em buscas frequentes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id  ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email    ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role     ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created  ON public.profiles(created_at DESC);

-- ── 2. TRIGGER: updated_at automático ────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── 3. ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover policies antigas (evitar conflitos)
DROP POLICY IF EXISTS "user_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "admin_select_all"  ON public.profiles;
DROP POLICY IF EXISTS "user_update_own"   ON public.profiles;
DROP POLICY IF EXISTS "admin_update_all"  ON public.profiles;
DROP POLICY IF EXISTS "service_insert"    ON public.profiles;
DROP POLICY IF EXISTS "service_all"       ON public.profiles;

-- Usuário vê apenas o próprio perfil
CREATE POLICY "user_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Admin vê todos os perfis
CREATE POLICY "admin_select_all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Usuário atualiza apenas o próprio perfil (exceto role)
CREATE POLICY "user_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
  );

-- Admin pode atualizar qualquer perfil (inclusive role)
CREATE POLICY "admin_update_all"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );

-- Insert permitido via service role (durante registro)
CREATE POLICY "insert_own_profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── 4. FUNÇÃO: buscar email por CPF (para login) ──────────────
-- Usada para lookup seguro de email via CPF sem expor dados
CREATE OR REPLACE FUNCTION public.get_email_by_cpf(p_cpf TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- roda com permissões do dono da função
AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT email INTO v_email
  FROM public.profiles
  WHERE cpf = p_cpf
  LIMIT 1;
  RETURN v_email;
END;
$$;

-- Garantir que apenas usuários autenticados possam chamar
REVOKE ALL ON FUNCTION public.get_email_by_cpf FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_email_by_cpf TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_email_by_cpf TO anon; -- necessário para login

-- ── 5. CRIAR PRIMEIRO ADMIN MANUALMENTE ──────────────────────
-- Após criar o primeiro usuário via cadastro normal,
-- execute este comando substituindo o CPF do usuário:
UPDATE public.profiles
SET role = 'admin'
WHERE cpf = '16706319740';

-- ── 6. VERIFICAÇÕES ──────────────────────────────────────────
-- Verifique se tudo foi criado corretamente:
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
