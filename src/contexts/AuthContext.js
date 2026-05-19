import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function loadProfile(userId) {
    try {
      const fetchPromise = (async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, role, cpf, phone")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.warn("Erro ao buscar perfil:", error.message);
          throw error;
        }

        if (data) {
          data.is_hybrid = false;
          const [resResident, resProvider] = await Promise.all([
            supabase.from("residents").select("id").eq("id", userId).maybeSingle(),
            supabase.from("service_providers").select("id").eq("id", userId).maybeSingle(),
          ]);

          data.is_client = !!resResident.data;
          data.is_provider = !!resProvider.data;
          
          if (data.is_client && data.is_provider) {
            data.is_hybrid = true;
          }
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        if (!profile) {
          console.warn("Sessão órfã detectada (sem perfil no banco). Fazendo signOut automático.");
          await supabase.auth.signOut();
          localStorage.removeItem("candidate_session");
          localStorage.removeItem("resident_session");
        }
      }
      setLoading(false);
    });

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
        // O redirecionamento explícito no handleSignOut é mais confiável.
        // A limpeza de estado aqui continua sendo uma boa prática.
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem("candidate_session");
    localStorage.removeItem("resident_session");
    // Redirecionamento explícito para garantir a saída da página.
    router.push('/login');
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
