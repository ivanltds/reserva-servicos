import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, withTimeout } from "../services/supabase";

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega os dados adicionais de perfil do banco
  async function loadProfile(userId) {
    try {
      const fetchPromise = (async () => {
        // maybeSingle() retorna null (sem erro 406) quando nenhum perfil é encontrado
        const { data, error } = await supabase
          .from("profiles")
          .select("name, role, cpf, phone")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.warn("Erro ao buscar perfil:", error.message);
          throw error;
        }
        return data;
      })();

      const data = await withTimeout(fetchPromise, 20000, "Erro ao carregar perfil (timeout).");
      setProfile(data ?? null);
      return data;
    } catch (err) {
      console.error("Erro inesperado ao buscar perfil:", err);
      setProfile(null);
      return null;
    }
  }

  useEffect(() => {
    // 1. Verificar a sessão inicial ativa
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        // Sessão órfã: JWT válido mas sem perfil no banco (ex: banco foi resetado)
        // Faz signOut automático para limpar o estado corrompido
        if (!profile) {
          console.warn("Sessão órfã detectada (sem perfil no banco). Fazendo signOut automático.");
          await supabase.auth.signOut();
          localStorage.removeItem("candidate_session");
        }
      }
      setLoading(false);
    });

    // 2. Escutar mudanças de estado de autenticação (Sign In, Sign Out, Token Expired)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setLoading(true);
        await loadProfile(session.user.id);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
